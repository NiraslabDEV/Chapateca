'use client'

import { useState } from 'react'
import { Download } from 'lucide-react'

export default function DownloadAllPhotos({ urls, token }: { urls: string[]; token: string }) {
  const [loading, setLoading] = useState(false)

  const handleDownloadAll = () => {
    setLoading(true)
    urls.forEach((driveId, i) => {
      setTimeout(() => {
        const a = document.createElement('a')
        a.href = `/api/photo/${token}/${driveId}?download=1`
        a.download = `chapateca_${String(i + 1).padStart(3, '0')}.jpg`
        document.body.appendChild(a)
        a.click()
        document.body.removeChild(a)
        if (i === urls.length - 1) setLoading(false)
      }, i * 400)
    })
  }

  if (urls.length === 0) return null

  return (
    <button
      onClick={handleDownloadAll}
      disabled={loading}
      className="flex items-center gap-2 px-4 py-2 rounded-full text-sm font-semibold transition-colors"
      style={{
        background: 'rgba(255,255,255,0.15)',
        color: 'white',
        border: '1px solid rgba(255,255,255,0.3)',
      }}
    >
      <Download size={14} />
      {loading ? 'A descarregar...' : `Descarregar todas (${urls.length})`}
    </button>
  )
}
