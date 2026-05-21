import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { getRoleFromCookie, ROLES } from '@/lib/roles'
import { prisma } from '@/lib/prisma'
import { Upload, Eye, Download, FolderOpen, Clock } from 'lucide-react'
import { cn } from '@/lib/utils'
import CriarPasta from './criar-pasta'
import type { DocCategory } from '@/lib/folder-actions'

const TYPE_COLORS: Record<string, string> = {
  PDF: 'bg-red-600',
  XLSX: 'bg-green-700',
  DOCX: 'bg-blue-700',
}

function formatBytes(bytes: number | null) {
  if (!bytes) return null
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} KB`
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
}

function timeAgo(d: Date) {
  const diff = Date.now() - d.getTime()
  const mins = Math.floor(diff / 60000)
  if (mins < 60) return `${mins}m`
  const hrs = Math.floor(mins / 60)
  if (hrs < 24) return `${hrs}h`
  const days = Math.floor(hrs / 24)
  if (days < 30) return `${days}d`
  return d.toLocaleDateString('pt-MZ', { day: '2-digit', month: 'short' })
}

type FileRow = {
  id: string
  driveId: string
  title: string
  fileName: string
  fileType: string
  fileSize: number | null
  uploaderName: string
  uploaderInitials: string
  createdAt: Date
  isMock: boolean
}

type FolderData = {
  id: string
  name: string
  totalCount: number
  files: FileRow[]
}

interface ModuloPageProps {
  category: DocCategory
  accessKey: 'manuais' | 'estrategia' | 'financas'
  title: string
  subtitle: string
  accentColor: string
  accentBg: string
  uploadHref: string
}

export default async function ModuloPage({
  category,
  accessKey,
  title,
  subtitle,
  accentColor,
  accentBg,
  uploadHref,
}: ModuloPageProps) {
  const store = await cookies()
  const role = getRoleFromCookie(store.get('chapateca-role')?.value)
  if (!role) redirect('/')

  const r = ROLES[role]
  if (!r.access[accessKey]) redirect('/acesso-negado')

  let folders: FolderData[] = []
  let dbConnected = false

  try {
    const raw = await prisma.folder.findMany({
      where: { category },
      orderBy: { createdAt: 'asc' },
      include: {
        _count: { select: { files: true } },
        files: {
          take: 5,
          orderBy: { createdAt: 'desc' },
          include: { uploadedBy: true },
        },
      },
    })
    dbConnected = true
    folders = raw.map(f => ({
      id: f.id,
      name: f.name,
      totalCount: f._count.files,
      files: f.files.map(fl => {
        const name = fl.uploadedBy?.name ?? 'Equipa'
        return {
          id: fl.id,
          driveId: fl.googleDriveId,
          title: fl.activityName || fl.fileName,
          fileName: fl.fileName,
          fileType: fl.fileType,
          fileSize: (fl as { fileSize?: number | null }).fileSize ?? null,
          uploaderName: name,
          uploaderInitials: name.split(' ').map((w: string) => w[0]).join('').slice(0, 2).toUpperCase(),
          createdAt: fl.createdAt,
          isMock: false,
        }
      }),
    }))
  } catch { /* DB não disponível */ }

  const totalFiles = folders.reduce((a, f) => a + f.totalCount, 0)

  return (
    <div>
      {/* Header */}
      <div className="flex items-start justify-between mb-8 gap-4">
        <div>
          <h1 className="font-display text-[34px] text-ink leading-tight">{title}</h1>
          <p className="text-ink-soft text-sm mt-1">
            {dbConnected
              ? `${folders.length} pasta${folders.length !== 1 ? 's' : ''} · ${totalFiles} documento${totalFiles !== 1 ? 's' : ''}`
              : subtitle}
          </p>
        </div>
        <div className="flex items-center gap-2 flex-shrink-0">
          <CriarPasta category={category} accentColor={accentColor} />
          <Link
            href={uploadHref}
            style={{ background: accentColor }}
            className="flex items-center gap-2 px-5 py-2.5 text-white font-bold text-sm rounded-xl hover:opacity-90 transition-opacity"
          >
            <Upload size={15} /> Carregar
          </Link>
        </div>
      </div>

      {/* Folders grid */}
      {folders.length > 0 ? (
        <div className="flex flex-col gap-6">
          {folders.map(folder => (
            <FolderCard
              key={folder.id}
              folder={folder}
              accentColor={accentColor}
              accentBg={accentBg}
              uploadHref={uploadHref}
            />
          ))}
        </div>
      ) : dbConnected ? (
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <div className="w-16 h-16 rounded-2xl flex items-center justify-center mb-4"
               style={{ background: accentBg }}>
            <FolderOpen size={28} style={{ color: accentColor }} />
          </div>
          <p className="font-display text-xl text-ink mb-1">Nenhuma pasta criada ainda</p>
          <p className="text-sm text-ink-soft mb-5">Cria uma pasta para começar a organizar os documentos</p>
          <CriarPasta category={category} accentColor={accentColor} />
        </div>
      ) : (
        <div className="py-8 text-center text-[12px] text-ink-soft font-mono">
          A aguardar ligação à base de dados…
        </div>
      )}
    </div>
  )
}

function FolderCard({
  folder,
  accentColor,
  accentBg,
  uploadHref,
}: {
  folder: FolderData
  accentColor: string
  accentBg: string
  uploadHref: string
}) {
  return (
    <div className="bg-white border border-sand-light rounded-2xl overflow-hidden shadow-[0_2px_8px_rgba(22,20,18,0.06)]">
      {/* Folder header */}
      <div className="flex items-center justify-between px-6 py-4 border-b border-sand-light"
           style={{ background: accentBg }}>
        <div className="flex items-center gap-2.5">
          <FolderOpen size={18} style={{ color: accentColor }} />
          <h2 className="font-display text-[20px]" style={{ color: accentColor }}>{folder.name}</h2>
          <span className="text-[11px] font-mono px-2 py-0.5 rounded-full bg-white/60" style={{ color: accentColor }}>
            {folder.totalCount} doc{folder.totalCount !== 1 ? 's' : ''}
          </span>
        </div>
        <Link
          href={`${uploadHref}?folder=${folder.id}`}
          style={{ color: accentColor, borderColor: `${accentColor}40` }}
          className="flex items-center gap-1.5 px-3 py-1.5 border rounded-lg text-xs font-semibold bg-white/60 hover:bg-white transition-colors"
        >
          <Upload size={12} /> Carregar
        </Link>
      </div>

      {/* File list */}
      {folder.files.length > 0 ? (
        <div className="divide-y divide-sand-light">
          {folder.files.map(file => (
            <FileRow key={file.id} file={file} accentColor={accentColor} />
          ))}
          {folder.totalCount > 5 && (
            <div className="px-6 py-3 flex items-center gap-1.5 text-xs text-ink-soft font-mono">
              <Clock size={11} /> +{folder.totalCount - 5} documentos anteriores
            </div>
          )}
        </div>
      ) : (
        <div className="px-6 py-8 text-center text-sm text-ink-soft">
          Pasta vazia — carrega o primeiro documento.
        </div>
      )}
    </div>
  )
}

function FileRow({ file, accentColor }: { file: FileRow; accentColor: string }) {
  const viewUrl = `/api/drive/doc/${file.driveId}`
  const downloadUrl = `/api/drive/doc/${file.driveId}?download=1`
  const size = formatBytes(file.fileSize)

  return (
    <div className="flex items-center gap-3 px-6 py-3 group hover:bg-parchment-2 transition-colors">
      {/* Type badge */}
      <div className={cn(
        'w-8 h-8 rounded-lg flex items-center justify-center text-[9px] font-bold text-white font-mono flex-shrink-0',
        TYPE_COLORS[file.fileType] ?? 'bg-ink-soft'
      )}>
        {file.fileType}
      </div>

      {/* Info */}
      <div className="flex-1 min-w-0">
        <div className="text-sm font-medium text-ink truncate">{file.title}</div>
        <div className="flex items-center gap-2 text-[11px] text-ink-soft font-mono mt-0.5">
          <span className="flex items-center gap-1">
            <span className="w-4 h-4 rounded-full bg-ink-soft/20 flex items-center justify-center text-[7px] font-bold" style={{ background: `${accentColor}25`, color: accentColor }}>
              {file.uploaderInitials}
            </span>
            {file.uploaderName}
          </span>
          <span>·</span>
          <span>{timeAgo(file.createdAt)}</span>
          {size && <><span>·</span><span>{size}</span></>}
        </div>
      </div>

      {/* Actions */}
      <div className="flex gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity">
        {file.fileType === 'PDF' && (
          <a href={viewUrl} target="_blank" rel="noopener noreferrer"
             className="flex items-center gap-1 px-2.5 py-1 border border-sand rounded-lg text-[11px] font-medium text-ink-mid hover:border-ink-soft transition-colors">
            <Eye size={11} /> Ver
          </a>
        )}
        <a href={downloadUrl}
           className="flex items-center gap-1 px-2.5 py-1 border border-sand rounded-lg text-[11px] font-medium text-ink-mid hover:border-ink-soft transition-colors">
          <Download size={11} /> Baixar
        </a>
      </div>
    </div>
  )
}
