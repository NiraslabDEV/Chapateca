import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { getRoleFromCookie, ROLES } from '@/lib/roles'
import { prisma } from '@/lib/prisma'
import { Upload } from 'lucide-react'
import CriarPasta from './criar-pasta'
import ModuloContent from './modulo-content'
import type { DocCategory } from '@/lib/folder-actions'

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

  let folders: Parameters<typeof ModuloContent>[0]['folders'] = []
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
          createdAt: fl.createdAt.toISOString(), // serializable for client boundary
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
          {folders.length > 0 && <CriarPasta category={category} accentColor={accentColor} />}
          <Link
            href={uploadHref}
            style={{ background: accentColor }}
            className="flex items-center gap-2 px-5 py-2.5 text-white font-bold text-sm rounded-xl hover:opacity-90 transition-opacity"
          >
            <Upload size={15} /> Carregar
          </Link>
        </div>
      </div>

      <ModuloContent
        category={category}
        folders={folders}
        accentColor={accentColor}
        accentBg={accentBg}
        uploadHref={uploadHref}
        dbConnected={dbConnected}
      />
    </div>
  )
}
