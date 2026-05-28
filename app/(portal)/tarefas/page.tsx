import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import { getRoleFromCookie, ROLES, type RoleKey } from '@/lib/roles'
import { prisma } from '@/lib/prisma'
import ComposePanel from '@/components/tarefas/compose-panel'
import TaskCardChat from '@/components/tarefas/task-card-chat'
import type { ChatParty } from '@/components/tarefas/task-chat'
import { MessageSquare, Send, Clock, RotateCcw, CheckCheck } from 'lucide-react'

function emailToParty(email: string, fallback?: ChatParty): ChatParty {
  const role = Object.values(ROLES).find(r => r.email === email)
  if (role) return { email: role.email, name: role.name, initials: role.initials, color: role.color }
  return fallback ?? { email, name: email, initials: '??', color: '#8B7FA8' }
}

export default async function TarefasPage() {
  const store = await cookies()
  const roleKey = getRoleFromCookie(store.get('chapateca-role')?.value)
  if (!roleKey) redirect('/')

  const r = ROLES[roleKey as RoleKey]
  const isAdmin = r.group === 'admin'
  const me: ChatParty = { email: r.email, name: r.name, initials: r.initials, color: r.color }

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
    // Auto-marcar pendentes como recebidas
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

  // Serializa para client (Date → ISO)
  const serialize = (t: TaskWithMessages, perspective: 'inbox' | 'sent') => {
    const peerEmail = perspective === 'inbox' ? t.fromEmail : t.toEmail
    const peer = emailToParty(peerEmail)
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
      <div className="mb-8">
        <h1 className="font-display text-[34px] text-ink leading-tight">Tarefas e Conversas</h1>
        <p className="text-ink-soft text-sm mt-1">
          {inProgress.length === 0 && concluded.length === 0
            ? '🌱 Tudo em dia — caixa vazia'
            : inProgress.length === 0
            ? `🌱 Tudo em dia · ${concluded.length} concluída${concluded.length !== 1 ? 's' : ''}`
            : `${inProgress.length} em progresso${totalUnreadInProgress > 0 ? ` · ${totalUnreadInProgress} nova${totalUnreadInProgress !== 1 ? 's' : ''} mensagem${totalUnreadInProgress !== 1 ? 's' : ''}` : ''}${concluded.length > 0 ? ` · ${concluded.length} concluída${concluded.length !== 1 ? 's' : ''}` : ''}`}
        </p>
      </div>

      <div className="flex flex-col lg:flex-row gap-6 max-w-5xl">

        {/* Coluna principal: inbox + compose */}
        <div className="flex-1 min-w-0">

          {isAdmin && <ComposePanel recipients={recipients} />}

          {/* Em Progresso */}
          <section className="mb-8">
            <div className="flex items-center gap-2 mb-3">
              <MessageSquare size={15} className="text-[#461882]" />
              <h2 className="text-sm font-semibold text-ink">Em Progresso</h2>
              {inProgress.length > 0 && (
                <span className="px-1.5 py-0.5 rounded-full bg-[#461882] text-white text-[10px] font-bold font-mono">
                  {inProgress.length}
                </span>
              )}
            </div>

            {inProgress.length === 0 ? (
              <div className="bg-white border border-sand-light rounded-2xl p-8 text-center">
                <Clock size={32} className="text-sand mx-auto mb-3" />
                <p className="text-sm text-ink-soft">
                  {inbox.length === 0 ? 'Nenhuma tarefa recebida ainda' : '🌱 Nada pendente — boa!'}
                </p>
              </div>
            ) : (
              <div className="flex flex-col gap-3">
                {inProgress.map(item => (
                  <TaskCardChat
                    key={item.task.id}
                    task={item.task}
                    perspective="inbox"
                    me={me}
                    peer={item.peer}
                    messages={item.messages}
                    unreadCount={item.unreadCount}
                  />
                ))}
              </div>
            )}
          </section>

          {/* Concluídas */}
          {concluded.length > 0 && (
            <details className="group">
              <summary className="flex items-center gap-2 mb-3 cursor-pointer list-none select-none hover:opacity-80 transition-opacity">
                <CheckCheck size={15} className="text-green-700" />
                <h2 className="text-sm font-semibold text-ink-mid">Concluídas</h2>
                <span className="px-1.5 py-0.5 rounded-full bg-green-100 text-green-700 text-[10px] font-bold font-mono">
                  {concluded.length}
                </span>
                <span className="text-[11px] text-ink-soft font-mono group-open:hidden">▾ mostrar</span>
                <span className="text-[11px] text-ink-soft font-mono hidden group-open:inline">▴ ocultar</span>
              </summary>
              <div className="flex flex-col gap-3 opacity-70 hover:opacity-100 transition-opacity">
                {concluded.map(item => (
                  <TaskCardChat
                    key={item.task.id}
                    task={item.task}
                    perspective="inbox"
                    me={me}
                    peer={item.peer}
                    messages={item.messages}
                    unreadCount={item.unreadCount}
                  />
                ))}
              </div>
            </details>
          )}
        </div>

        {/* Coluna lateral: enviadas (admins) */}
        {isAdmin && (
          <div className="lg:w-80 flex-shrink-0">
            <div className="flex items-center gap-2 mb-3">
              <Send size={15} className="text-forest" />
              <h2 className="text-sm font-semibold text-ink">Tarefas Enviadas</h2>
            </div>

            {sent.length === 0 ? (
              <div className="bg-white border border-sand-light rounded-2xl p-6 text-center">
                <RotateCcw size={28} className="text-sand mx-auto mb-2" />
                <p className="text-xs text-ink-soft">Ainda não enviaste nenhuma tarefa</p>
              </div>
            ) : (
              <div className="flex flex-col gap-3">
                {sent.map(item => (
                  <TaskCardChat
                    key={item.task.id}
                    task={item.task}
                    perspective="sent"
                    me={me}
                    peer={item.peer}
                    messages={item.messages}
                    unreadCount={item.unreadCount}
                  />
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
