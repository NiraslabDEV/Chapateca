'use client'

import { useState } from 'react'
import { Download, ImageIcon, FileText, Video, Layers, Tag, Package } from 'lucide-react'
import { cn } from '@/lib/utils'
import type { MarketingAsset } from '@/app/(portal)/galeria/page'

const TAG_META: Record<string, { label: string; color: string; bg: string; icon: React.ReactNode }> = {
  logo:      { label: 'Logótipo e Marca',      color: '#461882', bg: '#F3EEFE', icon: <Tag size={13} /> },
  graficos:  { label: 'Peças Gráficas',         color: '#E8652A', bg: '#FEF2EC', icon: <Layers size={13} /> },
  fotos:     { label: 'Fotos de Divulgação',     color: '#2D5220', bg: '#EBF5E6', icon: <ImageIcon size={13} /> },
  templates: { label: 'Templates',              color: '#1A5C8A', bg: '#E6F0F7', icon: <FileText size={13} /> },
  video:     { label: 'Vídeos',                  color: '#8B3A3A', bg: '#F7ECEC', icon: <Video size={13} /> },
  outro:     { label: 'Outros Activos',          color: '#8B7FA8', bg: '#F3F2F7', icon: <Package size={13} /> },
}

const THUMB_GRADIENTS = [
  'linear-gradient(135deg, #461882, #7c3adb)',
  'linear-gradient(135deg, #E8652A, #f5934a)',
  'linear-gradient(135deg, #2D5220, #4a8033)',
  'linear-gradient(135deg, #1A5C8A, #2a7eb8)',
  'linear-gradient(135deg, #8B3A3A, #b85a5a)',
  'linear-gradient(135deg, #8B7FA8, #a89ec8)',
]

function AssetThumb({ asset, idx }: { asset: MarketingAsset; idx: number }) {
  const [imgFailed, setImgFailed] = useState(false)
  const isMock = asset.driveId.startsWith('mock-')
  const showImg = !isMock && !imgFailed && (asset.fileName.match(/\.(jpg|jpeg|png|gif|webp|svg)$/i) != null)

  return (
    <div className="relative group rounded-xl overflow-hidden aspect-square cursor-pointer">
      {showImg ? (
        <img
          src={`/api/drive/image/${asset.driveId}`}
          alt={asset.title}
          className="w-full h-full object-cover"
          onError={() => setImgFailed(true)}
        />
      ) : (
        <div
          className="w-full h-full flex items-center justify-center"
          style={{ background: THUMB_GRADIENTS[idx % THUMB_GRADIENTS.length] }}
        >
          <div className="text-white/60 text-[10px] font-mono uppercase tracking-wider text-center px-2">
            {asset.fileName.split('.').pop()?.toUpperCase() ?? 'FILE'}
          </div>
        </div>
      )}

      {/* Hover overlay */}
      <div className="absolute inset-0 bg-black/0 group-hover:bg-black/50 transition-all flex flex-col items-start justify-end p-2.5 opacity-0 group-hover:opacity-100">
        <p className="text-white text-[11px] font-medium leading-tight line-clamp-2 mb-1.5">{asset.title}</p>
        <a
          href={`/api/drive/doc/${asset.driveId}?download=1`}
          onClick={e => e.stopPropagation()}
          className="flex items-center gap-1 px-2 py-1 bg-white/20 hover:bg-white/30 rounded-lg text-white text-[10px] font-medium transition-colors"
        >
          <Download size={10} /> Baixar
        </a>
      </div>
    </div>
  )
}

interface Props {
  assets: MarketingAsset[]
  dbConnected: boolean
}

export default function MarketingGrid({ assets, dbConnected }: Props) {
  if (!dbConnected) {
    return (
      <div className="py-8 text-center text-[12px] text-ink-soft font-mono">
        A aguardar ligação à base de dados…
      </div>
    )
  }

  if (assets.length === 0) {
    return (
      <div className="flex flex-col items-center py-20 text-center">
        <div className="w-16 h-16 rounded-2xl bg-[#461882]/10 flex items-center justify-center mb-4">
          <ImageIcon size={28} className="text-[#461882]" />
        </div>
        <p className="font-display text-xl text-ink mb-1">Nenhum activo carregado</p>
        <p className="text-sm text-ink-soft">Carrega logos, peças gráficas e fotos de divulgação aqui</p>
      </div>
    )
  }

  // Group by tag
  const grouped: Record<string, MarketingAsset[]> = {}
  for (const asset of assets) {
    const key = asset.tag || 'outro'
    if (!grouped[key]) grouped[key] = []
    grouped[key].push(asset)
  }

  // Order groups by TAG_META key order
  const tagOrder = Object.keys(TAG_META)
  const sortedGroups = Object.entries(grouped).sort(
    ([a], [b]) => tagOrder.indexOf(a) - tagOrder.indexOf(b)
  )

  return (
    <div className="flex flex-col gap-10">
      {sortedGroups.map(([tag, items]) => {
        const meta = TAG_META[tag] ?? TAG_META.outro
        return (
          <div key={tag}>
            {/* Group header */}
            <div className="flex items-center gap-2.5 mb-4">
              <span
                className="flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-semibold"
                style={{ color: meta.color, background: meta.bg }}
              >
                {meta.icon}
                {meta.label}
              </span>
              <span className="text-[11px] text-ink-soft font-mono">{items.length} ficheiro{items.length !== 1 ? 's' : ''}</span>
              <div className="flex-1 h-px bg-sand" />
            </div>

            {/* Asset grid */}
            <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 gap-3">
              {items.map((asset, idx) => (
                <div key={asset.id}>
                  <AssetThumb asset={asset} idx={idx} />
                  <p className="text-[10px] text-ink-soft font-mono mt-1 truncate px-0.5">
                    {asset.uploaderInitials} · {new Date(asset.createdAt).toLocaleDateString('pt-MZ', { day: '2-digit', month: 'short' })}
                  </p>
                </div>
              ))}
            </div>
          </div>
        )
      })}
    </div>
  )
}
