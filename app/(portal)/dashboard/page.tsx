import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { getRoleFromCookie, ROLES } from '@/lib/roles'
import { BookOpen, Target, Wallet, Camera, Lock, ChevronRight } from 'lucide-react'
import { cn } from '@/lib/utils'

const MODULES = [
  {
    href: '/manuais',
    title: 'Manuais e Guias',
    desc: 'Documentação, regulamentos e procedimentos internos',
    icon: BookOpen,
    color: '#2D5220',
    accent: '#4A7A32',
    key: 'manuais' as const,
    tag: 'Todos',
  },
  {
    href: '/estrategia',
    title: 'Gestão Estratégica',
    desc: 'Planos estratégicos, relatórios de impacto e metas',
    icon: Target,
    color: '#1A5C8A',
    accent: '#3A7CBF',
    key: 'estrategia' as const,
    tag: 'Direcção',
  },
  {
    href: '/financas',
    title: 'Departamento Financeiro',
    desc: 'Orçamentos, relatórios financeiros e contratos',
    icon: Wallet,
    color: '#8B3A3A',
    accent: '#D45555',
    key: 'financas' as const,
    tag: 'DAF',
  },
  {
    href: '/galeria',
    title: 'Galeria do Terreno',
    desc: 'Fotos e vídeos das actividades e impacto no campo',
    icon: Camera,
    color: '#C8952A',
    accent: '#E5B84A',
    key: 'galeria' as const,
    tag: 'Campo',
    urgent: true,
  },
]

const FEED = [
  { color: '#C8952A', text: 'Beatriz carregou 14 fotos · Malhangalene', time: '32m' },
  { color: '#1A5C8A', text: 'Carlos partilhou álbum com doadores', time: '2h' },
  { color: '#2E7D32', text: 'Manual do Voluntário 2025 actualizado', time: '1d' },
  { color: '#1C3A14', text: 'Lourenço adicionou Relatório Q2', time: '2d' },
]

export default async function DashboardPage() {
  const store = await cookies()
  const role = getRoleFromCookie(store.get('chapateca-role')?.value)
  if (!role) redirect('/')
  const r = ROLES[role]

  const hour = new Date().getHours()
  const greet = hour < 12 ? 'Bom dia' : hour < 18 ? 'Boa tarde' : 'Boa noite'

  return (
    <div>
      {/* Header */}
      <div className="mb-8">
        <p className="text-ink-soft text-sm mb-1">{greet}, {r.name.split(' ')[0]} 👋</p>
        <h1 className="font-display text-[34px] text-ink leading-tight">O que precisas hoje?</h1>
      </div>

      {/* Modules grid */}
      <div className="grid grid-cols-2 gap-5 mb-12">
        {MODULES.map(m => {
          const locked = !r.access[m.key]
          const Icon = m.icon
          return (
            <Link key={m.href} href={locked ? '/acesso-negado' : m.href}
                  className={cn(
                    'relative overflow-hidden bg-white border border-sand-light rounded-2xl p-6 flex flex-col gap-3 min-h-[180px]',
                    'shadow-[0_2px_8px_rgba(22,20,18,0.08)] transition-all duration-200',
                    locked ? 'opacity-55 grayscale-[0.3] cursor-not-allowed' : 'hover:-translate-y-1 hover:shadow-[0_4px_20px_rgba(22,20,18,0.12)]',
                  )}>
              {/* top bar */}
              <div className="absolute top-0 left-0 right-0 h-[3px]"
                   style={{ background: locked ? '#CCC' : `linear-gradient(90deg, ${m.color}, ${m.accent})` }} />

              {locked && (
                <div className="absolute top-4 right-4 w-7 h-7 rounded-full bg-black/6 flex items-center justify-center">
                  <Lock size={14} className="text-ink-soft" />
                </div>
              )}

              {m.urgent && !locked && (
                <span className="absolute top-3.5 right-3.5 bg-red-500 text-white text-[10px] font-bold px-2.5 py-0.5 rounded-full tracking-wider animate-pulse">
                  URGENTE
                </span>
              )}

              <div className="w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0"
                   style={{ background: `${m.color}18` }}>
                <Icon size={24} style={{ color: m.color }} />
              </div>

              <h3 className="font-display text-[22px] text-ink">{m.title}</h3>
              <p className="text-[13px] text-ink-soft flex-1 leading-relaxed">{m.desc}</p>

              <div className="flex items-center justify-between mt-3">
                <span className="text-[11px] font-medium px-2.5 py-1 rounded-full bg-parchment-2 text-ink-mid">
                  {locked ? 'Sem acesso' : `Acesso · ${m.tag}`}
                </span>
                {!locked && <ChevronRight size={16} className="text-ink-soft" />}
              </div>
            </Link>
          )
        })}
      </div>

      {/* Activity feed */}
      <div>
        <h2 className="font-display text-lg text-ink mb-4 flex items-center gap-3 after:flex-1 after:h-px after:bg-sand after:content-['']">
          Actividade recente
        </h2>
        <div className="flex flex-col gap-0.5">
          {FEED.map((f, i) => (
            <div key={i} className="flex items-start gap-3 px-4 py-3 rounded-xl hover:bg-parchment-2 transition-colors cursor-pointer">
              <div className="w-2 h-2 rounded-full mt-2 flex-shrink-0" style={{ background: f.color }} />
              <div className="text-[13px] text-ink-mid flex-1">
                {f.text}
                <span className="ml-2 text-[12px] text-ink-soft font-mono">{f.time}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
