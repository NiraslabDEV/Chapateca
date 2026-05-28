'use server'

import { cookies } from 'next/headers'
import { getRoleFromCookie, ROLES } from '@/lib/roles'
import { prisma } from '@/lib/prisma'
import { revalidatePath } from 'next/cache'
import { deleteFileFromDrive } from '@/lib/google-drive'

export type DocCategory =
  | 'FINANCEIRO'
  | 'MANUAIS'
  | 'ESTRATEGIA'
  | 'DIRECAO'
  | 'RH'
  | 'EVENTOS'
  | 'COCO_PRO'

const CATEGORY_PATHS: Record<DocCategory, string> = {
  FINANCEIRO: '/financas',
  MANUAIS:    '/manuais',
  ESTRATEGIA: '/estrategia',
  DIRECAO:    '/direcao',
  RH:         '/rh',
  EVENTOS:    '/eventos',
  COCO_PRO:   '/coco-pro',
}

/** Mapeia DocCategory → flag ModuleKey de acesso. */
const CATEGORY_TO_MODULE: Record<DocCategory, keyof typeof import('@/lib/roles').ROLES[keyof typeof import('@/lib/roles').ROLES]['access']> = {
  FINANCEIRO: 'financas',
  MANUAIS:    'manuais',
  ESTRATEGIA: 'estrategia',
  DIRECAO:    'direcao',
  RH:         'rh',
  EVENTOS:    'eventos',
  COCO_PRO:   'cocoPro',
}

async function ensureUser(roleKey: string) {
  const r = ROLES[roleKey as keyof typeof ROLES]
  if (!r) return `user-${roleKey}`
  try {
    const u = await prisma.user.upsert({
      where: { email: r.email },
      update: {},
      create: { id: `user-${roleKey}`, name: r.name, email: r.email, role: r.dbRole },
    })
    return u.id
  } catch {
    return `user-${roleKey}`
  }
}

async function hasAccess(category: DocCategory, role: keyof typeof ROLES) {
  const r = ROLES[role]
  const moduleKey = CATEGORY_TO_MODULE[category]
  const staticAccess = r.access[moduleKey]

  try {
    const u = await prisma.user.findUnique({
      where: { email: r.email },
      select: {
        accessFinancas: true, accessManuais: true, accessEstrategia: true,
        accessDirecao: true, accessRH: true, accessEventos: true, accessCocoPro: true,
      },
    })
    if (!u) return staticAccess
    const dbValue =
      moduleKey === 'financas'   ? u.accessFinancas
      : moduleKey === 'manuais'    ? u.accessManuais
      : moduleKey === 'estrategia' ? u.accessEstrategia
      : moduleKey === 'direcao'    ? u.accessDirecao
      : moduleKey === 'rh'         ? u.accessRH
      : moduleKey === 'eventos'    ? u.accessEventos
      : moduleKey === 'cocoPro'    ? u.accessCocoPro
      : null
    return dbValue ?? staticAccess
  } catch {
    return staticAccess
  }
}

export async function createFolderAction(category: DocCategory, name: string, parentId?: string) {
  const store = await cookies()
  const role = getRoleFromCookie(store.get('chapateca-role')?.value)
  if (!role) throw new Error('Não autenticado')
  if (!(await hasAccess(category, role))) throw new Error('Sem permissão')

  const userId = await ensureUser(role)

  await prisma.folder.create({
    data: {
      name: name.trim(),
      category,
      createdById: userId,
      ...(parentId ? { parentId } : {}),
    },
  })

  revalidatePath(CATEGORY_PATHS[category])
}

export type DeleteResult = { ok: boolean; error?: string; driveErrors?: number }

/**
 * Apaga uma pasta inteira (incluindo sub-pastas e ficheiros).
 * Quem tem acesso ao módulo pode apagar.
 */
