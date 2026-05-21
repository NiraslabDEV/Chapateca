import { cookies } from 'next/headers'
import { redirect, notFound } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import { prisma } from '@/lib/prisma'
import { getRoleFromCookie } from '@/lib/roles'
import { ArrowLeft, MapPin, Calendar, Download } from 'lucide-react'

const THUMB_COLORS = [
  'linear-gradient(135deg, #6b8e5a, #8aae72)',
  'linear-gradient(135deg, #c8952a, #e5b84a)',
  'linear-gradient(135deg, #3D6B2A, #5a8d3e)',
  'linear-gradient(135deg, #8B6F47, #b08d5e)',
  'linear-gradient(135deg, #1A5C8A, #2a7eb8)',
]

const MOCK_FILES = Array.from({ length: 8 }, (_, i) => ({
  id: `mock-${i}`,
  fileName: `foto_${String(i + 1).padStart(2, '0')}.jpg`,
  googleDriveId: '',
  mimeType: 'image/jpeg',
}))

function formatDate(d: Date) {
  return d.toLocaleDateString('pt-MZ', { day: '2-digit', month: 'long', year: 'numeric' })
}

export default async function AlbumPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const store = await cookies()
  const role = getRoleFromCookie(store.get('chapateca-role')?.value)
  if (!role) redirect('/')

  const { id } = await params
  const isMock = /^\d+$/.test(id)

  type AlbumInfo = { title: string; location: string; date: Date; uploaderName: string }
  let albumInfo: AlbumInfo | null = null
  let files: { id: string; fileName: string; googleDriveId: string; mimeType: string }[] = []

  if (!isMock) {
    try {
      const anchor = await prisma.fileLog.findUnique({
        where: { id },
        include: { uploadedBy: true },
      })
      if (!anchor) return notFound()

      const related = await prisma.fileLog.findMany({
        where: {
          category: 'FOTOS_TERRENO',
          location: anchor.location,
          activityDate: anchor.activityDate,
        },
        orderBy: { createdAt: 'asc' },
      })

      albumInfo = {
        title: anchor.fileName.replace(/\.[^/.]+$/, ''),
        location: anchor.location ?? '',
        date: anchor.activityDate ?? anchor.createdAt,
        uploaderName: anchor.uploadedBy?.name ?? 'Equipa',
      }

      files = related.map(f => ({
        id: f.id,
        fileName: f.fileName,
        googleDriveId: f.googleDriveId,
        mimeType: f.mimeType,
      }))
    } catch {
      return notFound()
    }
  }

  if (isMock || !albumInfo) {
    const MOCK_TITLES = ['', 'Actividade Malhangalene', 'Distribuição de Livros', 'Formação de Voluntários', 'Feira de Leitura', 'Visita Chamanculo']
    const MOCK_LOCS = ['', 'Malhangalene', 'Polana Caniço', 'Sede', 'Maxaquene', 'Chamanculo']
    const idx = parseInt(id) || 1
    albumInfo = {
      title: MOCK_TITLES[idx] ?? 'Álbum',
      location: MOCK_LOCS[idx] ?? 'Maputo',
      date: new Date('2025-06-12'),
      uploaderName: 'Equipa Campo',
    }
    files = MOCK_FILES
  }

  return (
    <div>
      {/* Header */}
      <div className="flex items-start gap-4 mb-8">
        <Link href="/galeria"
              className="mt-1 flex items-center justify-center w-9 h-9 rounded-full border border-sand hover:bg-sand/50 transition-colors flex-shrink-0">
          <ArrowLeft size={16} className="text-ink-mid" />
        </Link>
        <div className="flex-1">
          <h1 className="font-display text-[32px] text-ink leading-tight">{albumInfo.title}</h1>
          <div className="flex items-center gap-3 text-[13px] text-ink-soft font-mono mt-1">
            <span className="flex items-center gap-1.5"><MapPin size={12} />{albumInfo.location}</span>
            <span className="w-1 h-1 rounded-full bg-current opacity-50" />
            <span className="flex items-center gap-1.5"><Calendar size={12} />{formatDate(albumInfo.date)}</span>
            <span className="w-1 h-1 rounded-full bg-current opacity-50" />
            <span>{files.length} foto{files.length !== 1 ? 's' : ''}</span>
          </div>
        </div>
      </div>

      {/* Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
        {files.map((file, idx) => {
          const isReal = file.googleDriveId && !file.googleDriveId.startsWith('mock-')
          const proxyUrl = isReal ? `/api/drive/image/${file.googleDriveId}` : null
          const isImage = file.mimeType.startsWith('image/')

          return (
            <div key={file.id}
                 className="group relative rounded-2xl overflow-hidden border border-sand-light
                            hover:border-forest-light hover:shadow-[0_4px_20px_rgba(22,20,18,0.12)]
                            transition-all bg-white">
              {/* Thumbnail */}
              <div className="aspect-square w-full relative overflow-hidden">
                {proxyUrl && isImage ? (
                  <Image
                    src={proxyUrl}
                    alt={file.fileName}
                    fill
                    className="object-cover"
                    sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
                    unoptimized
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center"
                       style={{ background: THUMB_COLORS[idx % THUMB_COLORS.length] }}>
                    <span className="text-[11px] text-white/60 font-mono uppercase tracking-wider px-2 py-1 bg-black/20 rounded">
                      {isReal ? file.mimeType.split('/')[1]?.toUpperCase() : 'demo'}
                    </span>
                  </div>
                )}

                {/* Download overlay on hover (fotos reais) */}
                {proxyUrl && (
                  <a href={proxyUrl} download={file.fileName}
                     className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity
                                flex items-center justify-center">
                    <span className="flex items-center gap-1.5 px-4 py-2 bg-white/90 rounded-full
                                     text-[12px] font-semibold text-ink hover:bg-white transition-colors">
                      <Download size={13} /> Guardar
                    </span>
                  </a>
                )}
              </div>

              {/* Filename bar */}
              <div className="px-3 py-2 flex items-center gap-2">
                <span className="text-[11px] text-ink-soft font-mono truncate flex-1">{file.fileName}</span>
                {proxyUrl && (
                  <a href={proxyUrl} download={file.fileName}
                     className="flex-shrink-0 text-ink-soft hover:text-ink transition-colors">
                    <Download size={12} />
                  </a>
                )}
              </div>
            </div>
          )
        })}
      </div>

      {isMock && (
        <p className="text-center text-[12px] text-ink-soft font-mono mt-8">
          Modo demonstração — fotos reais aparecerão após upload
        </p>
      )}
    </div>
  )
}
