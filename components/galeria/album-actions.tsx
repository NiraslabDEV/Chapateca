'use client'

import { useState, useTransition } from 'react'
import { generateShareToken } from '@/app/(portal)/galeria/actions'
import { Share2, Eye, Check, Loader2 } from 'lucide-react'
import Link from 'next/link'

interface Props {
  albumId: string
}

export default function AlbumActions({ albumId }: Props) {
  const [copied, setCopied] = useState(false)
  const [isPending, startTransition] = useTransition()

  const handleShare = () => {
    startTransition(async () => {
      const token = await generateShareToken(albumId)
      if (token) {
        const url = `${window.location.origin}/album/${token}`
        try { await navigator.clipboard.writeText(url) } catch { /* ignore */ }
      }
      setCopied(true)
      setTimeout(() => setCopied(false), 2500)
    })
  }

  return (
    <div className="flex gap-2 flex-shrink-0">
      <button
        onClick={handleShare}
        disabled={isPending}
        className="flex items-center gap-1.5 px-3 py-2 border border-sand rounded-lg text-[12px] font-medium
                   text-ink-mid hover:border-ink-soft hover:text-ink transition-colors disabled:opacity-60">
        {isPending ? (
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
    </div>
  )
}
