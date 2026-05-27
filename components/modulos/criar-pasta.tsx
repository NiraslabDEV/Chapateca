'use client'

import { useState, useTransition } from 'react'
import { FolderPlus, Check, X, Loader2 } from 'lucide-react'
import { createFolderAction, type DocCategory } from '@/lib/folder-actions'

interface CriarPastaProps {
  category: DocCategory
  accentColor: string
  parentId?: string
  label?: string
}

export default function CriarPasta({ category, accentColor, parentId, label }: CriarPastaProps) {
  const [open, setOpen] = useState(false)
  const [name, setName] = useState('')
  const [isPending, startTransition] = useTransition()

  const submit = () => {
    if (!name.trim() || isPending) return
    startTransition(async () => {
      try {
        await createFolderAction(category, name, parentId)
        setName('')
        setOpen(false)
      } catch { /* silently ignore */ }
    })
  }

  if (!open) {
    return (
      <button
        onClick={() => setOpen(true)}
        style={{ color: accentColor, borderColor: `${accentColor}40` }}
        className="flex items-center gap-1.5 px-3 py-2 border rounded-xl text-xs font-semibold hover:opacity-80 transition-opacity bg-white/60"
      >
        <FolderPlus size={13} /> {label ?? 'Criar Pasta'}
      </button>
    )
  }

  return (
    <div className="flex items-center gap-2">
      <input
        autoFocus
        value={name}
        onChange={e => setName(e.target.value)}
        onKeyDown={e => {
          if (e.key === 'Enter') submit()
          if (e.key === 'Escape') { setOpen(false); setName('') }
        }}
        placeholder={parentId ? 'Nome da sub-pasta...' : 'Nome da pasta...'}
        className="px-3 py-2 border border-sand rounded-xl text-sm outline-none focus:border-ink-soft w-44"
      />
      <button
        onClick={submit}
        disabled={!name.trim() || isPending}
        style={{ background: accentColor }}
        className="w-8 h-8 rounded-xl flex items-center justify-center text-white disabled:opacity-40 hover:opacity-90 transition-opacity"
      >
        {isPending ? <Loader2 size={13} className="animate-spin" /> : <Check size={13} />}
      </button>
      <button
        onClick={() => { setOpen(false); setName('') }}
        className="w-8 h-8 rounded-xl border border-sand flex items-center justify-center text-ink-soft hover:text-ink transition-colors"
      >
        <X size={13} />
      </button>
    </div>
  )
}
