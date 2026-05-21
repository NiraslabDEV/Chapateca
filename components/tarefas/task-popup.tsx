'use client'

import { useState, useTransition } from 'react'
import { markTaskReceived } from '@/app/(portal)/tarefas/actions'
import { Bell, Check, Loader2, ChevronRight } from 'lucide-react'
import Link from 'next/link'

export interface PendingTask {
  id: string
  fromEmail: string
  fromName: string
  fromInitials: string
  fromColor: string
  title: string
  body: string | null
  createdAt: string
  pendingCount: number
}

function timeAgo(iso: string) {
  const diff = Date.now() - new Date(iso).getTime()
  const m = Math.floor(diff / 60000)
  if (m < 1)  return 'agora mesmo'
  if (m < 60) return `há ${m} min`
  const h = Math.floor(m / 60)
  if (h < 24) return `há ${h}h`
  return `há ${Math.floor(h / 24)} dias`
}

export default function TaskPopup({ task }: { task: PendingTask }) {
  const [visible, setVisible]   = useState(true)
  const [done, setDone]         = useState(false)
  const [isPending, startTransition] = useTransition()

  if (!visible) return null

  const handleReceive = () => {
    startTransition(async () => {
      await markTaskReceived(task.id)
      setDone(true)
      setTimeout(() => setVisible(false), 1100)
    })
  }

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4"
         style={{ background: 'rgba(10,6,22,0.72)', backdropFilter: 'blur(4px)' }}>
      <div className="bg-white rounded-2xl shadow-[0_32px_80px_rgba(0,0,0,0.45)] w-full max-w-md animate-card-in overflow-hidden">

        {/* Header */}
        <div className="px-6 py-4 flex items-center gap-3"
             style={{ background: 'linear-gradient(135deg, #1A0836 0%, #461882 100%)' }}>
          <div className="w-10 h-10 rounded-full bg-white/15 flex items-center justify-center flex-shrink-0">
            <Bell size={18} className="text-white" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-white text-[13px] font-semibold">Nova tarefa para ti</p>
            <p className="text-white/60 text-[11px] font-mono">{timeAgo(task.createdAt)}</p>
          </div>
          {task.pendingCount > 1 && (
            <span className="px-2 py-0.5 rounded-full bg-white/20 text-white text-[11px] font-bold font-mono">
              {task.pendingCount} não lidas
            </span>
          )}
        </div>

        {/* Body */}
        <div className="px-6 py-5">
          {/* Sender */}
          <div className="flex items-center gap-2.5 mb-4">
            <div className="w-8 h-8 rounded-full flex items-center justify-center text-[11px] font-bold text-white flex-shrink-0"
                 style={{ background: task.fromColor }}>
              {task.fromInitials}
            </div>
            <div>
              <span className="text-[12px] text-ink-soft font-mono">De </span>
              <span className="text-[13px] font-semibold text-ink">{task.fromName}</span>
            </div>
          </div>

          {/* Task content */}
          <div className="bg-parchment-2 rounded-xl px-4 py-3 mb-5">
            <p className="text-sm font-semibold text-ink leading-snug">{task.title}</p>
            {task.body && (
              <p className="text-xs text-ink-soft mt-1.5 leading-relaxed">{task.body}</p>
            )}
          </div>

          {done ? (
            <div className="flex items-center justify-center gap-2 py-3 text-green-600 font-semibold text-sm">
              <Check size={18} /> Recebido! A tarefa foi registada.
            </div>
          ) : (
            <div className="flex gap-2">
              <Link href="/tarefas"
                    onClick={() => setVisible(false)}
                    className="flex-1 py-3 border-2 border-sand rounded-xl text-[13px] font-medium text-ink-mid
                               hover:border-ink-soft hover:text-ink transition-colors flex items-center justify-center gap-1.5">
                Ver todas <ChevronRight size={14} />
              </Link>
              <button onClick={handleReceive} disabled={isPending}
                      className="flex-[2] py-3 bg-[#461882] text-white rounded-xl text-[13px] font-semibold
                                 hover:bg-[#5A2AA0] transition-colors disabled:opacity-60
                                 flex items-center justify-center gap-2 shadow-[0_4px_16px_rgba(70,24,130,0.35)]">
                {isPending ? <Loader2 size={15} className="animate-spin" /> : <Check size={15} />}
                Recebi — vou tratar
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
