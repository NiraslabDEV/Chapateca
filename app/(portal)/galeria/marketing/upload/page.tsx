'use client'

import { useState, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { Upload, Check, ArrowLeft, Image as ImageIcon, X } from 'lucide-react'
import { cn } from '@/lib/utils'

const TAGS: Record<string, string> = {
  logo: 'Logótipo e Marca',
  graficos: 'Peças Gráficas',
  fotos: 'Fotos de Divulgação',
  templates: 'Templates',
  video: 'Vídeos',
  outro: 'Outros Activos',
}

const TAG_COLORS: Record<string, string> = {
  logo: '#461882',
  graficos: '#E8652A',
  fotos: '#2D5220',
  templates: '#1A5C8A',
  video: '#8B3A3A',
  outro: '#8B7FA8',
}

export default function MarketingUploadPage() {
  const router = useRouter()
  const inputRef = useRef<HTMLInputElement>(null)
  const [files, setFiles] = useState<File[]>([])
  const [tag, setTag] = useState('logo')
  const [assetTitle, setAssetTitle] = useState('')
  const [uploading, setUploading] = useState(false)
  const [done, setDone] = useState(false)
  const [error, setError] = useState('')

  const handleFiles = (picked: FileList | null) => {
    if (picked) setFiles(prev => [...prev, ...Array.from(picked)])
  }

  const removeFile = (i: number) => setFiles(f => f.filter((_, idx) => idx !== i))

  const handleUpload = async () => {
    if (!files.length) return
    setUploading(true)
    setError('')
    try {
      const fd = new FormData()
      files.forEach(f => fd.append('files', f))
      fd.append('category', 'MARKETING')
      fd.append('tag', tag)
      if (assetTitle.trim()) fd.append('assetTitle', assetTitle.trim())
      const res = await fetch('/api/upload', { method: 'POST', body: fd })
      if (!res.ok) {
        const data = await res.json().catch(() => ({}))
        setError(data.error ?? 'Erro ao fazer upload')
        return
      }
      setDone(true)
    } catch {
      setError('Erro de ligação. Tenta novamente.')
    } finally {
      setUploading(false)
    }
  }

  if (done) {
    return (
      <div>
        <button onClick={() => router.push('/galeria?tab=marketing')}
                className="flex items-center gap-1.5 text-sm text-[#461882] font-medium mb-6 hover:opacity-70 transition-opacity">
          <ArrowLeft size={16} /> Voltar ao Marketing
        </button>
        <div className="max-w-md mx-auto bg-white border border-sand-light rounded-2xl p-10 text-center shadow-[0_2px_8px_rgba(22,20,18,0.08)]">
          <div className="w-20 h-20 rounded-full bg-[#461882] flex items-center justify-center mx-auto mb-5 animate-pop">
            <svg viewBox="0 0 44 44" width="44" height="44" fill="none" stroke="white" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="8 22 18 32 36 14" />
            </svg>
          </div>
          <h2 className="font-display text-[26px] mb-2">Carregado com sucesso!</h2>
          <p className="text-ink-mid text-sm mb-6"><strong>{files.length}</strong> ficheiro{files.length !== 1 ? 's' : ''} adicionado{files.length !== 1 ? 's' : ''} a <strong>{TAGS[tag]}</strong>.</p>
          <div className="flex flex-col gap-2">
            <button onClick={() => router.push('/galeria?tab=marketing')}
                    className="w-full py-3.5 bg-[#461882] text-white font-bold text-sm rounded-full hover:opacity-90 transition-opacity">
              Ver em Marketing & Marca
            </button>
            <button onClick={() => { setFiles([]); setAssetTitle(''); setDone(false) }}
                    className="w-full py-3 border border-sand rounded-xl text-sm text-ink-mid hover:bg-parchment-2 transition-colors">
              Carregar mais activos
            </button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div>
      <button onClick={() => router.push('/galeria?tab=marketing')}
              className="flex items-center gap-1.5 text-sm text-[#461882] font-medium mb-6 hover:opacity-70 transition-opacity">
        <ArrowLeft size={16} /> Voltar ao Marketing
      </button>

      <div className="max-w-xl mx-auto">
        <h1 className="font-display text-[30px] text-ink mb-1">Carregar Activo de Marketing</h1>
        <p className="text-ink-soft text-sm mb-8">Logos, peças gráficas, fotos de divulgação e outros materiais de marca</p>

        <div className="bg-white border border-sand-light rounded-2xl p-8 shadow-[0_2px_8px_rgba(22,20,18,0.08)] flex flex-col gap-6">

          {/* Tag selector */}
          <div>
            <label className="block text-[12px] font-semibold text-ink uppercase tracking-[0.06em] mb-3">
              Categoria <span className="text-red-500">*</span>
            </label>
            <div className="grid grid-cols-3 gap-2">
              {Object.entries(TAGS).map(([k, v]) => (
                <button key={k} onClick={() => setTag(k)}
                        className={cn(
                          'px-3 py-2 rounded-xl border text-[12px] font-medium text-left transition-all',
                          tag === k
                            ? 'border-transparent text-white'
                            : 'border-sand-light text-ink-mid hover:border-ink-soft'
                        )}
                        style={tag === k ? { background: TAG_COLORS[k] } : {}}>
                  {v}
                </button>
              ))}
            </div>
          </div>

          {/* Title (optional) */}
          <div>
            <label className="block text-[12px] font-semibold text-ink uppercase tracking-[0.06em] mb-1.5">
              Título / Descrição <span className="text-[11px] font-normal normal-case text-ink-soft">(opcional)</span>
            </label>
            <input type="text" value={assetTitle} onChange={e => setAssetTitle(e.target.value)}
                   placeholder="Ex: Logo Principal PNG transparente"
                   className="w-full px-4 py-2.5 border border-sand rounded-xl text-sm focus:border-[#461882] focus:ring-2 focus:ring-[#461882]/8 outline-none" />
          </div>

          {/* File picker */}
          <div>
            <label className="block text-[12px] font-semibold text-ink uppercase tracking-[0.06em] mb-1.5">
              Ficheiros <span className="text-red-500">*</span>
            </label>
            <input ref={inputRef} type="file" multiple accept="image/*,video/*,.pdf,.ai,.psd,.svg,.eps"
                   className="hidden" onChange={e => handleFiles(e.target.files)} />

            {files.length > 0 && (
              <div className="flex flex-col gap-1.5 mb-3">
                {files.map((f, i) => (
                  <div key={i} className="flex items-center gap-3 px-3 py-2 bg-parchment-2 rounded-lg">
                    <ImageIcon size={14} className="text-ink-soft flex-shrink-0" />
                    <span className="text-sm text-ink flex-1 truncate">{f.name}</span>
                    <span className="text-[11px] text-ink-soft font-mono">{(f.size / 1024).toFixed(0)} KB</span>
                    <button onClick={() => removeFile(i)} className="text-ink-soft hover:text-red-500 transition-colors">
                      <X size={13} />
                    </button>
                  </div>
                ))}
              </div>
            )}

            <button onClick={() => inputRef.current?.click()}
                    className="w-full border-2 border-dashed border-sand rounded-xl py-6 text-center hover:border-[#461882]/40 hover:bg-[#461882]/[0.02] transition-all">
              <Upload size={20} className="mx-auto mb-2 text-ink-soft" />
              <div className="text-sm text-ink-mid font-medium">
                {files.length > 0 ? 'Adicionar mais ficheiros' : 'Clica para seleccionar'}
              </div>
              <div className="text-[11px] text-ink-soft font-mono mt-0.5">JPG, PNG, SVG, PDF, AI, PSD e mais</div>
            </button>
          </div>

          {error && <p className="text-sm text-red-600 text-center">{error}</p>}

          <div className="flex gap-3 pt-2">
            <button onClick={() => router.push('/galeria?tab=marketing')}
                    className="flex-1 py-3 border border-sand rounded-xl text-sm text-ink-mid hover:bg-parchment-2 transition-colors">
              Cancelar
            </button>
            <button onClick={handleUpload} disabled={!files.length || uploading}
                    className="flex-[2] py-3 bg-[#461882] text-white rounded-xl text-sm font-semibold disabled:opacity-50 hover:opacity-90 transition-opacity flex items-center justify-center gap-2">
              {uploading ? 'A enviar...' : <><Check size={15} /> Carregar {files.length > 0 ? `(${files.length})` : ''}</>}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
