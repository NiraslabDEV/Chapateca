'use client'

import Image from 'next/image'
import Link from 'next/link'
import { Menu } from 'lucide-react'
import RoleBadge from '@/components/ui/role-badge'
import NotificationsBell from './notifications-bell'
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

      {/* Logo — ícone circular + wordmark em texto */}
      <Link href="/dashboard" className="flex items-center gap-2.5 flex-shrink-0 hover:opacity-90 transition-opacity">
        <div className="w-9 h-9 rounded-full overflow-hidden ring-1 ring-white/20 flex-shrink-0 bg-white/5">
          <Image
            src="/logo-chapateca-icone.png"
            alt="Chapateca"
            width={36}
            height={36}
            className="w-full h-full object-cover"
            priority
          />
        </div>
        <span className="hidden sm:inline text-white font-display text-[17px] tracking-[0.06em] font-semibold">
          CHAPATECA
        </span>
      </Link>

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
        {/* Notificações — dropdown funcional */}
        <NotificationsBell initialUnreadCount={unreadCount} />

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
