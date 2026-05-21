'use server'

import { cookies } from 'next/headers'
import { getRoleFromCookie, ROLES } from '@/lib/roles'
import { prisma } from '@/lib/prisma'
import { hashPassword } from '@/lib/password'

async function requireAdmin() {
  const store = await cookies()
  const roleKey = getRoleFromCookie(store.get('chapateca-role')?.value)
  if (!roleKey || ROLES[roleKey].group !== 'admin') throw new Error('Sem permissão')
  return roleKey
}

function getRoleByEmail(email: string) {
  return Object.values(ROLES).find(r => r.email === email) ?? null
}

// Força a pessoa a definir nova senha no próximo login
export async function forcePasswordReset(email: string) {
  await requireAdmin()
  const r = getRoleByEmail(email)
  if (!r) throw new Error('Utilizador não encontrado')

  await prisma.user.upsert({
    where: { email },
    update: { mustResetPassword: true, passwordHash: null },
    create: { id: `user-${r.key}`, name: r.name, email, role: r.dbRole, mustResetPassword: true },
  })
}

// Admin define diretamente uma nova senha para a pessoa
export async function adminSetPassword(email: string, newPassword: string) {
  await requireAdmin()
  const r = getRoleByEmail(email)
  if (!r) throw new Error('Utilizador não encontrado')
  if (newPassword.length < 6) throw new Error('Senha muito curta')

  const passwordHash = hashPassword(newPassword, email)
  await prisma.user.upsert({
    where: { email },
    update: { passwordHash, mustResetPassword: false },
    create: { id: `user-${r.key}`, name: r.name, email, role: r.dbRole, passwordHash },
  })
}

// Actualiza acesso a um módulo para um utilizador
export async function updateUserAccess(
  email: string,
  module: 'galeria' | 'manuais' | 'estrategia' | 'financas',
  value: boolean
) {
  await requireAdmin()
  const r = getRoleByEmail(email)
  if (!r) throw new Error('Utilizador não encontrado')

  const field = {
    galeria:    'accessGaleria',
    manuais:    'accessManuais',
    estrategia: 'accessEstrategia',
    financas:   'accessFinancas',
  }[module]

  await prisma.user.upsert({
    where: { email },
    update: { [field]: value },
    create: { id: `user-${r.key}`, name: r.name, email, role: r.dbRole, [field]: value },
  })
}
