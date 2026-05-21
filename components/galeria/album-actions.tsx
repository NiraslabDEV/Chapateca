'use client'

import { useState } from 'react'
import { Share2, Eye, Check, Loader2 } from 'lucide-react'
import Link from 'next/link'

interface Props {
  albumId: string
}

export default function AlbumActions({ albumId }: Props) {
  const [sharing, setSharing] = useState(false)
  const [copied, setCopied] = useState(false)

  const handleShare = async () => {
    setSharing(true)
    try {
      const res = await fetch(`/api/share/${albumId}`, { method: 'POST' })
      const data = await res.json()
      const link: string = data.link ?? `${window.location.origin}/galeria/${albumId}`
      await navigator.clipboard.writeText(link)
      setCopied(true)
      setTimeout(() => setCopied(false), 2500)
    } catch {
      setCopied(true)
      setTimeout(() => setCopied(false), 2500)
    } finally {
      setSharing(false)
    }
  }

  return (
    <div className="flex gap-2 flex-shrink-0">
      <button
        onClick={handleShare}
        disabled={sharing}
        className="flex items-center gap-1.5 px-3 py-2 border border-sand rounded-lg text-[12px] font-medium
                   text-ink-mid hover:border-ink-soft hover:text-ink transition-colors disabled:opacity-60">
        {sharing ? (
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
