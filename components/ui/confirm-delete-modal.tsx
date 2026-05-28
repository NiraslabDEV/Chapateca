'use client'

import { useState, useTransition } from 'react'
import { AlertTriangle, X, Trash2, Loader2 } from 'lucide-react'

interface Props {
  open: boolean
  onClose: () => void
  title: string
  description: string
  confirmLabel?: string
  onConfirm: () => Promise<{ ok: boolean; error?: string }>
}

export default function ConfirmDeleteModal({ open, onClose, title, description, confirmLabel = 'Apagar definitivamente', onConfirm }: Props) {
  const [err, setErr] = useState<string | null>(null)
  const [pending, startTransition] = useTransition()

  if (!open) return null

  const handleConfirm = () => {
    setErr(null)
    startTransition(async () => {
      const res = await onConfirm()
      if (!res.ok) {
        setErr(res.error ?? 'Erro a apagar')
        return
      }
      onClose()
    })
  }

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center p-4"
         style={{ background: 'rgba(10,6,22,0.7)', backdropFilter: 'blur(4px)' }}
         onClick={() => !pending && onClose()}>
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-6 animate-card-in"
           onClick={e => e.stopPropagation()}>
        <div className="flex items-start gap-3 mb-4">
          <div className="w-10 h-10 rounded-full bg-red-100 flex items-center justify-center flex-shrink-0">
            <AlertTriangle size={20} className="text-red-600" />
          </div>
          <div className="flex-1">
            <h3 className="font-display text-[18px] text-ink mb-1">{title}</h3>
            <p className="text-[13px] text-ink-mid leading-relaxed">{description}</p>
          </div>
          <button onClick={() => !pending && onClose()}
                  className="w-7 h-7 rounded-lg flex items-center justify-center hover:bg-sand/60 transition-colors flex-shrink-0">
            <X size={14} className="text-ink-mid" />
          </button>
        </div>

        {err && (
          <div className="mb-4 p-3 border border-red-200 bg-red-50 rounded-lg text-[12px] text-red-700">
            {err}
          </div>
        )}

        <div className="flex gap-2 mt-2">
          <button onClick={onClose} disabled={pending}
                  className="flex-1 py-2.5 border border-sand rounded-xl text-sm text-ink-mid hover:bg-parchment-2 transition-colors disabled:opacity-50">
            Cancelar
          </button>
          <button onClick={handleConfirm} disabled={pending}
                  className="flex-[2] py-2.5 bg-red-600 text-white rounded-xl text-sm font-semibold
                             hover:bg-red-700 transition-colors disabled:opacity-60
                             flex items-center justify-center gap-2">
            {pending ? <Loader2 size={14} className="animate-spin" /> : <Trash2 size={14} />}
            {pending ? 'A apagar...' : confirmLabel}
          </button>
        </div>
      </div>
    </div>
  )
}
