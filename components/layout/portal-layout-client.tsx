'use client'

import { useState, useEffect } from 'react'
import { usePathname } from 'next/navigation'
import Topbar from './topbar'
import Sidebar from './sidebar'
import type { RoleKey } from '@/lib/roles'
import type { EffectiveAccess } from '@/app/(portal)/layout'
import TaskPopup from '@/components/tarefas/task-popup'
import type { PendingTask } from '@/components/tarefas/task-popup'

interface Props {
  role: RoleKey
  effectiveAccess: EffectiveAccess
  pendingTask: PendingTask | null
  unreadCount: number
  children: React.ReactNode
}

export default function PortalLayoutClient({ role, effectiveAccess, pendingTask, unreadCount, children }: Props) {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const pathname = usePathname()

  useEffect(() => {
    setSidebarOpen(false)
  }, [pathname])

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
          <Sidebar
            role={role}
            effectiveAccess={effectiveAccess}
            unreadCount={unreadCount}
            onClose={() => setSidebarOpen(false)}
          />
        </div>

        {/* Conteúdo principal */}
        <main className="flex-1 min-w-0 overflow-y-auto p-5 md:p-8 lg:p-10">
          <div className="animate-page-in max-w-6xl">
            {children}
          </div>
        </main>

      </div>

      {pendingTask && <TaskPopup task={pendingTask} key={pendingTask.id} />}
    </div>
  )
}
