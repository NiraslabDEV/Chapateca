import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import { getRoleFromCookie, ROLES, type RoleKey } from '@/lib/roles'
import { prisma } from '@/lib/prisma'
import { getEffectiveAccess, type EffectiveAccess } from '@/lib/effective-access'
import PortalLayoutClient from '@/components/layout/portal-layout-client'
import type { PendingTask } from '@/components/tarefas/task-popup'

export type { EffectiveAccess }

async function getPendingTask(email: string): Promise<{ task: PendingTask | null; unreadCount: number }> {
  try {
    // 1. Tarefas com status pending (nunca abertas)
    const pendingTasks = await prisma.task.findMany({
      where:   { toEmail: email, status: 'pending' },
      orderBy: { createdAt: 'asc' },
    })

    // 2. Mensagens novas em tarefas já recebidas (na inbox OU em tarefas que enviei)
    const unreadMessages = await prisma.taskMessage.count({
      where: {
        readByPeer: false,
        fromEmail: { not: email },
        task: {
          OR: [{ toEmail: email }, { fromEmail: email }],
        },
      },
    })

    const totalUnread = pendingTasks.length + unreadMessages

    if (pendingTasks.length === 0) {
      return { task: null, unreadCount: totalUnread }
    }

    const first = pendingTasks[0]
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
        pendingCount: pendingTasks.length,
      },
      unreadCount: totalUnread,
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
  const [effectiveAccess, { task: pendingTask, unreadCount }, dbUser] = await Promise.all([
    getEffectiveAccess(role as RoleKey),
    getPendingTask(r.email),
    prisma.user.findUnique({ where: { email: r.email }, select: { image: true } }).catch(() => null),
  ])

  return (
    <PortalLayoutClient
      role={role}
      effectiveAccess={effectiveAccess}
      pendingTask={pendingTask}
      unreadCount={unreadCount}
      avatarUrl={dbUser?.image ?? null}
    >
      {children}
    </PortalLayoutClient>
  )
}
