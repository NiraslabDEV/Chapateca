'use client'

import { useState } from 'react'
import { ChevronDown, ChevronUp } from 'lucide-react'
import TaskCardChat from './task-card-chat'
import type { ChatParty } from './task-chat'
import type { SerializedTask } from './tarefas-shell'

interface Props {
  peer: ChatParty
  me: ChatParty
  tasks: SerializedTask[]
  perspective: 'inbox' | 'sent'
  openTaskId: string | null
  onToggleTask: (id: string) => void
}

function timeAgo(iso: string) {
  const d = new Date(iso)
  const diff = Date.now() - d.getTime()
  const m = Math.floor(diff / 60000)
  if (m < 1)  return 'agora'
  if (m < 60) return `${m} min`
  const h = Math.floor(m / 60)
  if (h < 24) return `${h}h`
  return `${Math.floor(h / 24)}d`
}

export default function PeerGroup({ peer, me, tasks, perspective, openTaskId, onToggleTask }: Props) {
  const [collapsed, setCollapsed] = useState(false)

  const totalUnread = tasks.reduce((sum, t) => sum + t.unreadCount, 0)
  const activeCount = tasks.filter(t => t.task.status !== 'done').length
  const lastActivity = tasks
    .flatMap(t => [t.task.createdAt, ...t.messages.map(m => m.createdAt)])
    .sort((a, b) => new Date(b).getTime() - new Date(a).getTime())[0]

  const taskLabel = tasks.length === 1
    ? '1 conversa'
    : `${tasks.length} conversas`

  return (
    <div className="bg-white border border-sand-light rounded-2xl overflow-hidden shadow-[0_1px_4px_rgba(22,20,18,0.04)]">
      {/* Header da pessoa */}
      <button
        onClick={() => setCollapsed(c => !c)}
        className="w-full flex items-center gap-3 px-4 py-3 hover:bg-parchment-2/50 transition-colors border-b border-sand-light"
        style={{ background: collapsed ? 'transparent' : `linear-gradient(to right, ${peer.color}08, transparent)` }}
      >
        <div className="relative flex-shrink-0">
          <div
            className="w-12 h-12 rounded-full overflow-hidden flex items-center justify-center text-sm font-bold text-white shadow-sm ring-2 ring-white"
            style={{ background: peer.color }}
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            {peer.image ? <img src={peer.image} alt={peer.name} className="w-full h-full object-cover" /> : peer.initials}
          </div>
          {totalUnread > 0 && (
            <span className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-red-500 text-white text-[10px] font-bold flex items-center justify-center border-2 border-white shadow-[0_0_8px_rgba(239,68,68,0.5)]">
              {totalUnread > 9 ? '9+' : totalUnread}
            </span>
          )}
        </div>

        <div className="flex-1 min-w-0 text-left">
          <div className="flex items-baseline gap-2 flex-wrap">
            <span className="text-[15px] font-semibold text-ink">{peer.name}</span>
            <span className="text-[11px] text-ink-soft font-mono">
              {perspective === 'inbox' ? 'manda para ti' : 'recebe de ti'}
            </span>
          </div>
          <div className="text-[12px] text-ink-soft mt-0.5 flex items-center gap-2">
            <span>{taskLabel}</span>
            {activeCount > 0 && activeCount !== tasks.length && (
              <>
                <span>·</span>
                <span className="text-[#461882] font-medium">{activeCount} activa{activeCount !== 1 ? 's' : ''}</span>
              </>
            )}
            {lastActivity && (
              <>
                <span>·</span>
                <span>última: {timeAgo(lastActivity)}</span>
              </>
            )}
          </div>
        </div>

        <div className="text-ink-soft flex-shrink-0">
          {collapsed ? <ChevronDown size={18} /> : <ChevronUp size={18} />}
        </div>
      </button>

      {/* Lista de tarefas */}
      {!collapsed && (
        <div className="p-3 flex flex-col gap-2 bg-parchment-2/20">
          {tasks.map(item => (
            <TaskCardChat
              key={item.task.id}
              task={item.task}
              perspective={perspective}
              me={me}
              peer={peer}
              messages={item.messages}
              unreadCount={item.unreadCount}
              isOpen={openTaskId === item.task.id}
              onToggle={() => onToggleTask(item.task.id)}
            />
          ))}
        </div>
      )}
    </div>
  )
}
