'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Upload, Eye, Download, FolderOpen, Clock, X, ExternalLink, FileText, FileSpreadsheet, AlertCircle, ChevronDown, ChevronRight, Trash2 } from 'lucide-react'
import { cn } from '@/lib/utils'
import CriarPasta from './criar-pasta'
import ConfirmDeleteModal from '@/components/ui/confirm-delete-modal'
import { deleteFolderAction, deleteDocAction, type DocCategory } from '@/lib/folder-actions'

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

function timeAgo(iso: string) {
  const diff = Date.now() - new Date(iso).getTime()
  const mins = Math.floor(diff / 60000)
  if (mins < 60) return `${mins}m`
  const hrs = Math.floor(mins / 60)
  if (hrs < 24) return `${hrs}h`
  const days = Math.floor(hrs / 24)
  if (days < 30) return `${days}d`
  return new Date(iso).toLocaleDateString('pt-MZ', { day: '2-digit', month: 'short' })
}

export type FileItem = {
  id: string
  driveId: string
  title: string
  fileName: string
  fileType: string
  fileSize: number | null
  uploaderName: string
  uploaderInitials: string
  createdAt: string
}

export type GrandSubFolderItem = {
  id: string
  name: string
  totalCount: number
  files: FileItem[]
}

export type SubFolderItem = {
  id: string
  name: string
  totalCount: number
  files: FileItem[]
  children?: GrandSubFolderItem[]
}

export type FolderItem = {
  id: string
  name: string
  totalCount: number
  files: FileItem[]
  children?: SubFolderItem[]
}

interface Props {
  category: DocCategory
  folders: FolderItem[]
  accentColor: string
  accentBg: string
  uploadHref: string
  dbConnected: boolean
}

function FileRow({
  file,
  accentColor,
  onPreview,
  onDelete,
}: {
  file: FileItem
  accentColor: string
  onPreview: (f: FileItem) => void
  onDelete: (f: FileItem) => void
}) {
  return (
    <div className="flex items-center gap-3 px-6 py-3 group hover:bg-parchment-2 transition-colors">
      <div className={cn('w-8 h-8 rounded-lg flex items-center justify-center text-[9px] font-bold text-white font-mono flex-shrink-0', TYPE_COLORS[file.fileType] ?? 'bg-ink-soft')}>
        {file.fileType}
      </div>
      <div className="flex-1 min-w-0">
        <div className="text-sm font-medium text-ink truncate">{file.title}</div>
        <div className="flex items-center gap-2 text-[11px] text-ink-soft font-mono mt-0.5">
          <span className="flex items-center gap-1">
            <span className="w-4 h-4 rounded-full flex items-center justify-center text-[7px] font-bold" style={{ background: `${accentColor}25`, color: accentColor }}>
              {file.uploaderInitials}
            </span>
            {file.uploaderName}
          </span>
          <span>·</span>
          <span>{timeAgo(file.createdAt)}</span>
          {formatBytes(file.fileSize) && <><span>·</span><span>{formatBytes(file.fileSize)}</span></>}
        </div>
      </div>
      <div className="flex gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity">
        <button
          onClick={() => onPreview(file)}
          className="flex items-center gap-1 px-2.5 py-1 border border-sand rounded-lg text-[11px] font-medium text-ink-mid hover:border-ink-soft transition-colors"
        >
          <Eye size={11} /> Ver
        </button>
        <a href={`/api/drive/doc/${file.driveId}?download=1`}
           className="flex items-center gap-1 px-2.5 py-1 border border-sand rounded-lg text-[11px] font-medium text-ink-mid hover:border-ink-soft transition-colors">
          <Download size={11} /> Baixar
        </a>
        <button
          onClick={() => onDelete(file)}
          title="Apagar ficheiro"
          className="flex items-center px-2 py-1 border border-red-200 rounded-lg text-red-600 hover:border-red-400 hover:bg-red-50 transition-colors"
        >
          <Trash2 size={11} />
        </button>
      </div>
    </div>
  )
}

