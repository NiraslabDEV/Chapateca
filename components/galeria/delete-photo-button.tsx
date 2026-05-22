'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { deletePhotoAction } from '@/app/(portal)/galeria/actions'
import { Trash2, Loader2, AlertTriangle, X } from 'lucide-react'

interface Props {
  fileId: string
  fileName: string
}

export default function DeletePhotoButton({ fileId, fileName }: Props) {
  const router = useRouter()
  const [confirming, setConfirm] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [isPending, startTransition] = useTransition()

  const handleDelete = () => {
    setError(null)
    startTransition(async () => {
      const res = await deletePhotoAction(fileId)
      if (!res.ok) {
        setError(res.error ?? 'Erro a apagar')
        return
      }
      setConfirm(false)
      router.refresh()
    })
  }

  return (
    <>
      <button
        onClick={() => setConfirm(true)}
        title="Apagar foto"
        className="flex items-center gap-1.5 px-3 py-2 bg-red-600/90 rounded-full
                   text-[12px] font-semibold text-white hover:bg-red-700 transition-colors">
        <Trash2 size={13} />
      </button>

      {confirming && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-4"
             style={{ background: 'rgba(10,6,22,0.7)', backdropFilter: 'blur(4px)' }}
             onClick={() => !isPending && setConfirm(false)}>
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm p-6 animate-card-in"
               onClick={e => e.stopPropagation()}>
            <div className="flex items-start gap-3 mb-4">
              <div className="w-10 h-10 rounded-full bg-red-100 flex items-center justify-center flex-shrink-0">
                <AlertTriangle size={20} className="text-red-600" />
              </div>
              <div className="flex-1">
                <h3 className="font-display text-[17px] text-ink mb-1">Apagar foto?</h3>
                <p className="text-[12px] text-ink-mid leading-relaxed truncate">
                  <span className="font-mono text-ink">{fileName}</span>
                </p>
                <p className="text-[12px] text-ink-mid leading-relaxed mt-1.5">
                  Esta acção é <strong>irreversível</strong>. A foto será apagada do portal e do Drive.
                </p>
              </div>
              <button onClick={() => !isPending && setConfirm(false)}
                      className="w-7 h-7 rounded-lg flex items-center justify-center hover:bg-sand/60 transition-colors flex-shrink-0">
                <X size={14} className="text-ink-mid" />
              </button>
            </div>

            {error && (
              <div className="mb-3 p-2.5 border border-red-200 bg-red-50 rounded-lg text-[12px] text-red-700">
                {error}
              </div>
            )}

            <div className="flex gap-2">
              <button onClick={() => setConfirm(false)} disabled={isPending}
                      className="flex-1 py-2.5 border border-sand rounded-xl text-sm text-ink-mid hover:bg-parchment-2 transition-colors disabled:opacity-50">
                Cancelar
              </button>
              <button onClick={handleDelete} disabled={isPending}
                      className="flex-[2] py-2.5 bg-red-600 text-white rounded-xl text-sm font-semibold
                                 hover:bg-red-700 transition-colors disabled:opacity-60
                                 flex items-center justify-center gap-2">
                {isPending ? <Loader2 size={14} className="animate-spin" /> : <Trash2 size={14} />}
                {isPending ? 'A apagar...' : 'Apagar'}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
