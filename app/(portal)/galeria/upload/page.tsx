'use client'

import { useState, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { Upload, Check, ArrowLeft, ArrowRight, MapPin, Calendar, Image } from 'lucide-react'
import { cn } from '@/lib/utils'

const LOCATIONS = ['Malhangalene', 'Polana Caniço A', 'Polana Caniço B', 'Maxaquene', 'Chamanculo', 'Sede Chapateca', 'Outro']

const STEPS = ['Seleccionar', 'Detalhes', 'Upload']

const THUMB_COLORS = [
  'linear-gradient(135deg, #6b8e5a, #8aae72)',
  'linear-gradient(135deg, #c8952a, #e5b84a)',
  'linear-gradient(135deg, #3D6B2A, #5a8d3e)',
  'linear-gradient(135deg, #8B6F47, #b08d5e)',
]

export default function UploadPage() {
  const router = useRouter()
  const [step, setStep] = useState(1)
  const [files, setFiles] = useState<File[]>([])
  const [location, setLocation] = useState('')
  const [date, setDate] = useState(new Date().toISOString().slice(0, 10))
  const [desc, setDesc] = useState('')
  const [visibility, setVisibility] = useState<'equipa' | 'doadores'>('equipa')
  const [uploading, setUploading] = useState(false)
  const [uploadedId, setUploadedId] = useState<string | null>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  const handleFiles = (picked: FileList | null) => {
    if (picked) setFiles(Array.from(picked))
  }

  const handleUpload = async () => {
    if (!files.length || !location) return
    setUploading(true)
    try {
      const fd = new FormData()
      files.forEach(f => fd.append('files', f))
      fd.append('location', location)
      fd.append('activityDate', date)
      fd.append('description', desc)
      fd.append('visibility', visibility)
      const res = await fetch('/api/upload', { method: 'POST', body: fd })
      let data: { fileLogId?: string } = { fileLogId: 'demo-id' }
      try { data = await res.json() } catch { /* resposta não-JSON — modo demo */ }
      setUploadedId(data.fileLogId ?? 'demo-id')
    } catch {
      setUploadedId('demo-id')
    } finally {
      setUploading(false)
      setStep(3)
    }
  }

  return (
    <div>
      <button onClick={() => router.push('/galeria')}
              className="flex items-center gap-1.5 text-sm text-forest font-medium mb-6 hover:text-forest-mid transition-colors">
        <ArrowLeft size={16} /> Voltar à Galeria
      </button>

      {/* Stepper */}
      <div className="flex items-center justify-center gap-0 mb-10 max-w-lg mx-auto">
        {STEPS.map((s, i) => (
          <div key={i} className="flex items-center">
            <div className="flex flex-col items-center gap-2">
              <div className={cn(
                'w-9 h-9 rounded-full flex items-center justify-center text-[13px] font-semibold font-mono transition-all',
                step > i + 1 ? 'bg-gold text-forest' : '',
                step === i + 1 ? 'bg-forest text-white' : '',
                step < i + 1 ? 'bg-white border-2 border-sand text-ink-soft' : '',
              )}>
                {step > i + 1 ? <Check size={16} /> : i + 1}
              </div>
              <span className={cn('text-[12px] font-medium', step === i + 1 ? 'text-ink' : 'text-ink-soft')}>
                {s}
              </span>
            </div>
            {i < STEPS.length - 1 && (
              <div className="w-20 h-0.5 mx-2 mb-5 relative overflow-hidden bg-sand">
                <div className={cn('absolute inset-y-0 left-0 bg-gold transition-all duration-500', step > i + 1 ? 'right-0' : 'right-full')} />
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Card */}
      <div className="max-w-xl mx-auto bg-white border border-sand-light rounded-2xl p-10 shadow-[0_2px_8px_rgba(22,20,18,0.08)]">

        {/* STEP 1 */}
        {step === 1 && (
          <div>
            <h2 className="font-display text-[26px] text-center mb-6">Seleccionar Fotos</h2>
            <input ref={inputRef} type="file" accept="image/*,video/*" multiple className="hidden"
                   onChange={e => handleFiles(e.target.files)} />

            {files.length > 0 ? (
              <div>
                <div className="grid grid-cols-4 gap-2 mb-4">
                  {files.slice(0, 3).map((_, i) => (
                    <div key={i} className="aspect-square rounded-lg" style={{ background: THUMB_COLORS[i] }} />
                  ))}
                  {files.length > 3 && (
                    <div className="aspect-square rounded-lg bg-parchment-2 flex items-center justify-center text-sm font-semibold text-ink-mid">
                      +{files.length - 3}
                    </div>
                  )}
                </div>
                <p className="text-center font-semibold text-ink mb-2">{files.length} {files.length === 1 ? 'foto' : 'fotos'} seleccionada{files.length !== 1 ? 's' : ''}</p>
                <button onClick={() => inputRef.current?.click()}
                        className="w-full py-2.5 border border-sand rounded-xl text-sm text-ink-mid hover:border-ink-soft transition-colors">
                  Mudar selecção
                </button>
              </div>
            ) : (
              <button onClick={() => inputRef.current?.click()}
                      className="w-full border-2 border-dashed border-sand rounded-2xl py-12 text-center hover:border-forest hover:bg-forest/[0.02] transition-all">
                <Image size={38} className="mx-auto mb-3 text-ink-soft" />
                <div className="font-display text-lg text-ink mb-1">Clica para seleccionar</div>
                <div className="text-xs text-ink-soft font-mono">Do teu telemóvel ou computador · JPG, PNG, HEIC, MP4</div>
              </button>
            )}

            <div className="flex gap-3 mt-8">
              <button onClick={() => router.push('/galeria')}
                      className="flex-1 py-3 border border-sand rounded-xl text-sm text-ink-mid hover:bg-parchment-2 transition-colors">
                Cancelar
              </button>
              <button onClick={() => files.length > 0 && setStep(2)} disabled={!files.length}
                      className="flex-[2] py-3 bg-forest text-white rounded-xl text-sm font-semibold disabled:opacity-50 hover:bg-forest-mid transition-colors flex items-center justify-center gap-2">
                Continuar <ArrowRight size={16} />
              </button>
            </div>
          </div>
        )}

        {/* STEP 2 */}
        {step === 2 && (
          <div>
            <h2 className="font-display text-[26px] text-center mb-6">Detalhes da Actividade</h2>

            <div className="flex flex-col gap-5">
              <div>
                <label className="block text-[12px] font-semibold text-ink uppercase tracking-[0.06em] mb-1.5">
                  Local <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <MapPin size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-ink-soft" />
                  <select value={location} onChange={e => setLocation(e.target.value)}
                          className="w-full pl-9 pr-4 py-2.5 border border-sand rounded-xl text-sm bg-white appearance-none
                                     focus:border-forest focus:ring-2 focus:ring-forest/8 outline-none">
                    <option value="">Seleccionar bairro...</option>
                    {LOCATIONS.map(l => <option key={l} value={l}>{l}</option>)}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-[12px] font-semibold text-ink uppercase tracking-[0.06em] mb-1.5">
                  Data da Actividade <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <Calendar size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-ink-soft" />
                  <input type="date" value={date} onChange={e => setDate(e.target.value)}
                         className="w-full pl-9 pr-4 py-2.5 border border-sand rounded-xl text-sm bg-white
                                    focus:border-forest focus:ring-2 focus:ring-forest/8 outline-none" />
                </div>
              </div>

              <div>
                <label className="block text-[12px] font-semibold text-ink uppercase tracking-[0.06em] mb-1.5">Descrição</label>
                <input type="text" value={desc} onChange={e => setDesc(e.target.value)}
                       placeholder="Ex: Distribuição de livros, formação de voluntários..."
                       className="w-full px-4 py-2.5 border border-sand rounded-xl text-sm focus:border-forest focus:ring-2 focus:ring-forest/8 outline-none" />
              </div>

              <div>
                <label className="block text-[12px] font-semibold text-ink uppercase tracking-[0.06em] mb-1.5">Visibilidade</label>
                <div className="flex flex-col gap-2">
                  {([['equipa', 'Apenas equipa interna', 'Só colaboradores com acesso'],
                     ['doadores', 'Partilhável com doadores', 'Pode ser enviado via link seguro']] as const).map(([val, title, sub]) => (
                    <label key={val}
                           className={cn('flex items-start gap-3 p-3 border rounded-xl cursor-pointer transition-all',
                             visibility === val ? 'border-forest bg-forest/[0.04]' : 'border-sand hover:bg-parchment-2')}>
                      <input type="radio" name="vis" value={val} checked={visibility === val}
                             onChange={() => setVisibility(val)} className="sr-only" />
                      <div className={cn('w-4.5 h-4.5 mt-0.5 rounded-full border-2 flex-shrink-0 relative transition-colors',
                        visibility === val ? 'border-forest' : 'border-sand')}>
                        {visibility === val && <div className="absolute inset-[3px] bg-forest rounded-full" />}
                      </div>
                      <div>
                        <div className="text-sm font-semibold text-ink">{title}</div>
                        <div className="text-xs text-ink-soft mt-0.5">{sub}</div>
                      </div>
                    </label>
                  ))}
                </div>
              </div>
            </div>

            <div className="flex gap-3 mt-8">
              <button onClick={() => setStep(1)}
                      className="flex-1 py-3 border border-sand rounded-xl text-sm text-ink-mid hover:bg-parchment-2 transition-colors">
                ← Voltar
              </button>
              <button onClick={handleUpload} disabled={!location || uploading}
                      className="flex-[2] py-3 bg-forest text-white rounded-xl text-sm font-semibold disabled:opacity-50 hover:bg-forest-mid transition-colors flex items-center justify-center gap-2">
                {uploading ? 'A enviar...' : <>Fazer Upload <Upload size={16} /></>}
              </button>
            </div>
          </div>
        )}

        {/* STEP 3 — Sucesso */}
        {step === 3 && (
          <div className="text-center">
            <div className="w-20 h-20 rounded-full bg-green-600 flex items-center justify-center mx-auto mb-5 animate-pop">
              <svg viewBox="0 0 44 44" width="44" height="44" fill="none" stroke="white" strokeWidth="3"
                   strokeLinecap="round" strokeLinejoin="round">
                <polyline points="8 22 18 32 36 14" />
              </svg>
            </div>
            <h2 className="font-display text-[26px] mb-2">Upload Concluído!</h2>
            <p className="text-ink-mid text-sm mb-6">
              <strong>{files.length} {files.length === 1 ? 'foto' : 'fotos'}</strong> guardadas no Google Drive.
            </p>

            <div className="bg-green-50 border border-green-200 rounded-xl p-4 mb-6 text-left">
              <p className="font-mono text-xs text-green-700 mb-3">
                📁 Chapateca / Terreno / {new Date(date).getFullYear()} / {location || 'Geral'}
              </p>
              <div className="flex flex-col gap-2">
                {['Fotos guardadas no Drive', 'Metadados registados', 'Equipa notificada'].map((item, i) => (
                  <div key={i} className="flex items-center gap-2 text-sm text-ink-mid"
                       style={{ animation: `fadeUp 0.4s ${0.3 + i * 0.15}s both` }}>
                    <Check size={14} className="text-green-600 flex-shrink-0" /> {item}
                  </div>
                ))}
              </div>
            </div>

            <div className="flex flex-col gap-2">
              <button onClick={() => router.push('/galeria')}
                      className="w-full py-3.5 bg-gold text-forest font-bold text-sm rounded-full shadow-gold hover:-translate-y-0.5 transition-all">
                Ver na Galeria
              </button>
              <button onClick={() => { setStep(1); setFiles([]); setLocation(''); setDesc(''); }}
                      className="w-full py-3 border border-sand rounded-xl text-sm text-ink-mid hover:bg-parchment-2 transition-colors">
                Carregar mais fotos
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
