'use client'

import { useState, useEffect } from 'react'
import { usePathname } from 'next/navigation'
import Topbar from './topbar'
import Sidebar from './sidebar'
import type { RoleKey } from '@/lib/roles'

interface Props {
  role: RoleKey
  children: React.ReactNode
}

export default function PortalLayoutClient({ role, children }: Props) {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const pathname = usePathname()

  // Fecha sidebar ao navegar
  useEffect(() => {
    setSidebarOpen(false)
  }, [pathname])

  // Bloqueia scroll do body quando sidebar aberta no mobile
  useEffect(() => {
    if (sidebarOpen) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = ''
    }
    return () => { document.body.style.overflow = '' }
  }, [sidebarOpen])

  return (
    <div className="min-h-screen flex flex-col bg-parchment dark:bg-[#0F0A1E]">
      <Topbar role={role} onMenuClick={() => setSidebarOpen(o => !o)} />

      <div className="flex flex-1 min-h-0 relative">

        {/* Overlay escuro — mobile */}
        {sidebarOpen && (
          <div
            className="fixed inset-0 z-40 bg-black/50 md:hidden"
            onClick={() => setSidebarOpen(false)}
          />
        )}

        {/* Sidebar */}
        <div className={[
          'fixed md:sticky top-16 left-0 z-50 md:z-auto',
          'h-[calc(100vh-4rem)]',
          'transition-transform duration-300 ease-in-out',
          sidebarOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0',
          'flex-shrink-0',
        ].join(' ')}>
          <Sidebar role={role} onClose={() => setSidebarOpen(false)} />
        </div>

        {/* Conteúdo principal */}
        <main className="flex-1 min-w-0 overflow-y-auto p-5 md:p-8 lg:p-10">
          <div className="animate-page-in max-w-6xl">
            {children}
          </div>
        </main>

      </div>
    </div>
  )
}
