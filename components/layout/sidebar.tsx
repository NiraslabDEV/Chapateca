'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Home, BookOpen, Crown, TrendingUp, Wallet, Users, Camera, CalendarDays, Sparkles, CheckSquare, Settings, HelpCircle, Lock, LogOut, X, Moon, Sun, User as UserIcon, UsersRound, type LucideIcon } from 'lucide-react'
import { ROLES, type RoleKey, type ModuleKey } from '@/lib/roles'
import type { EffectiveAccess } from '@/app/(portal)/layout'
import { MODULOS } from '@/lib/modulos'
import RoleBadge from '@/components/ui/role-badge'
import { cn } from '@/lib/utils'
import { useEffect, useState } from 'react'

const ICONS: Record<string, LucideIcon> = {
  BookOpen, Crown, TrendingUp, Wallet, Users, Camera, CalendarDays, Sparkles,
}

type NavItem = { href: string; label: string; icon: LucideIcon; key: ModuleKey | null }

const SORTED_MODULOS = [...MODULOS]
  .filter(m => m.visibleInSidebar)
  .sort((a, b) => a.order - b.order)

const NAV_ITEMS: NavItem[] = [
  { href: '/dashboard', label: 'Início', icon: Home, key: null },
  ...SORTED_MODULOS.map((m): NavItem => ({
    href: m.href,
    label: `${String(m.order).padStart(2, '0')}. ${m.short}`,
    icon: ICONS[m.iconName] ?? BookOpen,
    key: m.key,
  })),
  { href: '/tarefas', label: 'Tarefas', icon: CheckSquare, key: null },
]

const SECONDARY_BASE = [
  { href: '/perfil',     label: 'O meu perfil', icon: UserIcon,   adminOnly: false },
  { href: '/equipa',     label: 'Equipa',       icon: UsersRound, adminOnly: true  },
  { href: '/definicoes', label: 'Definições',   icon: Settings,   adminOnly: false },
  { href: '/ajuda',      label: 'Ajuda',        icon: HelpCircle, adminOnly: false },
]

interface SidebarProps {
  role: RoleKey
  effectiveAccess: EffectiveAccess
  unreadCount: number
  avatarUrl?: string | null
  onClose?: () => void
}