function GrandSubFolderCard({
  grand,
  accentColor,
  accentBg,
  uploadHref,
  onPreview,
  onDeleteFile,
  onDeleteFolder,
}: {
  grand: GrandSubFolderItem
  accentColor: string
  accentBg: string
  uploadHref: string
  onPreview: (f: FileItem) => void
  onDeleteFile: (f: FileItem) => void
  onDeleteFolder: (folder: { id: string; name: string }) => void
}) {
  const [open, setOpen] = useState(true)

  return (
    <div className="ml-5 mt-2 border border-sand-light/70 rounded-lg overflow-hidden">
      <div
        className="flex items-center justify-between px-3 py-2 border-b border-sand-light/70 cursor-pointer"
        style={{ background: `${accentBg}60` }}
        onClick={() => setOpen(o => !o)}
      >
        <div className="flex items-center gap-1.5">
          {open ? <ChevronDown size={12} style={{ color: accentColor }} /> : <ChevronRight size={12} style={{ color: accentColor }} />}
          <FolderOpen size={13} style={{ color: accentColor }} />
          <span className="text-[13px] font-medium" style={{ color: accentColor }}>{grand.name}</span>
          <span className="text-[10px] font-mono px-1.5 py-0.5 rounded-full bg-white/60" style={{ color: accentColor }}>
            {grand.totalCount}
          </span>
        </div>
        <div className="flex items-center gap-1.5">
          <Link
            href={`${uploadHref}?folder=${grand.id}`}
            onClick={e => e.stopPropagation()}
            style={{ color: accentColor, borderColor: `${accentColor}40` }}
            className="flex items-center gap-1 px-2 py-0.5 border rounded-md text-[10px] font-semibold bg-white/60 hover:bg-white transition-colors"
          >
            <Upload size={10} /> Carregar
          </Link>
          <button
            onClick={e => { e.stopPropagation(); onDeleteFolder({ id: grand.id, name: grand.name }) }}
            title="Apagar sub-sub-pasta"
            className="flex items-center px-1.5 py-0.5 border border-red-200 bg-white/60 rounded-md text-red-600 hover:border-red-400 hover:bg-red-50 transition-colors"
          >
            <Trash2 size={10} />
          </button>
        </div>
      </div>

      {open && (
        grand.files.length > 0 ? (
          <div className="divide-y divide-sand-light">
            {grand.files.map(file => (
              <FileRow key={file.id} file={file} accentColor={accentColor} onPreview={onPreview} onDelete={onDeleteFile} />
            ))}
            {grand.totalCount > 5 && (
              <div className="px-6 py-2 flex items-center gap-1.5 text-[11px] text-ink-soft font-mono">
                <Clock size={10} /> +{grand.totalCount - 5} documentos anteriores
              </div>
            )}
          </div>
        ) : (
          <div className="px-6 py-3 text-center text-[12px] text-ink-soft">
            Vazia — carrega o primeiro documento.
          </div>
        )
      )}
    </div>
  )
}

