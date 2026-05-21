import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import { getRoleFromCookie } from '@/lib/roles'
import PortalLayoutClient from '@/components/layout/portal-layout-client'

export default async function PortalLayout({ children }: { children: React.ReactNode }) {
  const store = await cookies()
  const role = getRoleFromCookie(store.get('chapateca-role')?.value)
  if (!role) redirect('/')

  return (
    <PortalLayoutClient role={role}>
      {children}
    </PortalLayoutClient>
  )
}
