import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { prisma } from '@/lib/prisma'
import { getRoleFromCookie } from '@/lib/roles'
import { Upload, MapPin, Calendar } from 'lucide-react'
import AlbumActions from '@/components/galeria/album-actions'

// Mock data quando não há registos na DB
const MOCK_ALBUMS = [
  { id: '1', fileName: 'Actividade Malhangalene', location: 'Malhangalene', activityDate: new Date('2025-06-12'), count: 14, uploaderName: 'Equipa Campo', uploaderInitials: 'EC' },
  { id: '2', fileName: 'Distribuição de Livros', location: 'Polana Caniço', activityDate: new Date('2025-06-08'), count: 8, uploaderName: 'Equipa Campo', uploaderInitials: 'EC' },
  { id: '3', fileName: 'Formação de Voluntários', location: 'Sede', activityDate: new Date('2025-06-01'), count: 22, uploaderName: 'Equipa Campo', uploaderInitials: 'EC' },
  { id: '4', fileName: 'Feira de Leitura', location: 'Maxaquene', activityDate: new Date('2025-05-25'), count: 31, uploaderName: 'Equipa Campo', uploaderInitials: 'EC' },
  { id: '5', fileName: 'Visita Chamanculo', location: 'Chamanculo', activityDate: new Date('2025-05-14'), count: 17, uploaderName: 'Equipa Campo', uploaderInitials: 'EC' },
]

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

function groupByMonth(items: typeof MOCK_ALBUMS) {
  return items.reduce((acc, item) => {
    const key = item.activityDate.toLocaleDateString('pt-MZ', { month: 'long', year: 'numeric' })
    if (!acc[key]) acc[key] = []
    acc[key].push(item)
    return acc
  }, {} as Record<string, typeof MOCK_ALBUMS>)
}

export default async function GaleriaPage() {
  const store = await cookies()
  const role = getRoleFromCookie(store.get('chapateca-role')?.value)
  if (!role) redirect('/')

  // Tenta buscar dados reais, cai no mock se DB não estiver configurada
  let albums = MOCK_ALBUMS
  try {
    const logs = await prisma.fileLog.findMany({
      where: { category: 'FOTOS_TERRENO' },
      orderBy: { activityDate: 'desc' },
      include: { uploadedBy: true },
    })
    if (logs.length > 0) {
      albums = logs.map(l => ({
        id: l.id,
        fileName: l.activityName || l.fileName,
        location: l.location ?? '',
        activityDate: l.activityDate ?? l.createdAt,
        count: 1,
        uploaderName: l.uploadedBy?.name ?? 'Equipa',
        uploaderInitials: (l.uploadedBy?.name ?? 'EQ').split(' ').map((w: string) => w[0]).join('').slice(0, 2).toUpperCase(),
      }))
    }
  } catch { /* DB não configurada ainda */ }

  const grouped = groupByMonth(albums)
  const total = albums.reduce((a, b) => a + b.count, 0)

  return (
    <div>
      <div className="flex items-end justify-between mb-8 gap-6">
        <div>
          <h1 className="font-display text-[34px] text-ink leading-tight">Galeria do Terreno</h1>
          <p className="text-ink-soft text-sm mt-1">{total} fotos em {albums.length} actividades</p>
        </div>
        <Link href="/galeria/upload"
              className="flex items-center gap-2 px-5 py-3 bg-gold text-forest font-bold text-sm rounded-full shadow-gold hover:-translate-y-0.5 transition-all">
          <Upload size={16} /> Carregar Fotos
        </Link>
      </div>

      {Object.entries(grouped).map(([month, items]) => (
        <div key={month} className="mb-10">
          <div className="text-[13px] font-display uppercase tracking-[0.12em] text-ink-soft mb-4 flex items-center gap-3
                          after:flex-1 after:h-px after:bg-sand after:content-['']">
            {month}
          </div>

          <div className="flex flex-col gap-3">
            {items.map((album, idx) => (
              <div key={album.id}
                   className="flex items-center gap-5 p-5 bg-white border border-sand-light rounded-2xl
                              hover:border-forest-light hover:shadow-[0_4px_20px_rgba(22,20,18,0.10)] hover:-translate-y-px
                              transition-all cursor-pointer">
                {/* Thumb strip */}
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

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <h4 className="font-display text-[20px] text-ink mb-1.5">{album.fileName}</h4>
                  <div className="flex items-center gap-3 text-[12px] text-ink-soft font-mono mb-3">
                    <span className="flex items-center gap-1"><MapPin size={11} />{album.location}</span>
                    <span className="w-1 h-1 rounded-full bg-current opacity-60" />
                    <span className="flex items-center gap-1"><Calendar size={11} />{formatDate(album.activityDate)}</span>
                    <span className="w-1 h-1 rounded-full bg-current opacity-60" />
                    <span>{album.count} fotos</span>
                  </div>
                  <div className="flex items-center gap-1.5 text-[12px] text-ink-mid">
                    <div className="w-5 h-5 rounded-full bg-gold/80 flex items-center justify-center text-[8px] font-bold text-white">{album.uploaderInitials}</div>
                    {album.uploaderName}
                  </div>
                </div>

                {/* Actions */}
                <AlbumActions albumId={album.id} />
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  )
}
