export const dynamic = 'force-dynamic'

import Link from 'next/link'
import { prisma } from '@/lib/prisma'
import { ACTIVITY_TYPES } from '@/lib/activity-types'
import { MapPin, Calendar, Camera, ArrowRight } from 'lucide-react'

export const metadata = {
  title: 'Projectos de Campo · Chapateca',
  description: 'Acompanha as actividades das bibliotecas comunitárias da Chapateca em Maputo. Histórico transparente de cada projecto no terreno.',
}

function formatDate(d: Date) {
  return d.toLocaleDateString('pt-MZ', { day: 'numeric', month: 'long', year: 'numeric' })
}

function groupByMonth<T extends { activityDate: Date }>(items: T[]) {
  return items.reduce((acc, item) => {
    const key = item.activityDate.toLocaleDateString('pt-MZ', { month: 'long', year: 'numeric' })
    if (!acc[key]) acc[key] = []
    acc[key].push(item)
    return acc
  }, {} as Record<string, T[]>)
}

export default async function ProjetosPublicPage() {
  let albums: {
    id: string
    activityName: string | null
    location: string
    activityDate: Date
    activityType: string | null
    participants: number | null
    coverDriveId: string | null
    photoCount: number
  }[] = []

  try {
    const raw = await prisma.album.findMany({
      where: { isPublic: true },
      orderBy: [{ activityDate: 'desc' }, { createdAt: 'desc' }],
      include: {
        photos: { orderBy: { createdAt: 'asc' }, take: 1, select: { googleDriveId: true } },
        _count: { select: { photos: true } },
      },
    })
    albums = raw.map(a => ({
      id: a.id,
      activityName: a.activityName,
      location: a.location,
      activityDate: a.activityDate,
      activityType: a.activityType,
      participants: a.participants,
      coverDriveId: a.photos[0]?.googleDriveId ?? null,
      photoCount: a._count.photos,
    }))
  } catch { /* DB indisponível */ }

  const grouped = groupByMonth(albums)
  const totalPhotos = albums.reduce((a, b) => a + b.photoCount, 0)

  return (
    <div className="min-h-screen bg-[#FAF8F4]">
      {/* Hero */}
      <header
        className="px-6 py-16 sm:py-24 text-white"
        style={{ background: 'linear-gradient(135deg, #461882 0%, #6B2D10 100%)' }}
      >
        <div className="max-w-4xl mx-auto text-center">
          <div className="text-3xl sm:text-4xl font-bold tracking-tight mb-1">Chapateca</div>
          <div className="text-xs sm:text-sm opacity-70 mb-8 tracking-[0.25em] uppercase">Projectos no Terreno</div>
          <h1 className="text-3xl sm:text-5xl font-bold leading-tight mb-5">O que andamos a fazer</h1>
          <p className="text-sm sm:text-base opacity-80 max-w-2xl mx-auto leading-relaxed">
            Histórico transparente das nossas actividades nas bibliotecas comunitárias.
            Cada projecto, cada formação, cada visita ao terreno — para que possas ver de perto o impacto que estamos a construir juntos.
          </p>
          {albums.length > 0 && (
            <div className="flex items-center justify-center gap-6 mt-10 text-sm">
              <div>
                <div className="text-2xl sm:text-3xl font-bold">{albums.length}</div>
                <div className="text-xs opacity-70 uppercase tracking-wider mt-0.5">Actividades</div>
              </div>
              <div className="w-px h-10 bg-white/20" />
              <div>
                <div className="text-2xl sm:text-3xl font-bold">{totalPhotos}</div>
                <div className="text-xs opacity-70 uppercase tracking-wider mt-0.5">Fotos</div>
              </div>
            </div>
          )}
        </div>
      </header>

      {/* Lista */}
      <main className="max-w-5xl mx-auto px-4 sm:px-6 py-12 sm:py-16">
        {albums.length === 0 ? (
          <div className="text-center py-20">
            <div className="w-16 h-16 mx-auto rounded-2xl bg-purple-100 flex items-center justify-center mb-4">
              <Camera size={28} className="text-purple-400" />
            </div>
            <p className="text-lg font-semibold text-gray-700 mb-1">Ainda sem projectos publicados</p>
            <p className="text-sm text-gray-400">Volta em breve — estamos a preparar conteúdo do terreno.</p>
          </div>
        ) : (
          Object.entries(grouped).map(([month, items]) => (
            <section key={month} className="mb-14">
              <div className="text-xs font-bold uppercase tracking-[0.2em] text-gray-400 mb-5 flex items-center gap-3 after:flex-1 after:h-px after:bg-gray-200 after:content-['']">
                {month}
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                {items.map(album => (
                  <Link
                    key={album.id}
                    href={`/projetos/${album.id}`}
                    className="group bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-xl transition-all hover:-translate-y-1 border border-gray-100"
                  >
                    {/* Cover */}
                    <div className="relative aspect-[4/3] bg-gradient-to-br from-purple-100 to-amber-100 overflow-hidden">
                      {album.coverDriveId && !album.coverDriveId.startsWith('mock-') ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                          src={`/api/projeto/${album.id}/${album.coverDriveId}?w=600`}
                          alt={album.activityName || album.location}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                          loading="lazy"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <Camera size={32} className="text-purple-300" />
                        </div>
                      )}
                      <div className="absolute top-3 right-3 bg-black/60 backdrop-blur-sm rounded-full px-2.5 py-1 text-[11px] font-semibold text-white flex items-center gap-1">
                        <Camera size={11} /> {album.photoCount}
                      </div>
                    </div>
                    {/* Body */}
                    <div className="p-5">
                      <h3 className="font-bold text-base text-gray-900 mb-2 leading-tight line-clamp-2">
                        {album.activityName || `Actividade · ${album.location}`}
                      </h3>
                      <div className="flex items-center gap-3 text-[12px] text-gray-500 mb-3">
                        <span className="flex items-center gap-1">
                          <MapPin size={11} /> {album.location}
                        </span>
                        <span className="w-1 h-1 rounded-full bg-gray-300" />
                        <span className="flex items-center gap-1">
                          <Calendar size={11} /> {formatDate(album.activityDate)}
                        </span>
                      </div>
                      <div className="flex items-center justify-between">
                        {album.activityType ? (
                          <span className="text-[11px] px-2 py-1 rounded-full bg-purple-50 text-purple-700 font-medium">
                            {ACTIVITY_TYPES[album.activityType] ?? album.activityType}
                          </span>
                        ) : <span />}
                        <span className="text-[12px] font-semibold text-purple-700 flex items-center gap-1 group-hover:gap-2 transition-all">
                          Ver <ArrowRight size={13} />
                        </span>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            </section>
          ))
        )}
      </main>

      {/* Footer */}
      <footer className="text-center py-10 text-xs text-gray-400 border-t border-gray-100 mt-8">
        <p>© Chapateca · Bibliotecas Comunitárias · Maputo, Moçambique</p>
        <p className="mt-1">
          <a href="https://www.chapateca.org" target="_blank" rel="noopener noreferrer"
             className="hover:text-gray-600 transition-colors">
            www.chapateca.org
          </a>
          <span className="mx-2">·</span>
          <a href="mailto:info.chapateca@gmail.com" className="hover:text-gray-600 transition-colors">
            info.chapateca@gmail.com
          </a>
        </p>
      </footer>
    </div>
  )
}
