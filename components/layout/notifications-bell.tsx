'use client'

import { useState, useEffect, useRef } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import { Bell, MessageCircle, ListTodo, Inbox } from 'lucide-react'
import type { NotificationItem } from '@/app/api/notifications/route'

interface Props {
  initialUnreadCount?: number
}

function timeAgo(iso: string) {
  const diff = Date.now() - new Date(iso).getTime()
  const m = Math.floor(diff / 60000)
  if (m < 1)  return 'agora'
  if (m < 60) return `${m} min`
  const h = Math.floor(m / 60)
  if (h < 24) return `${h}h`
  return `${Math.floor(h / 24)}d`
}

export default function NotificationsBell({ initialUnreadCount = 0 }: Props) {
  const router = useRouter()
  const pathname = usePathname()
  const [open, setOpen] = useState(false)
  const [items, setItems] = useState<NotificationItem[]>([])
  const [unreadCount, setUnreadCount] = useState(initialUnreadCount)
  const [loading, setLoading] = useState(false)
  const wrapperRef = useRef<HTMLDivElement>(null)

  const fetchNotifications = async () => {
    setLoading(true)
    try {
      const res = await fetch('/api/notifications', { cache: 'no-store' })
      if (res.ok) {
        const data = await res.json()
        setItems(data.items ?? [])
        setUnreadCount(data.unreadCount ?? 0)
      }
    } catch { /* silently */ }
    setLoading(false)
  }

  // Recarrega sempre que o pathname muda (servidor pode ter actualizado layout)
  useEffect(() => {
    fetchNotifications()
  }, [pathname])

  // Fechar ao clicar fora
  useEffect(() => {
    if (!open) return
    const onDocClick = (e: MouseEvent) => {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target as Node)) {
        setOpen(false)
      }
    }
    document.addEventListener('mousedown', onDocClick)
    return () => document.removeEventListener('mousedown', onDocClick)
  }, [open])

  const handleToggle = () => {
    const next = !open
    setOpen(next)
    if (next) fetchNotifications()
  }

  const handleClick = (item: NotificationItem) => {
    setOpen(false)
    router.push(`/tarefas`)
  }

  const handleSeeAll = () => {
    setOpen(false)
    router.push('/tarefas')
  }

  return (
    <div ref={wrapperRef} className="relative">
      <button
        onClick={handleToggle}
        aria-label={unreadCount > 0 ? `${unreadCount} notificação${unreadCount !== 1 ? 'ões' : ''}` : 'Notificações'}
        className="relative w-9 h-9 rounded-full flex items-center justify-center text-white/80 hover:bg-white/10 transition-colors"
      >
        <Bell size={20} />
        {unreadCount > 0 && (
          <span className="absolute top-1.5 right-1.5 min-w-[16px] h-4 px-1 bg-gold rounded-full text-[9px] font-bold text-white flex items-center justify-center border-2 border-forest">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {open && (
        <div className="absolute right-0 top-12 w-[360px] max-w-[calc(100vw-2rem)] bg-white dark:bg-[#1A1230] rounded-2xl shadow-[0_24px_60px_rgba(0,0,0,0.4)] border border-sand-light dark:border-white/10 overflow-hidden z-[200] animate-card-in">
          {/* Header */}
          <div className="px-4 py-3 border-b border-sand-light dark:border-white/10 flex items-center justify-between">
            <div>
              <div className="text-sm font-semibold text-ink dark:text-white">Notificações</div>
              <div className="text-[11px] text-ink-soft font-mono">
                {unreadCount === 0 ? 'Tudo em dia 🌱' : `${unreadCount} por ver`}
              </div>
            </div>
            <button
              onClick={handleSeeAll}
              className="text-[11px] font-medium text-[#461882] hover:underline"
            >
              Ver Tarefas →
            </button>
          </div>

          {/* Lista */}
          <div className="max-h-[420px] overflow-y-auto">
            {loading && items.length === 0 ? (
              <div className="py-10 text-center text-xs text-ink-soft font-mono">
                A carregar...
              </div>
            ) : items.length === 0 ? (
              <div className="py-10 text-center px-6">
                <Inbox size={32} className="text-sand mx-auto mb-3" />
                <p className="text-sm text-ink dark:text-white font-medium mb-1">Sem notificações novas</p>
                <p className="text-[11px] text-ink-soft font-mono">Quando alguém te mandar uma tarefa ou responder, aparece aqui.</p>
              </div>
            ) : (
              <div className="divide-y divide-sand-light/70 dark:divide-white/5">
                {items.map(item => {
                  const Icon = item.kind === 'task-new' ? ListTodo : MessageCircle
                  return (
                    <button
                      key={item.id}
                      onClick={() => handleClick(item)}
                      className="w-full text-left px-4 py-3 hover:bg-parchment-2 dark:hover:bg-white/5 transition-colors flex items-start gap-3"
                    >
                      <div className="relative flex-shrink-0">
                        <div
                          className="w-9 h-9 rounded-full flex items-center justify-center text-[11px] font-bold text-white"
                          style={{ background: item.fromColor }}
                        >
                          {item.fromInitials}
                        </div>
                        <div className="absolute -bottom-0.5 -right-0.5 w-4 h-4 rounded-full bg-[#461882] flex items-center justify-center border-2 border-white dark:border-[#1A1230]">
                          <Icon size={9} className="text-white" />
                        </div>
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-baseline gap-2 mb-0.5">
                          <span className="text-[12px] font-semibold text-ink dark:text-white truncate">
                            {item.fromName}
                          </span>
                          <span className="text-[10px] text-ink-soft font-mono flex-shrink-0">
                            {timeAgo(item.createdAt)}
                          </span>
                        </div>
                        <div className="text-[12.5px] text-ink dark:text-white/90 font-medium mb-0.5 line-clamp-1">
                          {item.title}
                        </div>
                        {item.body && (
                          <div className="text-[11px] text-ink-soft dark:text-white/50 line-clamp-2 leading-relaxed">
                            {item.body}
                          </div>
                        )}
                      </div>
                    </button>
                  )
                })}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