export default function Sidebar({ role, effectiveAccess, unreadCount, avatarUrl, onClose }: SidebarProps) {
  const pathname = usePathname()
  const r = ROLES[role]
  const [dark, setDark] = useState(false)

  useEffect(() => {
    setDark(document.documentElement.classList.contains('dark'))
  }, [])

  const toggleTheme = () => {
    const isDark = document.documentElement.classList.toggle('dark')
    setDark(isDark)
    try { localStorage.setItem('chapateca-theme', isDark ? 'dark' : 'light') } catch {}
  }

  return (
    <aside className="w-64 bg-parchment-3 border-r border-sand flex flex-col h-full dark:bg-[#150F28] dark:border-white/10">

      {/* Header sidebar com botão fechar (mobile) */}
      <div className="h-16 flex items-center justify-between px-4 border-b border-sand dark:border-white/10 md:hidden">
        <span className="text-[13px] font-semibold text-ink dark:text-white">Menu</span>
        <button onClick={onClose}
                className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-sand/60 dark:hover:bg-white/10 transition-colors">
          <X size={16} className="text-ink-mid dark:text-white/70" />
        </button>
      </div>

      {/* Perfil — clica para editar */}
      <Link href="/perfil" onClick={onClose}
            className="px-4 pt-5 pb-4 border-b border-sand dark:border-white/10 flex flex-col gap-2 hover:bg-sand/30 dark:hover:bg-white/5 transition-colors">
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 rounded-full overflow-hidden flex items-center justify-center text-[15px] font-bold text-white flex-shrink-0"
               style={{ background: 'linear-gradient(135deg, #F07840, #E8652A)' }}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            {avatarUrl ? <img src={avatarUrl} alt={r.name} className="w-full h-full object-cover" /> : r.initials}
          </div>
          <div className="min-w-0">
            <div className="text-[13px] font-semibold text-ink dark:text-white truncate">{r.name}</div>
            <div className="text-[11px] text-ink-soft dark:text-white/50 font-mono truncate">{r.email}</div>
          </div>
        </div>
        <RoleBadge role={role} />
      </Link>

      {/* Nav principal */}
      <nav className="flex-1 px-3 py-3 flex flex-col gap-0.5 overflow-y-auto">
        {NAV_ITEMS.map(item => {
          const locked = item.key !== null && !effectiveAccess[item.key]
          const active = pathname.startsWith(item.href)
          const Icon = item.icon
          const isTarefas = item.href === '/tarefas'
          return (
            <Link key={item.href} href={locked ? '/acesso-negado' : item.href}
                  onClick={onClose}
                  className={cn(
                    'flex items-center gap-3 px-3 py-2.5 rounded-xl text-[13px] font-medium transition-all',
                    active && !locked
                      ? 'bg-forest text-white dark:bg-forest-mid'
                      : '',
                    !active && !locked
                      ? 'text-ink-mid hover:bg-sand/60 hover:text-ink dark:text-white/70 dark:hover:bg-white/8 dark:hover:text-white'
                      : '',
                    locked
                      ? 'text-ink-soft opacity-50 cursor-not-allowed pointer-events-none dark:text-white/30'
                      : '',
                    // Brilho roxo especial para o item Tarefas (excepto quando activo, que já tem fundo verde)
                    isTarefas && !active ? 'tarefas-glow' : '',
                  )}>
              <Icon
                size={18}
                className={cn(
                  active && !locked ? 'text-gold' : '',
                  isTarefas && !active ? 'tarefas-icon-glow' : '',
                )}
              />
              <span className={cn('flex-1', isTarefas && !active ? 'text-[#461882] dark:text-[#a78bfa] font-semibold' : '')}>
                {item.label}
              </span>
              {locked && <Lock size={12} className="text-ink-soft" />}
              {isTarefas && unreadCount > 0 && (
                <span className="w-5 h-5 rounded-full bg-[#461882] text-white text-[10px] font-bold flex items-center justify-center flex-shrink-0 shadow-[0_0_12px_rgba(70,24,130,0.6)]">
                  {unreadCount > 9 ? '9+' : unreadCount}
                </span>
              )}
            </Link>
          )
        })}
      </nav>

      {/* Nav secundária */}
      <div className="px-3 pb-3 border-t border-sand dark:border-white/10 pt-3 flex flex-col gap-0.5">
        {SECONDARY_BASE.filter(item => !item.adminOnly || r.group === 'admin').map(item => {
          const Icon = item.icon
          const active = pathname === item.href || pathname.startsWith(item.href + '/')
          return (
            <Link key={item.href} href={item.href}
                  onClick={onClose}
                  className={cn(
                    'flex items-center gap-3 px-3 py-2.5 rounded-xl text-[13px] font-medium transition-all',
                    active
                      ? 'bg-forest text-white dark:bg-forest-mid'
                      : 'text-ink-mid hover:bg-sand/60 hover:text-ink dark:text-white/70 dark:hover:bg-white/8 dark:hover:text-white',
                  )}>
              <Icon size={18} />
              <span>{item.label}</span>
            </Link>
          )
        })}

        {/* Tema */}
        <button onClick={toggleTheme}
                className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-[13px] font-medium transition-all
                           text-ink-mid hover:bg-sand/60 hover:text-ink dark:text-white/70 dark:hover:bg-white/8 dark:hover:text-white">
          {dark ? <Sun size={18} /> : <Moon size={18} />}
          <span>{dark ? 'Modo claro' : 'Modo escuro'}</span>
        </button>

        <a href="/api/logout"
           className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-[13px] font-medium transition-all text-red-500 hover:bg-red-50 dark:hover:bg-red-950/30">
          <LogOut size={18} />
          <span>Sair da Sessão</span>
        </a>
        <div className="px-3 pt-2 text-[11px] text-ink-soft dark:text-white/30 font-mono tracking-[0.04em]">
          v0.1 · Maputo
        </div>
      </div>
    </aside>
  )
}
