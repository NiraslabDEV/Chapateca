'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { generateShareToken, deleteAlbumAction, toggleAlbumPublicAction } from '@/app/(portal)/galeria/actions'
import { Share2, Eye, Check, Loader2, Trash2, AlertTriangle, X, Globe, Lock } from 'lucide-react'
import Link from 'next/link'

interface Props {
  albumId: string
  canDelete?: boolean   // só admins
  isPublic?: boolean    // estado inicial
  onDeleteRedirect?: string // p/ ex. '/galeria' quando estamos dentro do álbum
}

export default function AlbumActions({ albumId, canDelete = false, isPublic = true, onDeleteRedirect }: Props) {
  const router = useRouter()
  const [copied, setCopied]     = useState(false)
  const [confirming, setConfirm] = useState(false)
  const [deleteErr, setDeleteErr] = useState<string | null>(null)
  const [shareLoading, startShare]   = useTransition()
  const [deleteLoading, startDelete] = useTransition()
  const [togglePending, startToggle] = useTransition()
  const [localPublic, setLocalPublic] = useState(isPublic)

  const handleToggle = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    const next = !localPublic
    setLocalPublic(next)
    startToggle(async () => {
      const res = await toggleAlbumPublicAction(albumId, next)
      if (!res.ok) setLocalPublic(!next) // reverter
      else router.refresh()
    })
  }

  const handleShare = () => {
    startShare(async () => {
      const url = `${window.location.origin}/projetos/${albumId}`
      try { await navigator.clipboard.writeText(url) } catch { /* ignore */ }
      // mantém fallback: gera token legado para links antigos
      await generateShareToken(albumId).catch(() => null)
      setCopied(true)
      setTimeout(() => setCopied(false), 2500)
    })
  }

  const handleDelete = () => {
    setDeleteErr(null)
    startDelete(async () => {
      const res = await deleteAlbumAction(albumId)
      if (!res.ok) {
        setDeleteErr(res.error ?? 'Erro a apagar')
        return
      }
      setConfirm(false)
      if (onDeleteRedirect) router.push(onDeleteRedirect)
      else router.refresh()
    })
  }

  return (
    <>
      <div className="flex gap-2 flex-shrink-0">
        <button
          onClick={handleToggle}
          disabled={togglePending}
          title={localPublic ? 'Visível em /projetos' : 'Privado — só visível no portal'}
          className={[
            'flex items-center gap-1.5 px-3 py-2 border rounded-lg text-[12px] font-medium transition-colors disabled:opacity-60',
            localPublic
              ? 'border-green-200 bg-green-50 text-green-700 hover:border-green-400'
              : 'border-sand text-ink-soft hover:border-ink-soft hover:text-ink',
          ].join(' ')}>
          {togglePending ? (
            <Loader2 size={13} className="animate-spin" />
          ) : localPublic ? (
            <Globe size={13} />
          ) : (
            <Lock size={13} />
          )}
          {localPublic ? 'Público' : 'Privado'}
        </button>
        <button
          onClick={handleShare}
          disabled={shareLoading}
          className="flex items-center gap-1.5 px-3 py-2 border border-sand rounded-lg text-[12px] font-medium
                     text-ink-mid hover:border-ink-soft hover:text-ink transition-colors disabled:opacity-60">
          {shareLoading ? (
            <Loader2 size={13} className="animate-spin" />
          ) : copied ? (
            <Check size={13} className="text-green-600" />
          ) : (
            <Share2 size={13} />
          )}
          {copied ? 'Copiado!' : 'Partilhar'}
        </button>
        <Link
          href={`/galeria/${albumId}`}
          className="flex items-center gap-1.5 px-3 py-2 border border-sand rounded-lg text-[12px] font-medium
                     text-ink-mid hover:border-ink-soft hover:text-ink transition-colors">
          <Eye size={13} /> Ver
        </Link>
        {canDelete && (
          <button
            onClick={() => setConfirm(true)}
            title="Apagar álbum"
            className="flex items-center gap-1.5 px-2.5 py-2 border border-red-200 rounded-lg text-[12px] font-medium
                       text-red-600 hover:border-red-400 hover:bg-red-50 transition-colors">
            <Trash2 size={13} />
          </button>
        )}
      </div>

      {/* Modal de confirmação */}
      {confirming && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-4"
             style={{ background: 'rgba(10,6,22,0.7)', backdropFilter: 'blur(4px)' }}
             onClick={() => !deleteLoading && setConfirm(false)}>
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-6 animate-card-in"
               onClick={e => e.stopPropagation()}>
            <div className="flex items-start gap-3 mb-4">
              <div className="w-10 h-10 rounded-full bg-red-100 flex items-center justify-center flex-shrink-0">
                <AlertTriangle size={20} className="text-red-600" />
              </div>
              <div className="flex-1">
                <h3 className="font-display text-[18px] text-ink mb-1">Apagar álbum?</h3>
                <p className="text-[13px] text-ink-mid leading-relaxed">
                  Esta acção é <strong>irreversível</strong>. O álbum, todas as suas fotos e os ficheiros correspondentes no Google Drive serão eliminados.
                </p>
              </div>
              <button onClick={() => !deleteLoading && setConfirm(false)}
                      className="w-7 h-7 rounded-lg flex items-center justify-center hover:bg-sand/60 transition-colors flex-shrink-0">
                <X size={14} className="text-ink-mid" />
              </button>
            </div>

            {deleteErr && (
              <div className="mb-4 p-3 border border-red-200 bg-red-50 rounded-lg text-[12px] text-red-700">
                {deleteErr}
              </div>
            )}

            <div className="flex gap-2 mt-2">
              <button onClick={() => setConfirm(false)} disabled={deleteLoading}
                      className="flex-1 py-2.5 border border-sand rounded-xl text-sm text-ink-mid hover:bg-parchment-2 transition-colors disabled:opacity-50">
                Cancelar
              </button>
              <button onClick={handleDelete} disabled={deleteLoading}
                      className="flex-[2] py-2.5 bg-red-600 text-white rounded-xl text-sm font-semibold
                                 hover:bg-red-700 transition-colors disabled:opacity-60
                                 flex items-center justify-center gap-2">
                {deleteLoading ? <Loader2 size={14} className="animate-spin" /> : <Trash2 size={14} />}
                {deleteLoading ? 'A apagar...' : 'Apagar definitivamente'}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
