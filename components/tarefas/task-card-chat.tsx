'use client'

import { useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { CheckCircle2, MessageCircle, ChevronDown, ChevronUp, Loader2 } from 'lucide-react'
import TaskChat, { type ChatMessage, type ChatParty } from './task-chat'
import { markTaskDone, markMessagesRead } from '@/app/(portal)/tarefas/actions'

type TaskStatus = 'pending' | 'received' | 'done'

const STATUS_CONFIG: Record<TaskStatus, { label: string; color: string }> = {
  pending:  { label: 'Pendente',  color: 'text-amber-600 bg-amber-50 border-amber-200' },
  received: { label: 'Recebida',  color: 'text-[#461882] bg-[#EDE8F7] border-[#D4C8EC]' },
  done:     { label: 'Concluída', color: 'text-green-700 bg-green-50 border-green-200' },
}

function timeAgo(date: Date | string) {
  const d = typeof date === 'string' ? new Date(date) : date
  const diff = Date.now() - d.getTime()
  const m = Math.floor(diff / 60000)
  if (m < 1)  return 'agora mesmo'
  if (m < 60) return `há ${m} min`
  const h = Math.floor(m / 60)
  if (h < 24) return `há ${h}h`
  return `há ${Math.floor(h / 24)} dias`
}

interface Props {
  task: {
    id: string
    fromEmail: string
    toEmail: string
    title: string
    body: string | null
    status: string
    createdAt: string  // ISO
    doneAt: string | null
  }
  perspective: 'inbox' | 'sent'
  me: ChatParty
  peer: ChatParty
  messages: ChatMessage[]
  unreadCount: number  // mensagens não lidas pelo utilizador actual
  isOpen: boolean
  onToggle: () => void
}

export default function TaskCardChat({ task, perspective, me, peer, messages, unreadCount, isOpen, onToggle }: Props) {
  const router = useRouter()
  const [doneLoading, startDone] = useTransition()

  const st = task.status as TaskStatus
  const cfg = STATUS_CONFIG[st] ?? STATUS_CONFIG.pending
  const canMarkDone = perspective === 'inbox' && st === 'received'

  const handleToggle = () => {
    onToggle()
    // Quando abrir, marca como lidas
    if (!isOpen && unreadCount > 0) {
      markMessagesRead(task.id).then(() => router.refresh()).catch(() => {})
    }
  }

  const handleMarkDone = () => {
    const fd = new FormData()
    fd.append('taskId', task.id)
    startDone(async () => {
      await markTaskDone(fd)
      router.refresh()
    })
  }

  const messageCount = messages.length + (task.body ? 1 : 0)

  return (
    <div
      className={[
        'border rounded-2xl overflow-hidden transition-all',
        isOpen
          ? 'border-[#461882]/40 shadow-[0_8px_28px_rgba(70,24,130,0.15)] bg-white'
          : 'border-sand-light bg-white hover:border-[#461882]/25 hover:shadow-[0_2px_12px_rgba(22,20,18,0.06)]',
      ].join(' ')}
    >
      {/* Header — sempre visível */}
      <div
        className={[
          'p-4 cursor-pointer transition-colors',
          isOpen ? 'bg-[#461882]/5' : 'hover:bg-parchment-2/40',
        ].join(' ')}
        onClick={handleToggle}
      >
        <div className="flex items-start gap-3">
          {/* Avatar */}
          <div className="relative flex-shrink-0">
            <div className="w-9 h-9 rounded-full flex items-center justify-center text-[11px] font-bold text-white shadow-sm"
                 style={{ background: peer.color }}>
              {peer.initials}
            </div>
            {unreadCount > 0 && (
              <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-red-500 text-white text-[9px] font-bold flex items-center justify-center border-2 border-white">
                {unreadCount > 9 ? '9+' : unreadCount}
              </span>
            )}
          </div>

          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1 flex-wrap">
              <span className="text-[12px] font-medium text-ink-mid">
                {perspective === 'inbox' ? `De ${peer.name}` : `Para ${peer.name}`}
              </span>
              <span className="text-[11px] text-ink-soft font-mono">{timeAgo(task.createdAt)}</span>
            </div>
            <p className="text-sm font-semibold text-ink mb-0.5">{task.title}</p>
            <div className="flex items-center gap-2 text-[11px] text-ink-soft font-mono">
              <MessageCircle size={11} />
              <span>{messageCount} {messageCount === 1 ? 'mensagem' : 'mensagens'}</span>
              {task.doneAt && <span className="text-green-600">· ✓ {timeAgo(task.doneAt)}</span>}
            </div>
          </div>

          <div className="flex flex-col items-end gap-2 flex-shrink-0">
            <span className={`text-[11px] font-semibold px-2 py-0.5 rounded-full border ${cfg.color}`}>
              {cfg.label}
            </span>
            <div className={isOpen ? 'text-[#461882]' : 'text-ink-soft'}>
              {isOpen ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
            </div>
          </div>
        </div>
      </div>

      {/* Chat expandido */}
      {isOpen && (
        <div
          className="flex flex-col border-t-2 border-[#461882]/15"
          style={{
            height: '480px',
            background: 'linear-gradient(180deg, #F5F0FA 0%, #F9F6FC 40%, #FBF9FD 100%)',
          }}
        >
          {/* Header da conversa */}
          <div className="px-4 py-2.5 border-b border-[#461882]/10 bg-white/70 backdrop-blur-sm flex items-center gap-2.5 flex-shrink-0">
            <div className="w-7 h-7 rounded-full flex items-center justify-center text-[10px] font-bold text-white"
                 style={{ background: peer.color }}>
              {peer.initials}
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-[13px] font-semibold text-ink leading-tight">{peer.name}</div>
              <div className="text-[10px] text-ink-soft font-mono">Conversa privada</div>
            </div>
            <div className="flex items-center gap-1 text-[10px] text-ink-soft font-mono">
              <span className="w-1.5 h-1.5 rounded-full bg-[#461882]" />
              {messageCount} {messageCount === 1 ? 'msg' : 'msgs'}
            </div>
          </div>

          <TaskChat
            taskId={task.id}
            me={me}
            peer={peer}
            messages={messages}
            initialBody={task.body}
            initialCreatedAt={task.createdAt}
            initialFromEmail={task.fromEmail}
          />

          {canMarkDone && (
            <div className="border-t border-green-200 bg-green-50/60 p-3 flex-shrink-0">
              <button
                onClick={handleMarkDone}
                disabled={doneLoading}
                className="w-full flex items-center justify-center gap-1.5 py-2 bg-green-600 text-white rounded-lg text-sm font-semibold hover:bg-green-700 transition-colors disabled:opacity-60"
              >
                {doneLoading ? <Loader2 size={14} className="animate-spin" /> : <CheckCircle2 size={14} />}
                Marcar tarefa como concluída
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
