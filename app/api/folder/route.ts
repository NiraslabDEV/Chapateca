import { NextRequest, NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { getRoleFromCookie, ROLES } from '@/lib/roles'
import { prisma } from '@/lib/prisma'

const VALID_CATEGORIES = ['FINANCEIRO', 'MANUAIS', 'ESTRATEGIA'] as const
type DocCategory = (typeof VALID_CATEGORIES)[number]

function hasAccess(category: DocCategory, role: keyof typeof ROLES) {
  const r = ROLES[role]
  if (category === 'FINANCEIRO') return r.access.financas
  if (category === 'MANUAIS') return r.access.manuais
  return r.access.estrategia
}

export async function POST(req: NextRequest) {
  const store = await cookies()
  const role = getRoleFromCookie(store.get('chapateca-role')?.value)
  if (!role) return NextResponse.json({ error: 'Não autenticado' }, { status: 401 })

  const { name, category, parentId } = await req.json()
  if (!name?.trim()) return NextResponse.json({ error: 'Nome obrigatório' }, { status: 400 })
  if (!VALID_CATEGORIES.includes(category)) return NextResponse.json({ error: 'Categoria inválida' }, { status: 400 })
  if (!hasAccess(category as DocCategory, role)) return NextResponse.json({ error: 'Sem permissão' }, { status: 403 })

  const r = ROLES[role]
  let userId: string
  try {
    const u = await prisma.user.upsert({
      where: { email: r.email },
      update: {},
      create: { id: `user-${role}`, name: r.name, email: r.email, role: r.dbRole },
    })
    userId = u.id
  } catch {
    userId = `user-${role}`
  }

  const folder = await prisma.folder.create({
    data: {
      name: name.trim(),
      category,
      createdById: userId,
      ...(parentId ? { parentId } : {}),
    },
  })

  return NextResponse.json({ id: folder.id, name: folder.name })
}
