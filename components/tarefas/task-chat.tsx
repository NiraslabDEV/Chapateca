'use client'

import { useState, useTransition, useRef, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Send, Loader2 } from 'lucide-react'
import { sendTaskMessage } from '@/app/(portal)/tarefas/actions'

export type ChatMessage = {
  id: string
  fromEmail: string
  body: string
  createdAt: string  // ISO
  readByPeer: boolean
}

export type ChatParty = {
  email: string
  name: string
  initials: string
  color: string
}

interface Props {
  taskId: string
  me: ChatParty
  peer: ChatParty
  messages: ChatMessage[]
  /** Mensagem inicial (body original da tarefa) — mostrada como primeira bolha se existir */
  initialBody?: string | null
  initialCreatedAt?: string  // ISO
  initialFromEmail?: string
}

function timeAgo(iso: string) {
  const d = new Date(iso)
  const diff = Date.now() - d.getTime()
  const m = Math.floor(diff / 60000)
  if (m < 1)  return 'agora'
  if (m < 60) return `${m}m`
  const h = Math.floor(m / 60)
  if (h < 24) return `${h}h`
  const days = Math.floor(h / 24)
  if (days < 7) return `${days}d`
  return d.toLocaleDateString('pt-MZ', { day: '2-digit', month: 'short' })
}

function Bubble({ msg, isMine, peer, me }: { msg: ChatMessage; isMine: boolean; peer: ChatParty; me: ChatParty }) {
  const author = isMine ? me : peer
  return (
    <div className={`flex gap-2 ${isMine ? 'flex-row-reverse' : ''}`}>
      <div
        className="w-7 h-7 rounded-full flex items-center justify-center text-[10px] font-bold text-white flex-shrink-0 mt-0.5"
        style={{ background: author.color }}
      >
        {author.initials}
      </div>
      <div className={`flex flex-col max-w-[78%] ${isMine ? 'items-end' : 'items-start'}`}>
        <div
          className={[
            'px-3.5 py-2 rounded-2xl text-sm leading-relaxed whitespace-pre-wrap break-words',
            isMine
              ? 'bg-[#461882] text-white rounded-br-md'
              : 'bg-parchment-2 text-ink rounded-bl-md',
          ].join(' ')}
        >
          {msg.body}
        </div>
        <div className="flex items-center gap-1.5 mt-1 px-1 text-[10px] text-ink-soft font-mono">
          {timeAgo(msg.createdAt)}
          {isMine && msg.readByPeer && <span className="text-[#461882]">✓✓</span>}
          {isMine && !msg.readByPeer && <span>✓</span>}
        </div>
      </div>
    </div>
  )
}

export default function TaskChat({ taskId, me, peer, messages, initialBody, initialCreatedAt, initialFromEmail }: Props) {
  const router = useRouter()
  const [draft, setDraft] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [isPending, startTransition] = useTransition()
  const [localMessages, setLocalMessages] = useState<ChatMessage[]>(messages)
  const bottomRef = useRef<HTMLDivElement>(null)

  // Sync server-side updates into local state
  useEffect(() => { setLocalMessages(messages) }, [messages])

  // Auto-scroll to bottom on new messages
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [localMessages.length])

  const handleSend = () => {
    const text = draft.trim()
    if (!text || isPending) return
    setError(null)

    // Optimistic insert
    const optimistic: ChatMessage = {
      id: `tmp-${Date.now()}`,
      fromEmail: me.email,
      body: text,
      createdAt: new Date().toISOString(),
      readByPeer: false,
    }
    setLocalMessages(prev => [...prev, optimistic])
    setDraft('')

    startTransition(async () => {
      const res = await sendTaskMessage(taskId, text)
      if (!res.ok) {
        setError(res.error ?? 'Erro ao enviar')
        setLocalMessages(prev => prev.filter(m => m.id !== optimistic.id))
        setDraft(text)
      } else {
        router.refresh()
      }
    })
  }

  const handleKey = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  // Combina body inicial (1ª "mensagem" sintética) + mensagens reais
  const fullList: ChatMessage[] = initialBody
    ? [
        {
          id: 'initial',
          fromEmail: initialFromEmail || peer.email,
          body: initialBody,
          createdAt: initialCreatedAt || new Date().toISOString(),
          readByPeer: true,
        },
        ...localMessages,
      ]
    : localMessages

  return (
    <div className="flex flex-col h-full min-h-0">
      {/* Thread */}
      <div className="flex-1 min-h-0 overflow-y-auto px-4 py-4 flex flex-col gap-3">
        {fullList.length === 0 ? (
          <div className="text-center py-8 text-xs text-ink-soft">
            Sem mensagens ainda — sê o primeiro a escrever.
          </div>
        ) : (
          fullList.map(msg => (
            <Bubble
              key={msg.id}
              msg={msg}
              isMine={msg.fromEmail === me.email}
              peer={peer}
              me={me}
            />
          ))
        )}
        <div ref={bottomRef} />
      </div>

      {/* Input */}
      <div className="border-t border-sand-light bg-white p-3 flex-shrink-0">
        {error && <p className="text-[11px] text-red-600 mb-2 px-1">{error}</p>}
        <div className="flex gap-2 items-end">
          <textarea
            value={draft}
            onChange={e => setDraft(e.target.value)}
            onKeyDown={handleKey}
            placeholder="Escrever resposta..."
            rows={1}
            className="flex-1 resize-none px-3 py-2 border border-sand rounded-xl text-sm outline-none focus:border-[#461882] transition-colors max-h-32"
            style={{ minHeight: '40px' }}
            disabled={isPending}
          />
          <button
            onClick={handleSend}
            disabled={!draft.trim() || isPending}
            className="w-10 h-10 rounded-xl bg-[#461882] text-white flex items-center justify-center hover:bg-[#5a1fa3] disabled:opacity-40 transition-colors flex-shrink-0"
          >
            {isPending ? <Loader2 size={15} className="animate-spin" /> : <Send size={15} />}
          </button>
        </div>
        <p className="text-[10px] text-ink-soft font-mono mt-1.5 px-1">
          Enter envia · Shift+Enter quebra linha
        </p>
      </div>
    </div>
  )
}