export async function deleteFolderAction(folderId: string): Promise<DeleteResult> {
  const store = await cookies()
  const role = getRoleFromCookie(store.get('chapateca-role')?.value)
  if (!role) return { ok: false, error: 'Não autenticado' }

  try {
    const folder = await prisma.folder.findUnique({
      where: { id: folderId },
      include: {
        files: { select: { id: true, googleDriveId: true } },
        children: {
          include: {
            files: { select: { id: true, googleDriveId: true } },
            children: {
              include: { files: { select: { id: true, googleDriveId: true } } },
            },
          },
        },
      },
    })
    if (!folder) return { ok: false, error: 'Pasta não encontrada' }

    const category = folder.category as DocCategory
    if (!(await hasAccess(category, role))) {
      return { ok: false, error: 'Sem permissão' }
    }

    // Coleciona TODOS os ficheiros (3 níveis) para apagar do Drive depois
    const grandChildren = folder.children.flatMap(c => c.children)
    const allDriveIds: string[] = [
      ...folder.files.map(f => f.googleDriveId),
      ...folder.children.flatMap(c => c.files.map(f => f.googleDriveId)),
      ...grandChildren.flatMap(g => g.files.map(f => f.googleDriveId)),
    ]
    const subFolderIds = folder.children.map(c => c.id)
    const grandFolderIds = grandChildren.map(g => g.id)
    const allFolderIds = [folderId, ...subFolderIds, ...grandFolderIds]

    // 1. Apagar tudo da DB (ordem importante por FKs — netos primeiro, raiz por último)
    await prisma.$transaction([
      prisma.fileLog.deleteMany({ where: { folderId: { in: allFolderIds } } }),
      prisma.folder.deleteMany({ where: { id: { in: grandFolderIds } } }),
      prisma.folder.deleteMany({ where: { id: { in: subFolderIds } } }),
      prisma.folder.delete({ where: { id: folderId } }),
    ])

    // 2. Apagar do Drive (best-effort)
    let driveErrors = 0
    for (const id of allDriveIds) {
      if (id.startsWith('mock-')) continue
      const res = await deleteFileFromDrive(id)
      if (!res.ok) driveErrors++
    }

    // 3. Audit log
    const actor = ROLES[role]
    if (actor) {
      const fileCount = allDriveIds.length
      await prisma.activityLog.create({
        data: {
          actorEmail:  actor.email,
          actorName:   actor.name,
          action:      'folder.delete',
          description: `apagou pasta "${folder.name}"${fileCount ? ` (${fileCount} ficheiro${fileCount !== 1 ? 's' : ''})` : ''}`,
        },
      }).catch(() => { /* sem audit é melhor do que falhar */ })
    }

    revalidatePath(CATEGORY_PATHS[category])
    return { ok: true, driveErrors }
  } catch (err) {
    return { ok: false, error: (err as Error).message }
  }
}

/**
 * Apaga um único ficheiro (FileLog + Drive).
 * Quem tem acesso ao módulo pode apagar.
 */
export async function deleteDocAction(fileLogId: string): Promise<DeleteResult> {
  const store = await cookies()
  const role = getRoleFromCookie(store.get('chapateca-role')?.value)
  if (!role) return { ok: false, error: 'Não autenticado' }

  try {
    const file = await prisma.fileLog.findUnique({
      where: { id: fileLogId },
      select: { id: true, googleDriveId: true, category: true, fileName: true },
    })
    if (!file) return { ok: false, error: 'Ficheiro não encontrado' }
    if (!['FINANCEIRO', 'MANUAIS', 'ESTRATEGIA'].includes(file.category)) {
      return { ok: false, error: 'Categoria não suportada' }
    }
    const category = file.category as DocCategory
    if (!(await hasAccess(category, role))) {
      return { ok: false, error: 'Sem permissão' }
    }

    await prisma.fileLog.delete({ where: { id: fileLogId } })

    let driveErrors = 0
    if (!file.googleDriveId.startsWith('mock-')) {
      const res = await deleteFileFromDrive(file.googleDriveId)
      if (!res.ok) driveErrors++
    }

    const actor = ROLES[role]
    if (actor) {
      await prisma.activityLog.create({
        data: {
          actorEmail:  actor.email,
          actorName:   actor.name,
          action:      'doc.delete',
          description: `apagou ficheiro "${file.fileName}"`,
        },
      }).catch(() => {})
    }

    revalidatePath(CATEGORY_PATHS[category])
    return { ok: true, driveErrors }
  } catch (err) {
    return { ok: false, error: (err as Error).message }
  }
}