function SubFolderCard({
  sub,
  category,
  accentColor,
  accentBg,
  uploadHref,
  onPreview,
  onDeleteFile,
  onDeleteFolder,
}: {
  sub: SubFolderItem
  category: DocCategory
  accentColor: string
  accentBg: string
  uploadHref: string
  onPreview: (f: FileItem) => void
  onDeleteFile: (f: FileItem) => void
  onDeleteFolder: (folder: { id: string; name: string; isSub?: boolean }) => void
}) {
  const [open, setOpen] = useState(true)

  return (
    <div className="ml-6 mt-3 border border-sand-light rounded-xl overflow-hidden">
      <div
        className="flex items-center justify-between px-4 py-3 border-b border-sand-light cursor-pointer"
        style={{ background: `${accentBg}80` }}
        onClick={() => setOpen(o => !o)}
      >
        <div className="flex items-center gap-2">
          {open ? <ChevronDown size={14} style={{ color: accentColor }} /> : <ChevronRight size={14} style={{ color: accentColor }} />}
          <FolderOpen size={15} style={{ color: accentColor }} />
          <span className="text-sm font-semibold" style={{ color: accentColor }}>{sub.name}</span>
          <span className="text-[10px] font-mono px-1.5 py-0.5 rounded-full bg-white/60" style={{ color: accentColor }}>
            {sub.totalCount} doc{sub.totalCount !== 1 ? 's' : ''}
          </span>
        </div>
        <div className="flex items-center gap-2" onClick={e => e.stopPropagation()}>
          <CriarPasta category={category} accentColor={accentColor} parentId={sub.id} label="Sub-pasta" />
          <Link
            href={`${uploadHref}?folder=${sub.id}`}
            style={{ color: accentColor, borderColor: `${accentColor}40` }}
            className="flex items-center gap-1 px-2.5 py-1 border rounded-lg text-[11px] font-semibold bg-white/60 hover:bg-white transition-colors"
          >
            <Upload size={11} /> Carregar
          </Link>
          <button
            onClick={() => onDeleteFolder({ id: sub.id, name: sub.name, isSub: true })}
            title="Apagar sub-pasta"
            className="flex items-center px-2 py-1 border border-red-200 bg-white/60 rounded-lg text-red-600 hover:border-red-400 hover:bg-red-50 transition-colors"
          >
            <Trash2 size={11} />
          </button>
        </div>
      </div>

      {open && (
        <>
          {sub.files.length > 0 ? (
            <div className="divide-y divide-sand-light">
              {sub.files.map(file => (
                <FileRow key={file.id} file={file} accentColor={accentColor} onPreview={onPreview} onDelete={onDeleteFile} />
              ))}
              {sub.totalCount > 5 && (
                <div className="px-6 py-2.5 flex items-center gap-1.5 text-xs text-ink-soft font-mono">
                  <Clock size={11} /> +{sub.totalCount - 5} documentos anteriores
                </div>
              )}
            </div>
          ) : (
            (sub.children ?? []).length === 0 && (
              <div className="px-6 py-5 text-center text-sm text-ink-soft">
                Sub-pasta vazia — carrega um documento ou cria uma sub-sub-pasta.
              </div>
            )
          )}

          {(sub.children ?? []).length > 0 && (
            <div className="px-3 py-2">
              {sub.children!.map(grand => (
                <GrandSubFolderCard
                  key={grand.id}
                  grand={grand}
                  accentColor={accentColor}
                  accentBg={accentBg}
                  uploadHref={uploadHref}
                  onPreview={onPreview}
                  onDeleteFile={onDeleteFile}
                  onDeleteFolder={(f) => onDeleteFolder({ ...f, isSub: true })}
                />
              ))}
            </div>
          )}
        </>
      )}
    </div>
  )
}

