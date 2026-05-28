'use client'

import { useState } from 'react'
import TaskCardChat from './task-card-chat'
import type { ChatMessage, ChatParty } from './task-chat'
import { MessageSquare, Send, Clock, RotateCcw, CheckCheck } from 'lucide-react'

export type SerializedTask = {
  task: {
    id: string
    fromEmail: string
    toEmail: string
    title: string
    body: string | null
    status: string
    createdAt: string
    doneAt: string | null
  }
  peer: ChatParty
  messages: ChatMessage[]
  unreadCount: number
}

interface Props {
  me: ChatParty
  inProgress: SerializedTask[]
  concluded: SerializedTask[]
  sent: SerializedTask[]
  isAdmin: boolean
  totalUnreadInProgress: number
  inboxTotal: number
}

export default function TarefasShell({ me, inProgress, concluded, sent, isAdmin, totalUnreadInProgress, inboxTotal }: Props) {
  // Estado global do accordion — só um chat aberto de cada vez
  const [openId, setOpenId] = useState<string | null>(() => {
    // Abre automaticamente o primeiro com mensagens não lidas
    const first = inProgress.find(t => t.unreadCount > 0)
    return first?.task.id ?? null
  })

  const toggle = (id: string) => setOpenId(prev => (prev === id ? null : id))

  const renderTask = (item: SerializedTask, perspective: 'inbox' | 'sent') => (
    <TaskCardChat
      key={item.task.id}
      task={item.task}
      perspective={perspective}
      me={me}
      peer={item.peer}
      messages={item.messages}
      unreadCount={item.unreadCount}
      isOpen={openId === item.task.id}
      onToggle={() => toggle(item.task.id)}
    />
  )

  return (
    <>
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

        {/* Coluna principal: inbox */}
        <div className="flex-1 min-w-0">

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
                  {inboxTotal === 0 ? 'Nenhuma tarefa recebida ainda' : '🌱 Nada pendente — boa!'}
                </p>
              </div>
            ) : (
              <div className="flex flex-col gap-3">
                {inProgress.map(item => renderTask(item, 'inbox'))}
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
                {concluded.map(item => renderTask(item, 'inbox'))}
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
                {sent.map(item => renderTask(item, 'sent'))}
              </div>
            )}
          </div>
        )}
      </div>
    </>
  )
}
