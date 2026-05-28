import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import { getRoleFromCookie, ROLES, type RoleKey } from '@/lib/roles'
import { prisma } from '@/lib/prisma'
import ComposePanel from '@/components/tarefas/compose-panel'
import TarefasShell, { type SerializedTask } from '@/components/tarefas/tarefas-shell'
import type { ChatParty } from '@/components/tarefas/task-chat'

function emailToParty(email: string, imagesByEmail: Map<string, string | null>, fallback?: ChatParty): ChatParty {
  const role = Object.values(ROLES).find(r => r.email === email)
  if (role) {
    return {
      email: role.email,
      name: role.name,
      initials: role.initials,
      color: role.color,
      image: imagesByEmail.get(role.email) ?? null,
    }
  }
  return fallback ?? { email, name: email, initials: '??', color: '#8B7FA8' }
}

export default async function TarefasPage() {
  const store = await cookies()
  const roleKey = getRoleFromCookie(store.get('chapateca-role')?.value)
  if (!roleKey) redirect('/')

  const r = ROLES[roleKey as RoleKey]
  const isAdmin = r.group === 'admin'

  // Buscar todas as fotos de uma vez para usar nos avatares de quem mandou/recebeu
  let imagesByEmail = new Map<string, string | null>()
  try {
    const allDbUsers = await prisma.user.findMany({ select: { email: true, image: true } })
    imagesByEmail = new Map(allDbUsers.map(u => [u.email, u.image]))
  } catch { /* DB indisponível */ }

  const me: ChatParty = {
    email: r.email, name: r.name, initials: r.initials, color: r.color,
    image: imagesByEmail.get(r.email) ?? null,
  }

  const recipients = Object.values(ROLES)
    .filter(u => u.email !== r.email)
    .map(u => ({ email: u.email, name: u.name, initials: u.initials, color: u.color, group: u.group }))

  type TaskWithMessages = {
    id: string
    fromEmail: string
    toEmail: string
    title: string
    body: string | null
    status: string
    createdAt: Date
    doneAt: Date | null
    messages: { id: string; fromEmail: string; body: string; createdAt: Date; readByPeer: boolean }[]
  }

  let inboxRaw: TaskWithMessages[] = []
  let sentRaw:  TaskWithMessages[] = []

  try {
    await prisma.task.updateMany({
      where: { toEmail: r.email, status: 'pending' },
      data:  { status: 'received', readAt: new Date() },
    })

    inboxRaw = await prisma.task.findMany({
      where:   { toEmail: r.email },
      orderBy: [{ lastMessageAt: 'desc' }, { createdAt: 'desc' }],
      include: { messages: { orderBy: { createdAt: 'asc' } } },
    })
    if (isAdmin) {
      sentRaw = await prisma.task.findMany({
        where:   { fromEmail: r.email },
        orderBy: [{ lastMessageAt: 'desc' }, { createdAt: 'desc' }],
        include: { messages: { orderBy: { createdAt: 'asc' } } },
      })
    }
  } catch { /* DB não disponível */ }

  const serialize = (t: TaskWithMessages, perspective: 'inbox' | 'sent'): SerializedTask => {
    const peerEmail = perspective === 'inbox' ? t.fromEmail : t.toEmail
    const peer = emailToParty(peerEmail, imagesByEmail)
    const unreadCount = t.messages.filter(m => m.fromEmail !== r.email && !m.readByPeer).length
    return {
      task: {
        id: t.id,
        fromEmail: t.fromEmail,
        toEmail: t.toEmail,
        title: t.title,
        body: t.body,
        status: t.status,
        createdAt: t.createdAt.toISOString(),
        doneAt: t.doneAt?.toISOString() ?? null,
      },
      peer,
      messages: t.messages.map(m => ({
        id: m.id,
        fromEmail: m.fromEmail,
        body: m.body,
        createdAt: m.createdAt.toISOString(),
        readByPeer: m.readByPeer,
      })),
      unreadCount,
    }
  }

  const inbox = inboxRaw.map(t => serialize(t, 'inbox'))
  const sent  = sentRaw.map(t  => serialize(t, 'sent'))

  const inProgress = inbox.filter(t => t.task.status === 'pending' || t.task.status === 'received')
  const concluded  = inbox.filter(t => t.task.status === 'done')
  const totalUnreadInProgress = inProgress.reduce((sum, t) => sum + t.unreadCount, 0)

  return (
    <div>
      {isAdmin && (
        <div className="max-w-5xl">
          <ComposePanel recipients={recipients} />
        </div>
      )}
      <TarefasShell
        me={me}
        inProgress={inProgress}
        concluded={concluded}
        sent={sent}
        isAdmin={isAdmin}
        totalUnreadInProgress={totalUnreadInProgress}
        inboxTotal={inbox.length}
      />
    </div>
  )
}
