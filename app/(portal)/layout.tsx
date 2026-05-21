import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import { getRoleFromCookie, ROLES } from '@/lib/roles'
import { prisma } from '@/lib/prisma'
import PortalLayoutClient from '@/components/layout/portal-layout-client'

export type EffectiveAccess = {
  galeria: boolean
  manuais: boolean
  estrategia: boolean
  financas: boolean
}

async function getEffectiveAccess(roleKey: string): Promise<EffectiveAccess> {
  const r = ROLES[roleKey as keyof typeof ROLES]
  const defaults = r.access
  try {
    const user = await prisma.user.findUnique({
      where: { email: r.email },
      select: { accessGaleria: true, accessManuais: true, accessEstrategia: true, accessFinancas: true },
    })
    if (!user) return defaults
    return {
      galeria:    user.accessGaleria    ?? defaults.galeria,
      manuais:    user.accessManuais    ?? defaults.manuais,
      estrategia: user.accessEstrategia ?? defaults.estrategia,
      financas:   user.accessFinancas   ?? defaults.financas,
    }
  } catch {
    return defaults
  }
}

export default async function PortalLayout({ children }: { children: React.ReactNode }) {
  const store = await cookies()
  const role = getRoleFromCookie(store.get('chapateca-role')?.value)
  if (!role) redirect('/')

  const effectiveAccess = await getEffectiveAccess(role)

  return (
    <PortalLayoutClient role={role} effectiveAccess={effectiveAccess}>
      {children}
    </PortalLayoutClient>
  )
}
