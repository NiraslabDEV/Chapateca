'use server'

import { cookies } from 'next/headers'
import { getRoleFromCookie, ROLES } from '@/lib/roles'
import { prisma } from '@/lib/prisma'
import { revalidatePath } from 'next/cache'

export type DocCategory = 'FINANCEIRO' | 'MANUAIS' | 'ESTRATEGIA'

const CATEGORY_PATHS: Record<DocCategory, string> = {
  FINANCEIRO: '/financas',
  MANUAIS: '/manuais',
  ESTRATEGIA: '/estrategia',
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

function hasAccess(category: DocCategory, role: keyof typeof ROLES) {
  const r = ROLES[role]
  if (category === 'FINANCEIRO') return r.access.financas
  if (category === 'MANUAIS') return r.access.manuais
  return r.access.estrategia
}

export async function createFolderAction(category: DocCategory, name: string, parentId?: string) {
  const store = await cookies()
  const role = getRoleFromCookie(store.get('chapateca-role')?.value)
  if (!role) throw new Error('Não autenticado')
  if (!hasAccess(category, role)) throw new Error('Sem permissão')

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
