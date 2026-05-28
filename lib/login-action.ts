'use server'

import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import { ROLES, type RoleKey } from '@/lib/roles'
import { prisma } from '@/lib/prisma'
import { hashPassword } from '@/lib/password'

export async function loginAction(formData: FormData) {
  const roleKey = formData.get('role') as string
  const password = formData.get('password') as string

  if (!Object.keys(ROLES).includes(roleKey)) redirect('/?erro=perfil')

  const r = ROLES[roleKey as RoleKey]

  // Verifica senha: DB tem prioridade, senão fallback para env/1234
  let hasCustomPassword = false
  let mustReset = false
  try {
    const user = await prisma.user.findUnique({
      where: { email: r.email },
      select: { passwordHash: true, mustResetPassword: true },
    })
    mustReset = user?.mustResetPassword ?? false
    if (user?.passwordHash) {
      hasCustomPassword = true
      const hash = hashPassword(password, r.email)
      if (hash !== user.passwordHash) redirect(`/?erro=senha&u=${roleKey}`)
    }
  } catch { /* DB não disponível, usa fallback */ }

  if (!hasCustomPassword) {
    const envKey = `PASSWORD_${roleKey.toUpperCase()}`
    const validPassword = process.env[envKey] ?? process.env.PORTAL_PASSWORD ?? '1234'
    if (password !== validPassword) redirect(`/?erro=senha&u=${roleKey}`)
  }

  const store = await cookies()
  store.set('chapateca-role', roleKey, {
    httpOnly: true,
    sameSite: 'lax',
    maxAge: 60 * 60 * 24 * 7,
    path: '/',
  })

  if (!hasCustomPassword || mustReset) redirect('/definir-senha')

  redirect('/dashboard')
}
