import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import { getRoleFromCookie, ROLES } from '@/lib/roles'
import { prisma } from '@/lib/prisma'
import PortalLayoutClient from '@/components/layout/portal-layout-client'
import type { PendingTask } from '@/components/tarefas/task-popup'

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

async function getPendingTask(email: string): Promise<{ task: PendingTask | null; unreadCount: number }> {
  try {
    const tasks = await prisma.task.findMany({
      where:   { toEmail: email, status: 'pending' },
      orderBy: { createdAt: 'asc' },
    })
    if (tasks.length === 0) return { task: null, unreadCount: 0 }

    const first = tasks[0]
    const sender = Object.values(ROLES).find(r => r.email === first.fromEmail)

    return {
      task: {
        id:           first.id,
        fromEmail:    first.fromEmail,
        fromName:     sender?.name     ?? first.fromEmail,
        fromInitials: sender?.initials ?? '??',
        fromColor:    sender?.color    ?? '#8B7FA8',
        title:        first.title,
        body:         first.body,
        createdAt:    first.createdAt.toISOString(),
        pendingCount: tasks.length,
      },
      unreadCount: tasks.length,
    }
  } catch {
    return { task: null, unreadCount: 0 }
  }
}

export default async function PortalLayout({ children }: { children: React.ReactNode }) {
  const store = await cookies()
  const role = getRoleFromCookie(store.get('chapateca-role')?.value)
  if (!role) redirect('/')

  const r = ROLES[role]
  const [effectiveAccess, { task: pendingTask, unreadCount }] = await Promise.all([
    getEffectiveAccess(role),
    getPendingTask(r.email),
  ])

  return (
    <PortalLayoutClient
      role={role}
      effectiveAccess={effectiveAccess}
      pendingTask={pendingTask}
      unreadCount={unreadCount}
    >
      {children}
    </PortalLayoutClient>
  )
}
