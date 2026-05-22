'use client'

import Image from 'next/image'
import Link from 'next/link'
import { Bell, Menu } from 'lucide-react'
import RoleBadge from '@/components/ui/role-badge'
import { ROLES, type RoleKey } from '@/lib/roles'

interface TopbarProps {
  role: RoleKey
  crumbs?: string[]
  unreadCount?: number
  onMenuClick?: () => void
}

export default function Topbar({ role, crumbs = [], unreadCount = 0, onMenuClick }: TopbarProps) {
  const r = ROLES[role]
  return (
    <header className="h-16 bg-forest border-b border-forest-mid flex items-center px-4 md:px-6 gap-3 md:gap-6 sticky top-0 z-50">

      {/* Hamburger — só mobile */}
      <button
        onClick={onMenuClick}
        className="md:hidden flex items-center justify-center w-9 h-9 rounded-xl text-white/80 hover:bg-white/10 transition-colors flex-shrink-0">
        <Menu size={20} />
      </button>

      {/* Logo */}
      <div className="flex items-center flex-shrink-0">
        <Image
          src="/logo-chapateca.svg"
          alt="Chapateca"
          width={120}
          height={40}
          className="object-contain brightness-0 invert"
        />
      </div>

      {/* Breadcrumb — oculto em mobile */}
      {crumbs.length > 0 && (
        <nav className="hidden md:flex items-center gap-2 text-[13px] text-white/60">
          <span>Portal</span>
          {crumbs.map((c, i) => (
            <span key={i} className="flex items-center gap-2">
              <span className="text-white/30">›</span>
              <span className={i === crumbs.length - 1 ? 'text-white font-medium' : ''}>{c}</span>
            </span>
          ))}
        </nav>
      )}

      <div className="ml-auto flex items-center gap-3">
        {/* Notificações — sino com badge de tarefas pendentes */}
        <Link
          href="/tarefas"
          aria-label={unreadCount > 0 ? `${unreadCount} tarefa${unreadCount !== 1 ? 's' : ''} por ver` : 'Tarefas'}
          className="relative w-9 h-9 rounded-full flex items-center justify-center text-white/80 hover:bg-white/10 transition-colors"
        >
          <Bell size={20} />
          {unreadCount > 0 && (
            <span className="absolute top-1.5 right-1.5 min-w-[16px] h-4 px-1 bg-gold rounded-full text-[9px] font-bold text-white flex items-center justify-center border-2 border-forest">
              {unreadCount > 9 ? '9+' : unreadCount}
            </span>
          )}
        </Link>

        {/* Avatar pill */}
        <div className="flex items-center gap-2 px-2.5 py-1 rounded-full bg-white/10 border border-white/15 cursor-pointer hover:bg-white/15 transition-colors">
          <div className="w-7 h-7 md:w-8 md:h-8 rounded-full flex items-center justify-center text-[11px] md:text-[12px] font-bold text-white flex-shrink-0"
               style={{ background: 'linear-gradient(135deg, #F07840, #E8652A)' }}>
            {r.initials}
          </div>
          <span className="hidden sm:inline text-[13px] text-white font-medium">{r.name.split(' ')[0]}</span>
          <span className="hidden md:inline">
            <RoleBadge role={role} onDark />
          </span>
        </div>
      </div>
    </header>
  )
}
