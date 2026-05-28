export const dynamic = 'force-dynamic'

import { prisma } from '@/lib/prisma'
import { ACTIVITY_TYPES } from '@/lib/activity-types'
import { MapPin, Calendar, Users, Download } from 'lucide-react'
import DownloadAllPhotos from '@/components/galeria/download-all-photos'

export default async function PublicAlbumPage({
  params,
}: {
  params: Promise<{ token: string }>
}) {
  const { token } = await params

  let album: {
    id: string
    activityName: string | null
    location: string
    activityDate: Date
    activityType: string | null
    participants: number | null
    observations: string | null
    photos: { id: string; fileName: string; googleDriveId: string; mimeType: string }[]
  } | null = null

  try {
    album = await prisma.album.findUnique({
      where: { shareToken: token },
      include: { photos: { orderBy: { createdAt: 'asc' } } },
    })
  } catch {
    /* DB unavailable */
  }

  if (!album) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#FAF8F4]">
        <div className="text-center px-6">
          <div className="text-5xl mb-4">🔗</div>
          <h1 className="text-xl font-semibold text-gray-800 mb-2">Link inválido ou expirado</h1>
          <p className="text-sm text-gray-500">Este link de partilha não existe ou foi removido.</p>
        </div>
      </div>
    )
  }

  const title = album.activityName || 'Projecto de Campo'
  const formattedDate = album.activityDate.toLocaleDateString('pt-MZ', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  })

  return (
    <div className="min-h-screen bg-[#FAF8F4]">
      {/* Header */}
      <div
        className="px-6 py-12 text-white text-center"
        style={{ background: 'linear-gradient(135deg, #461882 0%, #6B2D10 100%)' }}
      >
        <div className="max-w-2xl mx-auto">
          <div className="text-2xl font-bold tracking-tight mb-1">Chapateca</div>
          <div className="text-sm opacity-70 mb-8 tracking-widest uppercase">Projecto de Campo</div>
          <h1 className="text-3xl font-bold leading-tight mb-4">{title}</h1>
          <div className="flex flex-wrap items-center justify-center gap-4 text-sm opacity-85">
            <span className="flex items-center gap-1.5">
              <MapPin size={14} />
              {album.location}
            </span>
            <span className="w-1 h-1 rounded-full bg-white/50" />
            <span className="flex items-center gap-1.5">
              <Calendar size={14} />
              {formattedDate}
            </span>
            {album.participants && (
              <>
                <span className="w-1 h-1 rounded-full bg-white/50" />
                <span className="flex items-center gap-1.5">
                  <Users size={14} />
                  {album.participants} participantes
                </span>
              </>
            )}
          </div>
          {album.activityType && (
            <div className="mt-4">
              <span className="inline-block px-3 py-1 rounded-full text-xs font-semibold bg-white/20 border border-white/30">
                {ACTIVITY_TYPES[album.activityType] ?? album.activityType}
              </span>
            </div>
          )}
          {album.photos.length > 0 && (
            <div className="mt-6">
              <DownloadAllPhotos
                urls={album.photos
                  .filter(p => !p.googleDriveId.startsWith('mock-'))
                  .map(p => p.googleDriveId)}
                token={token}
              />
            </div>
          )}
        </div>
      </div>

      {/* Photo grid */}
      <div className="max-w-4xl mx-auto px-4 py-10">
        {album.photos.length > 0 ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            {album.photos.map((photo, idx) => {
              const isMock = !photo.googleDriveId || photo.googleDriveId.startsWith('mock-')
              const MOCK_COLORS = [
                'linear-gradient(135deg, #6b8e5a, #8aae72)',
                'linear-gradient(135deg, #c8952a, #e5b84a)',
                'linear-gradient(135deg, #3D6B2A, #5a8d3e)',
                'linear-gradient(135deg, #8B6F47, #b08d5e)',
                'linear-gradient(135deg, #1A5C8A, #2a7eb8)',
                'linear-gradient(135deg, #461882, #7c3aed)',
              ]
              return (
                <div key={photo.id} className="group relative aspect-square rounded-xl overflow-hidden bg-gray-100 shadow-sm">
                  {isMock ? (
                    <div
                      className="w-full h-full flex items-center justify-center"
                      style={{ background: MOCK_COLORS[idx % MOCK_COLORS.length] }}
                    >
                      <span className="text-[10px] text-white/60 font-mono uppercase tracking-wider px-2 py-1 bg-black/20 rounded">
                        foto
                      </span>
                    </div>
                  ) : (
                    <>
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={`/api/photo/${token}/${photo.googleDriveId}?w=600`}
                        alt={photo.fileName}
                        className="w-full h-full object-cover"
                        loading="lazy"
                      />
                      <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-end justify-end p-2">
                        <a
                          href={`/api/photo/${token}/${photo.googleDriveId}?download=1`}
                          download={photo.fileName}
                          className="flex items-center gap-1.5 px-3 py-1.5 bg-white/90 rounded-full text-[12px] font-semibold text-gray-800 hover:bg-white transition-colors"
                        >
                          <Download size={12} /> Guardar
                        </a>
                      </div>
                    </>
                  )}
                </div>
              )
            })}
          </div>
        ) : (
          <p className="text-center text-sm text-gray-400 py-12">Nenhuma foto neste álbum.</p>
        )}

        {/* Observations */}
        {album.observations && (
          <div className="mt-10 bg-white rounded-2xl border border-gray-100 p-6 shadow-sm">
            <div className="flex items-start gap-3">
              <div className="text-3xl text-purple-200 font-serif leading-none mt-0.5">&ldquo;</div>
              <div>
                <div className="text-xs text-gray-400 font-mono uppercase tracking-wider mb-2">Observações</div>
                <p className="text-sm text-gray-700 leading-relaxed">{album.observations}</p>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Footer */}
      <footer className="text-center py-8 text-xs text-gray-400 border-t border-gray-100 mt-4">
        <p>© Chapateca · Maputo, Moçambique</p>
        <p className="mt-1">
          <a href="https://www.chapateca.org" target="_blank" rel="noopener noreferrer"
             className="hover:text-gray-600 transition-colors">
            www.chapateca.org
          </a>
        </p>
      </footer>
    </div>
  )
}
