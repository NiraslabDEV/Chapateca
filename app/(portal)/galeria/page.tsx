import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { prisma } from '@/lib/prisma'
import { getRoleFromCookie } from '@/lib/roles'
import { Upload, MapPin, Calendar, Image as ImageIcon } from 'lucide-react'
import { ACTIVITY_TYPES } from '@/lib/activity-types'
import AlbumActions from '@/components/galeria/album-actions'
import MarketingGrid from '@/components/galeria/marketing-grid'
import { cn } from '@/lib/utils'

const THUMB_COLORS = [
  'linear-gradient(135deg, #6b8e5a, #8aae72)',
  'linear-gradient(135deg, #c8952a, #e5b84a)',
  'linear-gradient(135deg, #3D6B2A, #5a8d3e)',
  'linear-gradient(135deg, #8B6F47, #b08d5e)',
  'linear-gradient(135deg, #1A5C8A, #2a7eb8)',
]

function formatDate(d: Date) {
  return d.toLocaleDateString('pt-MZ', { day: '2-digit', month: 'short', year: 'numeric' })
}

function groupByMonth<T extends { activityDate: Date }>(items: T[]) {
  return items.reduce((acc, item) => {
    const key = item.activityDate.toLocaleDateString('pt-MZ', { month: 'long', year: 'numeric' })
    if (!acc[key]) acc[key] = []
    acc[key].push(item)
    return acc
  }, {} as Record<string, T[]>)
}

export type MarketingAsset = {
  id: string
  driveId: string
  title: string
  fileName: string
  tag: string
  uploaderName: string
  uploaderInitials: string
  createdAt: string
}

