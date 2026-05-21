import { cookies } from 'next/headers'
import { redirect, notFound } from 'next/navigation'
import Link from 'next/link'
import { prisma } from '@/lib/prisma'
import { getRoleFromCookie } from '@/lib/roles'
import { ArrowLeft, MapPin, Calendar, Download, ExternalLink } from 'lucide-react'

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
  shareLink: null as string | null,
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

  // Mock fallback para IDs que não são cuid
  const isMock = /^\d+$/.test(id)

  type AlbumInfo = {
    title: string
    location: string
    date: Date
    uploaderName: string
  }

  let albumInfo: AlbumInfo | null = null
  let files: { id: string; fileName: string; googleDriveId: string; shareLink: string | null; mimeType: string }[] = []

  if (!isMock) {
    try {
      const anchor = await prisma.fileLog.findUnique({
        where: { id },
        include: { uploadedBy: true },
      })
      if (!anchor) return notFound()

      // Busca todos os ficheiros do mesmo local + data
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
        shareLink: f.shareLink,
        mimeType: f.mimeType,
      }))
    } catch {
      return notFound()
    }
  }

  // Mock data
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
          const isMockFile = file.googleDriveId.startsWith('mock-') || file.googleDriveId === ''
          const driveViewUrl = isMockFile
            ? null
            : `https://drive.google.com/file/d/${file.googleDriveId}/view`

          return (
            <div key={file.id} className="group relative rounded-2xl overflow-hidden border border-sand-light
                                          hover:border-forest-light hover:shadow-[0_4px_20px_rgba(22,20,18,0.12)]
                                          transition-all">
              {/* Thumbnail */}
              <div className="aspect-square w-full flex items-center justify-center relative"
                   style={{ background: THUMB_COLORS[idx % THUMB_COLORS.length] }}>
                <span className="text-[11px] text-white/60 font-mono uppercase tracking-wider px-2 py-1 bg-black/20 rounded">
                  {isMockFile ? 'preview' : file.mimeType.split('/')[1]?.toUpperCase() ?? 'IMG'}
                </span>

                {/* Overlay on hover */}
                {driveViewUrl && (
                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity
                                  flex items-center justify-center gap-2">
                    <a href={driveViewUrl} target="_blank" rel="noopener noreferrer"
                       className="flex items-center gap-1 px-3 py-1.5 bg-white/90 rounded-full text-[11px] font-semibold text-ink hover:bg-white transition-colors">
                      <ExternalLink size={11} /> Abrir
                    </a>
                  </div>
                )}
              </div>

              {/* Info bar */}
              <div className="px-3 py-2 bg-white flex items-center justify-between gap-2">
                <span className="text-[11px] text-ink-soft font-mono truncate">{file.fileName}</span>
                {driveViewUrl && (
                  <a href={driveViewUrl} target="_blank" rel="noopener noreferrer"
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
