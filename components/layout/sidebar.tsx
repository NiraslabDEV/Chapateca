'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Home, BookOpen, Target, Wallet, Camera, Settings, HelpCircle, Lock, LogOut, X, Moon, Sun } from 'lucide-react'
import { ROLES, type RoleKey } from '@/lib/roles'
import RoleBadge from '@/components/ui/role-badge'
import { cn } from '@/lib/utils'
import { useEffect, useState } from 'react'

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

interface SidebarProps {
  role: RoleKey
  onClose?: () => void
}

export default function Sidebar({ role, onClose }: SidebarProps) {
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

      {/* Perfil */}
      <div className="px-4 pt-5 pb-4 border-b border-sand dark:border-white/10 flex flex-col gap-2">
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 rounded-full flex items-center justify-center text-[15px] font-bold text-white flex-shrink-0"
               style={{ background: 'linear-gradient(135deg, #F07840, #E8652A)' }}>
            {r.initials}
          </div>
          <div className="min-w-0">
            <div className="text-[13px] font-semibold text-ink dark:text-white truncate">{r.name}</div>
            <div className="text-[11px] text-ink-soft dark:text-white/50 font-mono truncate">{r.email}</div>
          </div>
        </div>
        <RoleBadge role={role} />
      </div>

      {/* Nav principal */}
      <nav className="flex-1 px-3 py-3 flex flex-col gap-0.5 overflow-y-auto">
        {NAV_ITEMS.map(item => {
          const locked = item.key !== null && !r.access[item.key]
          const active = pathname.startsWith(item.href)
          const Icon = item.icon
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
                  )}>
              <Icon size={18} className={active && !locked ? 'text-gold' : ''} />
              <span className="flex-1">{item.label}</span>
              {locked && <Lock size={12} className="text-ink-soft" />}
            </Link>
          )
        })}
      </nav>

      {/* Nav secundária */}
      <div className="px-3 pb-3 border-t border-sand dark:border-white/10 pt-3 flex flex-col gap-0.5">
        {SECONDARY.map(item => {
          const Icon = item.icon
          const active = pathname === item.href
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
