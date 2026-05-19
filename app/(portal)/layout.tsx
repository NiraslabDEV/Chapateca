import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import { getRoleFromCookie } from '@/lib/roles'
import Topbar from '@/components/layout/topbar'
import Sidebar from '@/components/layout/sidebar'

export default async function PortalLayout({ children }: { children: React.ReactNode }) {
  const store = await cookies()
  const role = getRoleFromCookie(store.get('chapateca-role')?.value)
  if (!role) redirect('/')

  return (
    <div className="min-h-screen flex flex-col">
      <Topbar role={role} />
      <div className="flex flex-1">
        <Sidebar role={role} />
        <main className="flex-1 p-8 md:p-10 overflow-y-auto min-w-0">
          <div className="animate-page-in">{children}</div>
        </main>
      </div>
    </div>
  )
}