export default function ModuloContent({ category, folders, accentColor, accentBg, uploadHref, dbConnected }: Props) {
  const router = useRouter()
  const [selectedFile, setSelectedFile] = useState<FileItem | null>(null)
  const [fileToDelete, setFileToDelete] = useState<FileItem | null>(null)
  const [folderToDelete, setFolderToDelete] = useState<{ id: string; name: string; isSub?: boolean } | null>(null)

  return (
    <>
      {/* Folders */}
      {folders.length > 0 ? (
        <div className="flex flex-col gap-6">
          {folders.map(folder => (
            <div key={folder.id} className="bg-white border border-sand-light rounded-2xl overflow-hidden shadow-[0_2px_8px_rgba(22,20,18,0.06)]">
              {/* Folder header */}
              <div className="flex items-center justify-between px-6 py-4 border-b border-sand-light" style={{ background: accentBg }}>
                <div className="flex items-center gap-2.5">
                  <FolderOpen size={18} style={{ color: accentColor }} />
                  <h2 className="font-display text-[20px]" style={{ color: accentColor }}>{folder.name}</h2>
                  <span className="text-[11px] font-mono px-2 py-0.5 rounded-full bg-white/60" style={{ color: accentColor }}>
                    {folder.totalCount} doc{folder.totalCount !== 1 ? 's' : ''}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <CriarPasta category={category} accentColor={accentColor} parentId={folder.id} label="Sub-pasta" />
                  <Link href={`${uploadHref}?folder=${folder.id}`}
                        style={{ color: accentColor, borderColor: `${accentColor}40` }}
                        className="flex items-center gap-1.5 px-3 py-1.5 border rounded-lg text-xs font-semibold bg-white/60 hover:bg-white transition-colors">
                    <Upload size={12} /> Carregar
                  </Link>
                  <button
                    onClick={() => setFolderToDelete({ id: folder.id, name: folder.name })}
                    title="Apagar pasta (e tudo dentro)"
                    className="flex items-center px-2.5 py-1.5 border border-red-200 bg-white/60 rounded-lg text-red-600 hover:border-red-400 hover:bg-red-50 transition-colors"
                  >
                    <Trash2 size={12} />
                  </button>
                </div>
              </div>

              {/* Files */}
              {folder.files.length > 0 ? (
                <div className="divide-y divide-sand-light">
                  {folder.files.map(file => (
                    <FileRow key={file.id} file={file} accentColor={accentColor} onPreview={setSelectedFile} onDelete={setFileToDelete} />
                  ))}
                  {folder.totalCount > 5 && (
                    <div className="px-6 py-3 flex items-center gap-1.5 text-xs text-ink-soft font-mono">
                      <Clock size={11} /> +{folder.totalCount - 5} documentos anteriores
                    </div>
                  )}
                </div>
              ) : (
                <div className="px-6 py-6 text-center text-sm text-ink-soft">
                  Pasta vazia — carrega o primeiro documento.
                </div>
              )}

              {/* Sub-pastas */}
              {(folder.children ?? []).length > 0 && (
                <div className="px-4 pb-4">
                  {folder.children!.map(sub => (
                    <SubFolderCard
                      key={sub.id}
                      sub={sub}
                      category={category}
                      accentColor={accentColor}
                      accentBg={accentBg}
                      uploadHref={uploadHref}
                      onPreview={setSelectedFile}
                      onDeleteFile={setFileToDelete}
                      onDeleteFolder={setFolderToDelete}
                    />
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      ) : dbConnected ? (
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <div className="w-16 h-16 rounded-2xl flex items-center justify-center mb-4" style={{ background: accentBg }}>
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

      {/* Preview panel */}
      {selectedFile && (
        <>
          <div className="fixed inset-0 z-40 bg-black/25" style={{ top: '4rem' }} onClick={() => setSelectedFile(null)} />
          <div className="fixed right-0 z-50 bg-white border-l border-sand-light shadow-2xl flex flex-col w-full md:w-[500px]"
               style={{ top: '4rem', height: 'calc(100vh - 4rem)' }}>
            <div className="flex items-center gap-3 px-5 py-4 border-b border-sand-light flex-shrink-0">
              <div className={cn('w-10 h-10 rounded-xl flex items-center justify-center text-[10px] font-bold text-white font-mono flex-shrink-0', TYPE_COLORS[selectedFile.fileType] ?? 'bg-ink-soft')}>
                {selectedFile.fileType === 'XLSX' ? <FileSpreadsheet size={18} /> : selectedFile.fileType === 'DOCX' ? <FileText size={18} /> : selectedFile.fileType}
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-sm font-semibold text-ink truncate leading-tight">{selectedFile.title}</div>
                <div className="text-[11px] text-ink-soft font-mono mt-0.5 truncate">{selectedFile.fileName}</div>
              </div>
              <button onClick={() => setSelectedFile(null)} className="w-8 h-8 rounded-xl flex items-center justify-center hover:bg-parchment-2 text-ink-soft transition-colors flex-shrink-0">
                <X size={16} />
              </button>
            </div>
            <div className="flex-1 min-h-0 bg-parchment">
              {selectedFile.fileType === 'PDF' && !selectedFile.driveId.startsWith('mock-') ? (
                <iframe src={`/api/drive/doc/${selectedFile.driveId}`} className="w-full h-full border-0" title={selectedFile.title} />
              ) : (
                <div className="flex flex-col items-center justify-center h-full gap-4 text-center px-10">
                  {selectedFile.driveId.startsWith('mock-') ? (
                    <>
                      <AlertCircle size={40} className="text-ink-soft/40" />
                      <div>
                        <p className="text-sm font-medium text-ink mb-1">Ficheiro de demonstração</p>
                        <p className="text-xs text-ink-soft">Este documento não tem ficheiro real associado.</p>
                      </div>
                    </>
                  ) : (
                    <>
                      {selectedFile.fileType === 'XLSX' ? <FileSpreadsheet size={48} className="text-ink-soft/40" /> : <FileText size={48} className="text-ink-soft/40" />}
                      <div>
                        <p className="text-sm font-medium text-ink mb-1">Pré-visualização não disponível</p>
                        <p className="text-xs text-ink-soft">Ficheiros {selectedFile.fileType} não podem ser visualizados inline.<br />Usa &quot;Ver documento completo&quot; para abrir no browser.</p>
                      </div>
                    </>
                  )}
                </div>
              )}
            </div>
            <div className="flex gap-2 p-4 border-t border-sand-light flex-shrink-0">
              <a href={`/api/drive/doc/${selectedFile.driveId}`} target="_blank" rel="noopener noreferrer"
                 className="flex-1 py-2.5 text-white text-sm font-semibold rounded-xl flex items-center justify-center gap-1.5 hover:opacity-90 transition-opacity"
                 style={{ background: accentColor }}>
                <ExternalLink size={14} /> Ver documento completo
              </a>
              <a href={`/api/drive/doc/${selectedFile.driveId}?download=1`}
                 className="flex items-center gap-1.5 px-4 py-2.5 border border-sand rounded-xl text-sm text-ink-mid hover:bg-parchment-2 transition-colors">
                <Download size={14} /> Baixar
              </a>
            </div>
          </div>
        </>
      )}

      {/* Modal: apagar ficheiro */}
      <ConfirmDeleteModal
        open={!!fileToDelete}
        onClose={() => setFileToDelete(null)}
        title="Apagar ficheiro?"
        description={fileToDelete ? `O ficheiro "${fileToDelete.title}" será removido permanentemente do portal e do Google Drive. Esta acção é irreversível.` : ''}
        onConfirm={async () => {
          if (!fileToDelete) return { ok: false }
          const res = await deleteDocAction(fileToDelete.id)
          if (res.ok) router.refresh()
          return res
        }}
      />

      {/* Modal: apagar pasta (ou sub-pasta) */}
      <ConfirmDeleteModal
        open={!!folderToDelete}
        onClose={() => setFolderToDelete(null)}
        title={folderToDelete?.isSub ? 'Apagar sub-pasta?' : 'Apagar pasta?'}
        description={folderToDelete
          ? `A pasta "${folderToDelete.name}" e ${folderToDelete.isSub ? 'todos os ficheiros dentro dela' : 'todas as suas sub-pastas e ficheiros'} serão eliminados do portal e do Google Drive. Esta acção é irreversível.`
          : ''}
        onConfirm={async () => {
          if (!folderToDelete) return { ok: false }
          const res = await deleteFolderAction(folderToDelete.id)
          if (res.ok) router.refresh()
          return res
        }}
      />
    </>
  )
}