export default async function GaleriaPage({
  searchParams,
}: {
  searchParams: Promise<{ tab?: string }>
}) {
  const store = await cookies()
  const role = getRoleFromCookie(store.get('chapateca-role')?.value)
  if (!role) redirect('/')

  const { tab } = await searchParams
  const activeTab = tab === 'marketing' ? 'marketing' : 'terreno'

  // Counts for tab badges
  let albumCount = 0
  let marketingCount = 0
  try {
    ;[albumCount, marketingCount] = await Promise.all([
      prisma.album.count(),
      prisma.fileLog.count({ where: { category: 'MARKETING' } }),
    ])
  } catch { /* DB indisponível */ }

  // ── Terreno data ───────────────────────────────────────────────────────
  type AlbumEntry = {
    id: string; title: string; location: string; activityDate: Date
    count: number; uploaderName: string; uploaderInitials: string
    activityType: string | null; participants: number | null
  }

  let albums: AlbumEntry[] = []
  let terrenoDbConnected = false

  if (activeTab === 'terreno') {
    try {
      const dbAlbums = await prisma.album.findMany({
        orderBy: { activityDate: 'desc' },
        include: { _count: { select: { photos: true } }, uploadedBy: true },
      })
      terrenoDbConnected = true
      albums = dbAlbums.map(a => ({
        id: a.id,
        title: a.activityName || `Actividade · ${a.location}`,
        location: a.location,
        activityDate: a.activityDate,
        count: a._count.photos,
        uploaderName: a.uploadedBy?.name ?? 'Equipa',
        uploaderInitials: (a.uploadedBy?.name ?? 'EQ').split(' ').map((w: string) => w[0]).join('').slice(0, 2).toUpperCase(),
        activityType: a.activityType,
        participants: a.participants,
      }))
    } catch { /* DB indisponível */ }
  }

  // ── Marketing data ─────────────────────────────────────────────────────
  let marketingAssets: MarketingAsset[] = []
  let marketingDbConnected = false

  if (activeTab === 'marketing') {
    try {
      const rows = await prisma.fileLog.findMany({
        where: { category: 'MARKETING' },
        orderBy: { createdAt: 'desc' },
        include: { uploadedBy: true },
      })
      marketingDbConnected = true
      marketingAssets = rows.map(r => {
        const name = r.uploadedBy?.name ?? 'Equipa'
        return {
          id: r.id,
          driveId: r.googleDriveId,
          title: r.activityName || r.fileName,
          fileName: r.fileName,
          tag: r.location || 'outro',
          uploaderName: name,
          uploaderInitials: name.split(' ').map((w: string) => w[0]).join('').slice(0, 2).toUpperCase(),
          createdAt: r.createdAt.toISOString(),
        }
      })
    } catch { /* DB indisponível */ }
  }

  const grouped = groupByMonth(albums)
  const totalPhotos = albums.reduce((a, b) => a + b.count, 0)

  return (
    <div>
      {/* Header */}
      <div className="flex items-start justify-between mb-6 gap-4">
        <div>
          <h1 className="font-display text-[34px] text-ink leading-tight">Galeria</h1>
          <p className="text-ink-soft text-sm mt-1">
            {activeTab === 'terreno'
              ? terrenoDbConnected ? `${totalPhotos} fotos em ${albums.length} actividades` : 'Fotos das actividades de campo'
              : marketingDbConnected ? `${marketingCount} activos de marca` : 'Logos, peças e fotos de divulgação'}
          </p>
        </div>
        <Link
          href={activeTab === 'terreno' ? '/galeria/upload' : '/galeria/marketing/upload'}
          className={cn(
            'flex items-center gap-2 px-5 py-2.5 font-bold text-sm rounded-full hover:-translate-y-0.5 transition-all flex-shrink-0',
            activeTab === 'terreno'
              ? 'bg-gold text-forest shadow-gold'
              : 'bg-[#461882] text-white shadow-[0_4px_14px_rgba(70,24,130,0.35)]'
          )}
        >
          <Upload size={15} />
          {activeTab === 'terreno' ? 'Carregar Fotos' : 'Carregar Activo'}
        </Link>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-1 mb-8 border-b border-sand">
        <Link
          href="/galeria"
          className={cn(
            'flex items-center gap-2 px-4 py-2.5 text-sm font-semibold border-b-2 -mb-px transition-colors',
            activeTab === 'terreno'
              ? 'border-forest text-forest'
              : 'border-transparent text-ink-soft hover:text-ink'
          )}
        >
          <MapPin size={14} /> Galeria do Terreno
          {albumCount > 0 && (
            <span className={cn('text-[10px] font-mono px-1.5 py-0.5 rounded-full', activeTab === 'terreno' ? 'bg-forest/10 text-forest' : 'bg-parchment-2 text-ink-soft')}>
              {albumCount}
            </span>
          )}
        </Link>
        <Link
          href="/galeria?tab=marketing"
          className={cn(
            'flex items-center gap-2 px-4 py-2.5 text-sm font-semibold border-b-2 -mb-px transition-colors',
            activeTab === 'marketing'
              ? 'border-[#461882] text-[#461882]'
              : 'border-transparent text-ink-soft hover:text-ink'
          )}
        >
          <ImageIcon size={14} /> Marketing & Marca
          {marketingCount > 0 && (
            <span className={cn('text-[10px] font-mono px-1.5 py-0.5 rounded-full', activeTab === 'marketing' ? 'bg-[#461882]/10 text-[#461882]' : 'bg-parchment-2 text-ink-soft')}>
              {marketingCount}
            </span>
          )}
        </Link>
      </div>

      {/* ── Tab: Terreno ── */}
      {activeTab === 'terreno' && (
        <>
          {!terrenoDbConnected ? (
            <div className="py-8 text-center text-[12px] text-ink-soft font-mono">A aguardar ligação à base de dados…</div>
          ) : albums.length === 0 ? (
            <div className="flex flex-col items-center py-20 text-center">
              <div className="w-16 h-16 rounded-2xl bg-forest/10 flex items-center justify-center mb-4">
                <MapPin size={28} className="text-forest" />
              </div>
              <p className="font-display text-xl text-ink mb-1">Nenhuma actividade registada</p>
              <p className="text-sm text-ink-soft mb-5">Carrega as primeiras fotos do terreno para começar</p>
              <Link href="/galeria/upload"
                    className="flex items-center gap-2 px-5 py-2.5 bg-gold text-forest font-bold text-sm rounded-full shadow-gold hover:-translate-y-0.5 transition-all">
                <Upload size={15} /> Carregar Fotos
              </Link>
            </div>
          ) : (
            Object.entries(grouped).map(([month, items]) => (
              <div key={month} className="mb-10">
                <div className="text-[13px] font-display uppercase tracking-[0.12em] text-ink-soft mb-4 flex items-center gap-3 after:flex-1 after:h-px after:bg-sand after:content-['']">
                  {month}
                </div>
                <div className="flex flex-col gap-3">
                  {items.map((album, idx) => (
                    <div key={album.id}
                         className="flex items-center gap-5 p-5 bg-white border border-sand-light rounded-2xl hover:border-forest-light hover:shadow-[0_4px_20px_rgba(22,20,18,0.10)] hover:-translate-y-px transition-all cursor-pointer">
                      <div className="grid grid-cols-2 gap-1.5 flex-shrink-0">
                        {[0, 1, 2, 3].map(i => (
                          <div key={i} className="w-20 h-20 rounded-lg flex items-center justify-center"
                               style={{ background: THUMB_COLORS[(idx + i) % THUMB_COLORS.length] }}>
                            {i === 0 && (
                              <span className="text-[9px] text-white/70 font-mono uppercase tracking-wider px-1.5 py-0.5 bg-black/20 rounded">
                                {album.location.slice(0, 4)}
                              </span>
                            )}
                          </div>
                        ))}
                      </div>
                      <div className="flex-1 min-w-0">
                        <h4 className="font-display text-[20px] text-ink mb-1.5">{album.title}</h4>
                        <div className="flex items-center gap-3 text-[12px] text-ink-soft font-mono mb-2">
                          <span className="flex items-center gap-1"><MapPin size={11} />{album.location}</span>
                          <span className="w-1 h-1 rounded-full bg-current opacity-60" />
                          <span className="flex items-center gap-1"><Calendar size={11} />{formatDate(album.activityDate)}</span>
                          <span className="w-1 h-1 rounded-full bg-current opacity-60" />
                          <span>{album.count} fotos</span>
                        </div>
                        {(album.activityType || album.participants) && (
                          <div className="flex items-center gap-2 mb-2">
                            {album.activityType && (
                              <span className="text-[11px] px-2 py-0.5 rounded-full bg-forest/10 text-forest font-medium">
                                {ACTIVITY_TYPES[album.activityType] ?? album.activityType}
                              </span>
                            )}
                            {album.participants && (
                              <span className="text-[11px] text-ink-soft font-mono">{album.participants} participantes</span>
                            )}
                          </div>
                        )}
                        <div className="flex items-center gap-1.5 text-[12px] text-ink-mid">
                          <div className="w-5 h-5 rounded-full bg-gold/80 flex items-center justify-center text-[8px] font-bold text-white">{album.uploaderInitials}</div>
                          {album.uploaderName}
                        </div>
                      </div>
                      <AlbumActions albumId={album.id} />
                    </div>
                  ))}
                </div>
              </div>
            ))
          )}
        </>
      )}

      {/* ── Tab: Marketing ── */}
      {activeTab === 'marketing' && (
        <MarketingGrid
          assets={marketingAssets}
          dbConnected={marketingDbConnected}
        />
      )}
    </div>
  )
}
