'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Home, BookOpen, Target, Wallet, Camera, Settings, HelpCircle, Lock, LogOut } from 'lucide-react'
import { ROLES, type RoleKey } from '@/lib/roles'
import RoleBadge from '@/components/ui/role-badge'
import { cn } from '@/lib/utils'

const NAV_ITEMS = [
  { href: '/dashboard',  label: 'Início',           icon: Home,     key: null },
  { href: '/manuais',    label: 'Manuais e Guias',  icon: BookOpen, key: 'manuais'    as const },
  { href: '/estrategia', label: 'Estratégica',       icon: Target,   key: 'estrategia' as const },
  { href: '/financas',   label: 'Financeiro',        icon: Wallet,   key: 'financas'   as const },
  { href: '/galeria',    label: 'Galeria Campo',     icon: Camera,   key: 'galeria'    as const },
]

const SECONDARY = [
  { href: '/definicoes', label: 'Definições', icon: Settings },
  { href: '/ajuda',      label: 'Ajuda',      icon: HelpCircle },
]

interface SidebarProps { role: RoleKey }

export default function Sidebar({ role }: SidebarProps) {
  const pathname = usePathname()
  const r = ROLES[role]

  return (
    <aside className="w-60 bg-parchment-3 border-r border-sand flex flex-col sticky top-16 h-[calc(100vh-4rem)] overflow-y-auto">
      {/* Profile */}
      <div className="px-4 pt-5 pb-4 border-b border-sand flex flex-col gap-2">
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 rounded-full flex items-center justify-center text-[15px] font-bold text-white flex-shrink-0"
               style={{ background: 'linear-gradient(135deg, #E5B84A, #C8952A)' }}>
            {r.initials}
          </div>
          <div className="min-w-0">
            <div className="text-[13px] font-semibold text-ink truncate">{r.name}</div>
            <div className="text-[11px] text-ink-soft font-mono truncate">{r.email}</div>
          </div>
        </div>
        <RoleBadge role={role} />
      </div>

      {/* Main nav */}
      <nav className="flex-1 px-3 py-3 flex flex-col gap-0.5">
        {NAV_ITEMS.map(item => {
          const locked = item.key !== null && !r.access[item.key]
          const active = pathname.startsWith(item.href)
          const Icon = item.icon
          return (
            <Link key={item.href} href={locked ? '/acesso-negado' : item.href}
                  className={cn(
                    'flex items-center gap-3 px-3 py-2.5 rounded-xl text-[13px] font-medium transition-all',
                    active && !locked ? 'bg-forest text-white' : '',
                    !active && !locked ? 'text-ink-mid hover:bg-forest/5 hover:text-ink' : '',
                    locked ? 'text-ink-soft opacity-50 cursor-not-allowed pointer-events-none' : '',
                  )}>
              <Icon size={18} className={active && !locked ? 'text-gold-glow' : ''} />
              <span className="flex-1">{item.label}</span>
              {locked && <Lock size={12} className="text-ink-soft" />}
            </Link>
          )
        })}
      </nav>

      {/* Secondary nav */}
      <div className="px-3 pb-3 border-t border-sand pt-3 flex flex-col gap-0.5">
        {SECONDARY.map(item => {
          const Icon = item.icon
          const active = pathname === item.href
          return (
            <Link key={item.href} href={item.href}
                  className={cn(
                    'flex items-center gap-3 px-3 py-2.5 rounded-xl text-[13px] font-medium transition-all',
                    active ? 'bg-forest text-white' : 'text-ink-mid hover:bg-forest/5 hover:text-ink',
                  )}>
              <Icon size={18} />
              <span>{item.label}</span>
            </Link>
          )
        })}
        <a href="/api/logout"
           className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-[13px] font-medium transition-all text-red-600 hover:bg-red-50">
          <LogOut size={18} />
          <span>Sair da Sessão</span>
        </a>
        <div className="px-3 pt-2 text-[11px] text-ink-soft font-mono tracking-[0.04em]">
          v0.1 · Maputo
        </div>
      </div>
    </aside>
  )
}
