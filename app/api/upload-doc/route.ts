import { NextRequest, NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { getRoleFromCookie, ROLES } from '@/lib/roles'
import { uploadFileToDrive } from '@/lib/google-drive'
import { prisma } from '@/lib/prisma'

const ALLOWED_MIME_TYPES: Record<string, string> = {
  'application/pdf': 'PDF',
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': 'XLSX',
  'application/vnd.ms-excel': 'XLSX',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document': 'DOCX',
  'application/msword': 'DOCX',
}

const VALID_CATEGORIES = ['FINANCEIRO', 'MANUAIS', 'ESTRATEGIA', 'DIRECAO', 'RH', 'EVENTOS', 'COCO_PRO'] as const
type DocCategory = (typeof VALID_CATEGORIES)[number]

const CATEGORY_TO_MODULE: Record<DocCategory, keyof typeof ROLES[keyof typeof ROLES]['access']> = {
  FINANCEIRO: 'financas', MANUAIS: 'manuais', ESTRATEGIA: 'estrategia',
  DIRECAO: 'direcao', RH: 'rh', EVENTOS: 'eventos', COCO_PRO: 'cocoPro',
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

async function ensureRoleUser(roleKey: string) {
  const r = ROLES[roleKey as keyof typeof ROLES]
  if (!r) return { id: `user-${roleKey}` }
  try {
    return await prisma.user.upsert({
      where: { email: r.email },
      update: { name: r.name },
      create: { id: `user-${roleKey}`, name: r.name, email: r.email, role: r.dbRole },
    })
  } catch {
    return { id: `user-${roleKey}` }
  }
}

export async function POST(request: NextRequest) {
  const store = await cookies()
  const role = getRoleFromCookie(store.get('chapateca-role')?.value)
  if (!role) return NextResponse.json({ error: 'Não autenticado' }, { status: 401 })

  const formData = await request.formData()
  const file = formData.get('file') as File | null
  const docTitle = (formData.get('docTitle') as string)?.trim()
  const docType = (formData.get('docType') as string)?.trim() || 'outro'
  const refDateStr = formData.get('refDate') as string
  const categoryRaw = (formData.get('category') as string)?.trim().toUpperCase()
  const folderId = (formData.get('folderId') as string | null)?.trim() || null

  const category: DocCategory = VALID_CATEGORIES.includes(categoryRaw as DocCategory)
    ? (categoryRaw as DocCategory)
    : 'FINANCEIRO'

  if (!(await hasAccess(category, role))) {
    return NextResponse.json({ error: 'Sem permissão' }, { status: 403 })
  }

  if (!file || !docTitle || !refDateStr) {
    return NextResponse.json({ error: 'Campos obrigatórios em falta' }, { status: 400 })
  }

  const fileType = ALLOWED_MIME_TYPES[file.type]
  if (!fileType) {
    return NextResponse.json(
      { error: 'Tipo de ficheiro não suportado. Use PDF, XLSX ou DOCX.' },
      { status: 400 }
    )
  }

  const refDate = new Date(refDateStr)
  const user = await ensureRoleUser(role)
  const buffer = Buffer.from(await file.arrayBuffer())
  const filename = `${refDate.toISOString().slice(0, 7)}_${docType}_${file.name}`

  let driveId: string
  try {
    driveId = await uploadFileToDrive({
      buffer,
      filename,
      mimeType: file.type,
      category,
      activityDate: refDate,
    })
  } catch {
    driveId = `mock-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`
  }

  let logId: string = driveId
  try {
    const log = await prisma.fileLog.create({
      data: {
        googleDriveId: driveId,
        fileName: file.name,
        activityName: docTitle,
        fileType,
        mimeType: file.type,
        fileSize: file.size,
        category,
        location: docType,
        activityDate: refDate,
        uploadedById: user.id,
        ...(folderId ? { folderId } : {}),
      },
    })
    logId = log.id
  } catch (e) {
    console.error('[upload-doc] DB error:', e)
  }

  return NextResponse.json({ success: true, id: logId })
}
