'use client'

import { useEffect, useState, useCallback } from 'react'
import { Folder, FileText, Image as ImageIcon, Video, ChevronRight, Loader2, AlertCircle, Download, Home, ArrowLeft, RefreshCw } from 'lucide-react'

interface DriveItem {
  id: string
  name: string
  mimeType: string
  modifiedTime: string
  size?: number
}

interface BrowseResult {
  folder: { id: string; name: string }
  parents: { id: string; name: string }[]
  folders: DriveItem[]
  files: DriveItem[]
}

const ROOT_ID = 'root:CHAPATECA'
const ROOT_NAME = 'CHAPATECA-PORTAL'

function formatBytes(n?: number) {
  if (!n) return ''
  if (n < 1024) return `${n} B`
  if (n < 1024 * 1024) return `${(n / 1024).toFixed(0)} KB`
  return `${(n / 1024 / 1024).toFixed(1)} MB`
}
function formatDate(iso: string) {
  if (!iso) return ''
  try {
    return new Date(iso).toLocaleDateString('pt-MZ', { day: '2-digit', month: 'short', year: 'numeric' })
  } catch { return '' }
}

function fileIcon(mimeType: string) {
  if (mimeType.startsWith('image/')) return <ImageIcon size={14} className="text-purple-600" />
  if (mimeType.startsWith('video/')) return <Video size={14} className="text-red-500" />
  return <FileText size={14} className="text-ink-soft" />
}

