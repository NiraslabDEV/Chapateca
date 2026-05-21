import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import { getRoleFromCookie, ROLES } from '@/lib/roles'
import { prisma } from '@/lib/prisma'
import { markTaskDone } from './actions'
import ComposePanel from '@/components/tarefas/compose-panel'
import { CheckCircle2, Clock, RotateCcw, MessageSquare, Send } from 'lucide-react'

type TaskStatus = 'pending' | 'received' | 'done'

function emailToRole(email: string) {
  return Object.values(ROLES).find(r => r.email === email)
}

function timeAgo(date: Date) {
  const diff = Date.now() - date.getTime()
  const m = Math.floor(diff / 60000)
  if (m < 1)  return 'agora mesmo'
  if (m < 60) return `há ${m} min`
  const h = Math.floor(m / 60)
  if (h < 24) return `há ${h}h`
  return `há ${Math.floor(h / 24)} dias`
}

const STATUS_CONFIG = {
  pending:  { label: 'Pendente',  color: 'text-amber-600 bg-amber-50 border-amber-200' },
  received: { label: 'Recebida',  color: 'text-[#461882] bg-[#EDE8F7] border-[#D4C8EC]' },
  done:     { label: 'Concluída', color: 'text-green-700 bg-green-50 border-green-200' },
}

function TaskCard({
  task,
  perspective,
}: {
  task: { id: string; fromEmail: string; toEmail: string; title: string; body: string | null; status: string; createdAt: Date; doneAt: Date | null }
  perspective: 'inbox' | 'sent'
}) {
  const other = perspective === 'inbox'
    ? emailToRole(task.fromEmail)
    : emailToRole(task.toEmail)
  const st = (task.status as TaskStatus)
  const cfg = STATUS_CONFIG[st] ?? STATUS_CONFIG.pending
  const canMarkDone = perspective === 'inbox' && st === 'received'

  return (
    <div className="bg-white border border-sand-light rounded-2xl p-4">
      <div className="flex items-start gap-3">
        {/* Avatar */}
        <div className="w-9 h-9 rounded-full flex items-center justify-center text-[11px] font-bold text-white flex-shrink-0 mt-0.5"
             style={{ background: other?.color ?? '#8B7FA8' }}>
          {other?.initials ?? '??'}
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1 flex-wrap">
            <span className="text-[12px] font-medium text-ink-mid">
              {perspective === 'inbox' ? `De ${other?.name ?? task.fromEmail}` : `Para ${other?.name ?? task.toEmail}`}
            </span>
            <span className="text-[11px] text-ink-soft font-mono">{timeAgo(task.createdAt)}</span>
          </div>
          <p className="text-sm font-semibold text-ink mb-1">{task.title}</p>
          {task.body && <p className="text-xs text-ink-soft leading-relaxed">{task.body}</p>}
          {task.doneAt && (
            <p className="text-[11px] text-green-600 font-mono mt-1">✓ Concluída {timeAgo(task.doneAt)}</p>
          )}
        </div>

        <div className="flex flex-col items-end gap-2 flex-shrink-0">
          <span className={`text-[11px] font-semibold px-2 py-0.5 rounded-full border ${cfg.color}`}>
            {cfg.label}
          </span>
          {canMarkDone && (
            <form action={markTaskDone}>
              <input type="hidden" name="taskId" value={task.id} />
              <button type="submit"
                      className="flex items-center gap-1 px-3 py-1.5 bg-green-600 text-white rounded-lg text-[11px] font-semibold
                                 hover:bg-green-700 transition-colors">
                <CheckCircle2 size={11} /> Concluído
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  )
}

export default async function TarefasPage() {
  const store = await cookies()
  const roleKey = getRoleFromCookie(store.get('chapateca-role')?.value)
  if (!roleKey) redirect('/')

  const r = ROLES[roleKey]
  const isAdmin = r.group === 'admin'

  // All users except self, for compose dropdown
  const recipients = Object.values(ROLES)
    .filter(u => u.email !== r.email)
    .map(u => ({ email: u.email, name: u.name, initials: u.initials, color: u.color, group: u.group }))

  let inbox: Awaited<ReturnType<typeof prisma.task.findMany>> = []
  let sent:  Awaited<ReturnType<typeof prisma.task.findMany>> = []

  try {
    inbox = await prisma.task.findMany({
      where:   { toEmail: r.email },
      orderBy: { createdAt: 'desc' },
    })
    if (isAdmin) {
      sent = await prisma.task.findMany({
        where:   { fromEmail: r.email },
        orderBy: { createdAt: 'desc' },
      })
    }
  } catch { /* DB não disponível */ }

  const pendingCount = inbox.filter(t => t.status === 'pending').length
  const receivedCount = inbox.filter(t => t.status === 'received').length

  return (
    <div>
      <div className="mb-8">
        <h1 className="font-display text-[34px] text-ink leading-tight">Tarefas e Mensagens</h1>
        <p className="text-ink-soft text-sm mt-1">
          {pendingCount > 0
            ? `${pendingCount} não lida${pendingCount !== 1 ? 's' : ''} · ${receivedCount} em progresso`
            : receivedCount > 0
            ? `${receivedCount} em progresso`
            : 'Tudo em dia'}
        </p>
      </div>

      <div className="flex flex-col lg:flex-row gap-6 max-w-5xl">

        {/* Coluna principal: inbox + compose */}
        <div className="flex-1 min-w-0">

          {isAdmin && <ComposePanel recipients={recipients} />}

          {/* Caixa de entrada */}
          <section>
            <div className="flex items-center gap-2 mb-3">
              <MessageSquare size={15} className="text-forest" />
              <h2 className="text-sm font-semibold text-ink">Caixa de Entrada</h2>
              {pendingCount > 0 && (
                <span className="px-1.5 py-0.5 rounded-full bg-[#461882] text-white text-[10px] font-bold font-mono">
                  {pendingCount}
                </span>
              )}
            </div>

            {inbox.length === 0 ? (
              <div className="bg-white border border-sand-light rounded-2xl p-8 text-center">
                <Clock size={32} className="text-sand mx-auto mb-3" />
                <p className="text-sm text-ink-soft">Nenhuma tarefa recebida ainda</p>
              </div>
            ) : (
              <div className="flex flex-col gap-3">
                {inbox.map(task => (
                  <TaskCard key={task.id} task={task} perspective="inbox" />
                ))}
              </div>
            )}
          </section>
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
                {sent.map(task => (
                  <TaskCard key={task.id} task={task} perspective="sent" />
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
