import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { getRoleFromCookie, ROLES } from '@/lib/roles'
import { prisma } from '@/lib/prisma'

export type NotificationItem = {
  id: string
  kind: 'task-new' | 'message-new'
  taskId: string
  title: string
  body: string | null
  fromName: string
  fromInitials: string
  fromColor: string
  createdAt: string  // ISO
  isUnread: boolean
}

export async function GET() {
  const store = await cookies()
  const roleKey = getRoleFromCookie(store.get('chapateca-role')?.value)
  if (!roleKey) return NextResponse.json({ items: [], unreadCount: 0 }, { status: 401 })

  const r = ROLES[roleKey]

  try {
    // 1. Tarefas pending (não abertas)
    const pendingTasks = await prisma.task.findMany({
      where:   { toEmail: r.email, status: 'pending' },
      orderBy: { createdAt: 'desc' },
      take:    10,
    })

    // 2. Mensagens novas em conversas (recebidas ou enviadas)
    const newMessages = await prisma.taskMessage.findMany({
      where: {
        readByPeer: false,
        fromEmail: { not: r.email },
        task: { OR: [{ toEmail: r.email }, { fromEmail: r.email }] },
      },
      orderBy: { createdAt: 'desc' },
      take: 10,
      include: { task: { select: { id: true, title: true } } },
    })

    const taskItems: NotificationItem[] = pendingTasks.map(t => {
      const sender = Object.values(ROLES).find(rr => rr.email === t.fromEmail)
      return {
        id:           `task-${t.id}`,
        kind:         'task-new',
        taskId:       t.id,
        title:        t.title,
        body:         t.body,
        fromName:     sender?.name     ?? t.fromEmail,
        fromInitials: sender?.initials ?? '??',
        fromColor:    sender?.color    ?? '#8B7FA8',
        createdAt:    t.createdAt.toISOString(),
        isUnread:     true,
      }
    })

    const messageItems: NotificationItem[] = newMessages.map(m => {
      const sender = Object.values(ROLES).find(rr => rr.email === m.fromEmail)
      return {
        id:           `msg-${m.id}`,
        kind:         'message-new',
        taskId:       m.taskId,
        title:        `Resposta em "${m.task.title}"`,
        body:         m.body.slice(0, 120),
        fromName:     sender?.name     ?? m.fromEmail,
        fromInitials: sender?.initials ?? '??',
        fromColor:    sender?.color    ?? '#8B7FA8',
        createdAt:    m.createdAt.toISOString(),
        isUnread:     true,
      }
    })

    const items = [...taskItems, ...messageItems]
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
      .slice(0, 15)

    return NextResponse.json({
      items,
      unreadCount: items.length,
    })
  } catch {
    return NextResponse.json({ items: [], unreadCount: 0 })
  }
}