export default function DriveBrowser() {
  const [folderId, setFolderId] = useState<string>(ROOT_ID)
  const [data, setData]     = useState<BrowseResult | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError]   = useState<string | null>(null)

  const fetchFolder = useCallback(async (id: string) => {
    setLoading(true)
    setError(null)
    try {
      const res = await fetch(`/api/drive/browse/${encodeURIComponent(id)}`)
      if (!res.ok) {
        const j = await res.json().catch(() => ({}))
        setError(j.error || `Erro ${res.status}`)
        setData(null)
        return
      }
      const json = await res.json()
      setData(json)
    } catch (e) {
      setError((e as Error).message)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { fetchFolder(folderId) }, [folderId, fetchFolder])

  const isAtRoot = folderId === ROOT_ID || (data?.parents.length === 0 && data?.folder.id !== ROOT_ID)

  return (
    <div>
      {/* Aviso "modo leitura" */}
      <div className="mb-5 p-3.5 border border-amber-200 bg-amber-50 rounded-xl flex items-start gap-2.5">
        <AlertCircle size={16} className="text-amber-700 flex-shrink-0 mt-0.5" />
        <div className="text-[12.5px] text-amber-900 leading-relaxed">
          <strong>Modo de leitura — Drive completo.</strong> Mostra <em>todas</em> as pastas e ficheiros que estão no Drive da Chapateca, incluindo material histórico ou pastas criadas directamente (ex: <code>05. Fotos de Terreno</code>, <code>06. EVENTOS</code>, <code>10. Coco PRO</code>). Para novos uploads continua a usar <em>Carregar Fotos</em> para que fiquem registados na base de dados.
        </div>
      </div>

      {/* Breadcrumb + actions */}
      <div className="flex items-center gap-2 mb-4 flex-wrap">
        <button
          onClick={() => setFolderId(ROOT_ID)}
          disabled={isAtRoot}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-sand text-[12px] font-medium text-ink-mid hover:border-ink-soft hover:text-ink transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <Home size={12} /> {ROOT_NAME}
        </button>
        {data?.parents.map(p => (
          <span key={p.id} className="flex items-center gap-2">
            <ChevronRight size={12} className="text-ink-soft" />
            <button
              onClick={() => setFolderId(p.id)}
              className="text-[12px] font-medium text-ink-mid hover:text-ink hover:underline transition-colors"
            >
              {p.name}
            </button>
          </span>
        ))}
        {data && !isAtRoot && (
          <span className="flex items-center gap-2">
            <ChevronRight size={12} className="text-ink-soft" />
            <span className="text-[12px] font-semibold text-ink">{data.folder.name}</span>
          </span>
        )}

        <div className="ml-auto flex items-center gap-2">
          {data && !isAtRoot && data.parents.length > 0 && (
            <button
              onClick={() => setFolderId(data.parents[data.parents.length - 1].id)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-sand text-[12px] font-medium text-ink-mid hover:border-ink-soft hover:text-ink transition-colors"
            >
              <ArrowLeft size={12} /> Subir
            </button>
          )}
          <button
            onClick={() => fetchFolder(folderId)}
            disabled={loading}
            title="Recarregar"
            className="flex items-center justify-center w-8 h-8 rounded-lg border border-sand text-ink-mid hover:border-ink-soft hover:text-ink transition-colors disabled:opacity-50"
          >
            <RefreshCw size={13} className={loading ? 'animate-spin' : ''} />
          </button>
        </div>
      </div>

      {/* Loading state */}
      {loading && (
        <div className="flex items-center justify-center py-12 text-ink-soft">
          <Loader2 size={20} className="animate-spin" />
        </div>
      )}

      {/* Error state */}
      {error && !loading && (
        <div className="p-5 border border-red-200 bg-red-50 rounded-xl text-sm text-red-700">
          <strong>Erro:</strong> {error}
        </div>
      )}

      {/* Empty state */}
      {!loading && !error && data && data.folders.length === 0 && data.files.length === 0 && (
        <div className="py-12 text-center text-sm text-ink-soft">
          Pasta vazia.
        </div>
      )}

      {/* Folders */}
      {!loading && data && data.folders.length > 0 && (
        <div className="mb-6">
          <p className="text-[11px] font-semibold text-ink-soft uppercase tracking-[0.08em] mb-2">
            Pastas ({data.folders.length})
          </p>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2.5">
            {data.folders.map(f => (
              <button
                key={f.id}
                onClick={() => setFolderId(f.id)}
                className="flex items-center gap-2.5 p-3 bg-white border border-sand-light rounded-xl hover:border-forest-light hover:shadow-[0_2px_8px_rgba(22,20,18,0.08)] transition-all text-left"
              >
                <div className="w-9 h-9 rounded-lg bg-amber-100 flex items-center justify-center flex-shrink-0">
                  <Folder size={16} className="text-amber-600" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-[13px] font-medium text-ink truncate">{f.name}</p>
                  <p className="text-[10px] text-ink-soft font-mono">{formatDate(f.modifiedTime)}</p>
                </div>
                <ChevronRight size={13} className="text-ink-soft flex-shrink-0" />
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Files */}
      {!loading && data && data.files.length > 0 && (
        <div>
          <p className="text-[11px] font-semibold text-ink-soft uppercase tracking-[0.08em] mb-2">
            Ficheiros ({data.files.length})
          </p>
          {/* Grid de imagens (thumbnails) */}
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
            {data.files.map(f => {
              const isImage = f.mimeType.startsWith('image/')
              return (
                <div key={f.id}
                     className="group relative rounded-xl overflow-hidden border border-sand-light bg-white hover:shadow-[0_2px_8px_rgba(22,20,18,0.08)] transition-all">
                  <div className="aspect-square w-full relative bg-parchment-2 flex items-center justify-center">
                    {isImage ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={`/api/drive/image/${f.id}?w=400`}
                        alt={f.name}
                        loading="lazy"
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="flex flex-col items-center gap-1.5 text-ink-soft">
                        {fileIcon(f.mimeType)}
                        <span className="text-[10px] font-mono uppercase">
                          {f.mimeType.split('/')[1]?.split('.').pop() || 'file'}
                        </span>
                      </div>
                    )}
                    {/* Hover: download */}
                    <a
                      href={`/api/drive/image/${f.id}`}
                      download={f.name}
                      className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center"
                    >
                      <span className="flex items-center gap-1.5 px-3 py-1.5 bg-white/90 rounded-full text-[11px] font-semibold text-ink">
                        <Download size={11} /> Guardar
                      </span>
                    </a>
                  </div>
                  <div className="px-2.5 py-1.5">
                    <p className="text-[11px] text-ink truncate font-medium">{f.name}</p>
                    <p className="text-[10px] text-ink-soft font-mono">
                      {formatDate(f.modifiedTime)} {f.size ? `· ${formatBytes(f.size)}` : ''}
                    </p>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      )}
    </div>
  )
}
