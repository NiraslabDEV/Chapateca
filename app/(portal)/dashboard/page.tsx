import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { getRoleFromCookie, ROLES, type RoleKey } from '@/lib/roles'
import { prisma } from '@/lib/prisma'
import { getEffectiveAccess } from '@/lib/effective-access'
import { BookOpen, Target, Wallet, Camera, Lock, ChevronRight, ImageIcon, CheckSquare, MapPin } from 'lucide-react'
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
  },
]

export default async function DashboardPage() {
  const store = await cookies()
  const role = getRoleFromCookie(store.get('chapateca-role')?.value)
  if (!role) redirect('/')
  const r = ROLES[role]
  const access = await getEffectiveAccess(role as RoleKey)

  const hour = new Date().getHours()
  const greet = hour < 12 ? 'Bom dia' : hour < 18 ? 'Boa tarde' : 'Boa noite'

  const now = new Date()
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1)

  type FeedItem = {
    id: string
    href: string
    uploaderName: string
    uploaderInitials: string
    description: string
    date: Date
    kind?: 'upload' | 'delete'
  }

  let albumsThisMonth = 0
  let photosThisMonth = 0
  let pendingTasks = 0
  let feedItems: FeedItem[] = []
  let topLocations: { location: string; count: number }[] = []
  let dbConnected = false

  function initials(name: string) {
    return name.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase()
  }

  try {
    const [aCount, pCount, tCount, albums, fileLogs, locs, activityLogs] = await Promise.all([
      prisma.album.count({ where: { createdAt: { gte: startOfMonth } } }),
      prisma.fileLog.count({ where: { createdAt: { gte: startOfMonth } } }),
      prisma.task.count({ where: { status: 'pending' } }),
      prisma.album.findMany({
        take: 8,
        orderBy: { createdAt: 'desc' },
        include: { uploadedBy: true, _count: { select: { photos: true } } },
      }),
      prisma.fileLog.findMany({
        where: { albumId: null },
        take: 8,
        orderBy: { createdAt: 'desc' },
        include: { uploadedBy: true, folder: { select: { name: true } } },
      }),
      prisma.fileLog.groupBy({
        by: ['location'],
        where: { location: { not: null } },
        _count: { id: true },
        orderBy: { _count: { id: 'desc' } },
        take: 4,
      }),
      prisma.activityLog.findMany({
        take: 8,
        orderBy: { createdAt: 'desc' },
      }),
    ])

    dbConnected = true
    albumsThisMonth = aCount
    photosThisMonth = pCount
    pendingTasks = tCount

    const albumItems: FeedItem[] = albums.map(a => {
      const name = a.uploadedBy?.name ?? 'Equipa'
      const n = a._count.photos
      return {
        id: `a-${a.id}`,
        href: `/galeria/${a.id}`,
        uploaderName: name,
        uploaderInitials: initials(name),
        description: `carregou ${n} foto${n !== 1 ? 's' : ''} em ${a.location}${a.activityName ? ` — ${a.activityName}` : ''}`,
        date: a.createdAt,
      }
    })

    const CATEGORY_LABEL: Record<string, string> = {
      FINANCEIRO: 'Departamento Financeiro',
      MANUAIS:    'Manuais e Guias',
      ESTRATEGIA: 'Gestão Estratégica',
      MARKETING:  'Marketing',
    }
    const CATEGORY_HREF: Record<string, string> = {
      FINANCEIRO: '/financas',
      MANUAIS:    '/manuais',
      ESTRATEGIA: '/estrategia',
      MARKETING:  '/galeria?tab=marketing',
    }

    const logItems: FeedItem[] = fileLogs.map(f => {
      const name = f.uploadedBy?.name ?? 'Equipa'
      const cat = f.category
      const isImage = f.fileType === 'IMAGE' || cat === 'MARKETING' || cat === 'FOTOS_TERRENO'
      const noun = isImage ? 'imagem' : 'ficheiro'
      const docTitle = f.activityName || f.fileName
      const where = f.folder?.name
        ? ` na pasta "${f.folder.name}"`
        : CATEGORY_LABEL[cat]
          ? ` em ${CATEGORY_LABEL[cat]}`
          : f.location ? ` em ${f.location}` : ''
      return {
        id: `f-${f.id}`,
        href: CATEGORY_HREF[cat] ?? '/galeria',
        uploaderName: name,
        uploaderInitials: initials(name),
        description: `carregou ${noun} "${docTitle}"${where}`,
        date: f.createdAt,
        kind: 'upload',
      }
    })

    const deleteItems: FeedItem[] = activityLogs.map(a => ({
      id: `del-${a.id}`,
      href: a.action.startsWith('marketing') ? '/galeria?tab=marketing' : '/galeria',
      uploaderName: a.actorName,
      uploaderInitials: initials(a.actorName),
      description: a.description,
      date: a.createdAt,
      kind: 'delete',
    }))

    feedItems = [...albumItems, ...logItems, ...deleteItems]
      .sort((a, b) => b.date.getTime() - a.date.getTime())
      .slice(0, 8)

    topLocations = locs
      .filter(l => l.location)
      .map(l => ({ location: l.location!, count: l._count.id }))
  } catch { /* DB não disponível */ }

  const STATS = [
    { label: 'Actividades este mês', value: albumsThisMonth, icon: Camera, color: '#E8652A' },
    { label: 'Fotos este mês', value: photosThisMonth, icon: ImageIcon, color: '#461882' },
    { label: 'Tarefas pendentes', value: pendingTasks, icon: CheckSquare, color: pendingTasks > 0 ? '#d97706' : '#16a34a' },
  ]

  return (
    <div>
      {/* Header */}
      <div className="mb-8">
        <p className="text-ink-soft text-sm mb-1">{greet}, {r.name.split(' ')[0]} 👋</p>
        <h1 className="font-display text-[34px] text-ink leading-tight">O que precisas hoje?</h1>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4 mb-8">
        {STATS.map(s => {
          const Icon = s.icon
          return (
            <div key={s.label} className="bg-white border border-sand-light rounded-2xl p-4">
              <div className="flex items-center gap-2 mb-1">
                <Icon size={14} style={{ color: s.color }} />
                <span className="text-[11px] text-ink-soft font-mono">{s.label}</span>
              </div>
              <div className="font-display text-[28px] text-ink">{s.value}</div>
            </div>
          )
        })}
      </div>

      {/* Modules grid */}
      <div className="grid grid-cols-2 gap-5 mb-12">
        {MODULES.map(m => {
          const locked = !access[m.key]
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

              {(m as { urgent?: boolean }).urgent && !locked && (
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
      <div className="mt-8">
        <h2 className="font-display text-lg text-ink mb-4 flex items-center gap-3 after:flex-1 after:h-px after:bg-sand after:content-['']">
          Actividade recente
        </h2>

        {feedItems.length > 0 ? (
          <div className="flex flex-col gap-0.5">
            {feedItems.map(item => {
              const isDelete = item.kind === 'delete'
              return (
                <a key={item.id} href={item.href}
                   className="flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-parchment-2 transition-colors">
                  <div className={cn(
                    'w-7 h-7 rounded-full flex items-center justify-center text-[10px] font-bold flex-shrink-0',
                    isDelete ? 'bg-red-100 text-red-600' : 'bg-gold/20 text-gold'
                  )}>
                    {item.uploaderInitials}
                  </div>
                  <div className="text-[13px] text-ink-mid flex-1 min-w-0">
                    <strong className="text-ink">{item.uploaderName}</strong>{' '}
                    {item.description}
                  </div>
                  <span className="text-[11px] text-ink-soft font-mono flex-shrink-0">
                    {item.date.toLocaleDateString('pt-MZ', { day: '2-digit', month: 'short' })}
                  </span>
                </a>
              )
            })}
          </div>
        ) : dbConnected ? (
          <div className="px-4 py-8 text-center text-sm text-ink-soft">
            Ainda não há actividade registada. Começa por{' '}
            <a href="/galeria/upload" className="text-forest font-medium hover:underline">carregar fotos</a>.
          </div>
        ) : (
          <div className="px-4 py-6 text-center text-[12px] text-ink-soft font-mono">
            A aguardar ligação à base de dados…
          </div>
        )}

        {topLocations.length > 0 && (
          <div className="mt-4 flex flex-wrap gap-2">
            {topLocations.map(l => (
              <span key={l.location} className="flex items-center gap-1.5 px-3 py-1.5 bg-white border border-sand-light rounded-full text-[12px] text-ink-mid">
                <MapPin size={10} className="text-gold" />
                {l.location} <span className="font-mono text-ink-soft">· {l.count}</span>
              </span>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
