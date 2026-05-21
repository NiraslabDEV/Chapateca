'use client'

import { useState, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { Upload, Check, ArrowLeft, ArrowRight, FileText, Calendar } from 'lucide-react'
import { cn } from '@/lib/utils'

const DOC_TYPES: Record<string, string> = {
  orcamento: 'Orçamento',
  relatorio: 'Relatório Financeiro',
  extrato: 'Extracto Bancário',
  contrato: 'Contrato',
  auditoria: 'Auditoria',
  outro: 'Outro',
}

const TYPE_COLORS: Record<string, string> = {
  PDF: 'bg-red-600',
  XLSX: 'bg-green-700',
  DOCX: 'bg-blue-700',
}

const STEPS = ['Seleccionar', 'Detalhes', 'Concluído']

function detectFileType(mimeType: string) {
  if (mimeType === 'application/pdf') return 'PDF'
  if (mimeType.includes('spreadsheet') || mimeType.includes('excel')) return 'XLSX'
  if (mimeType.includes('wordprocessing') || mimeType.includes('msword')) return 'DOCX'
  return null
}

function formatBytes(bytes: number) {
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} KB`
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
}

export default function FinancasUploadPage() {
  const router = useRouter()
  const inputRef = useRef<HTMLInputElement>(null)
  const [step, setStep] = useState(1)
  const [file, setFile] = useState<File | null>(null)
  const [fileTypeError, setFileTypeError] = useState('')
  const [docTitle, setDocTitle] = useState('')
  const [docType, setDocType] = useState('outro')
  const [refDate, setRefDate] = useState(new Date().toISOString().slice(0, 7)) // YYYY-MM
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState('')

  const detectedType = file ? detectFileType(file.type) : null

  const handleFile = (picked: File | null) => {
    if (!picked) return
    const t = detectFileType(picked.type)
    if (!t) {
      setFileTypeError('Tipo não suportado. Use PDF, XLSX ou DOCX.')
      setFile(null)
      return
    }
    setFileTypeError('')
    setFile(picked)
    // Auto-suggest title from filename
    if (!docTitle) {
      setDocTitle(picked.name.replace(/\.[^.]+$/, '').replace(/[_-]/g, ' '))
    }
  }

  const handleUpload = async () => {
    if (!file || !docTitle || !refDate) return
    setUploading(true)
    setError('')
    try {
      const fd = new FormData()
      fd.append('file', file)
      fd.append('docTitle', docTitle)
      fd.append('docType', docType)
      fd.append('refDate', `${refDate}-01`) // convert YYYY-MM to YYYY-MM-01
      const res = await fetch('/api/upload-doc', { method: 'POST', body: fd })
      if (!res.ok) {
        const data = await res.json().catch(() => ({}))
        setError(data.error ?? 'Erro ao fazer upload')
        setUploading(false)
        return
      }
      setStep(3)
    } catch {
      setError('Erro de ligação. Tenta novamente.')
    } finally {
      setUploading(false)
    }
  }

  return (
    <div>
      <button onClick={() => router.push('/financas')}
              className="flex items-center gap-1.5 text-sm text-[#8B3A3A] font-medium mb-6 hover:opacity-70 transition-opacity">
        <ArrowLeft size={16} /> Voltar ao Financeiro
      </button>

      {/* Stepper */}
      <div className="flex items-center justify-center gap-0 mb-10 max-w-lg mx-auto">
        {STEPS.map((s, i) => (
          <div key={i} className="flex items-center">
            <div className="flex flex-col items-center gap-2">
              <div className={cn(
                'w-9 h-9 rounded-full flex items-center justify-center text-[13px] font-semibold font-mono transition-all',
                step > i + 1 ? 'bg-[#8B3A3A] text-white' : '',
                step === i + 1 ? 'bg-[#8B3A3A] text-white' : '',
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
                <div className={cn('absolute inset-y-0 left-0 bg-[#8B3A3A] transition-all duration-500', step > i + 1 ? 'right-0' : 'right-full')} />
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Card */}
      <div className="max-w-xl mx-auto bg-white border border-sand-light rounded-2xl p-10 shadow-[0_2px_8px_rgba(22,20,18,0.08)]">

        {/* STEP 1 — Seleccionar ficheiro */}
        {step === 1 && (
          <div>
            <h2 className="font-display text-[26px] text-center mb-2">Seleccionar Documento</h2>
            <p className="text-center text-sm text-ink-soft mb-6">PDF, Excel (XLSX) ou Word (DOCX)</p>

            <input ref={inputRef} type="file"
                   accept=".pdf,.xlsx,.xls,.docx,.doc,application/pdf,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet,application/vnd.ms-excel,application/vnd.openxmlformats-officedocument.wordprocessingml.document,application/msword"
                   className="hidden"
                   onChange={e => handleFile(e.target.files?.[0] ?? null)} />

            {file ? (
              <div className="border border-sand-light rounded-xl p-5 flex items-center gap-4 mb-4">
                <div className={cn('w-12 h-12 rounded-xl flex items-center justify-center text-[11px] font-bold text-white font-mono flex-shrink-0',
                  TYPE_COLORS[detectedType ?? ''] ?? 'bg-ink-soft')}>
                  {detectedType}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-semibold text-ink truncate">{file.name}</div>
                  <div className="text-xs text-ink-soft font-mono mt-0.5">{formatBytes(file.size)}</div>
                </div>
                <button onClick={() => inputRef.current?.click()}
                        className="text-xs text-ink-soft hover:text-ink underline flex-shrink-0">
                  Mudar
                </button>
              </div>
            ) : (
              <button onClick={() => inputRef.current?.click()}
                      className="w-full border-2 border-dashed border-sand rounded-2xl py-12 text-center hover:border-[#8B3A3A] hover:bg-[#F7ECEC]/30 transition-all mb-4">
                <FileText size={38} className="mx-auto mb-3 text-ink-soft" />
                <div className="font-display text-lg text-ink mb-1">Clica para seleccionar</div>
                <div className="text-xs text-ink-soft font-mono">PDF · XLSX · DOCX</div>
              </button>
            )}

            {fileTypeError && (
              <p className="text-sm text-red-600 text-center mb-4">{fileTypeError}</p>
            )}

            <div className="flex gap-3 mt-6">
              <button onClick={() => router.push('/financas')}
                      className="flex-1 py-3 border border-sand rounded-xl text-sm text-ink-mid hover:bg-parchment-2 transition-colors">
                Cancelar
              </button>
              <button onClick={() => file && setStep(2)} disabled={!file}
                      className="flex-[2] py-3 bg-[#8B3A3A] text-white rounded-xl text-sm font-semibold disabled:opacity-50 hover:bg-[#722f2f] transition-colors flex items-center justify-center gap-2">
                Continuar <ArrowRight size={16} />
              </button>
            </div>
          </div>
        )}

        {/* STEP 2 — Detalhes */}
        {step === 2 && (
          <div>
            <h2 className="font-display text-[26px] text-center mb-6">Detalhes do Documento</h2>

            <div className="flex flex-col gap-5">
              <div>
                <label className="block text-[12px] font-semibold text-ink uppercase tracking-[0.06em] mb-1.5">
                  Título do Documento <span className="text-red-500">*</span>
                </label>
                <input type="text" value={docTitle} onChange={e => setDocTitle(e.target.value)}
                       placeholder="Ex: Orçamento 2025 Aprovado"
                       className="w-full px-4 py-2.5 border border-sand rounded-xl text-sm focus:border-[#8B3A3A] focus:ring-2 focus:ring-[#8B3A3A]/8 outline-none" />
              </div>

              <div>
                <label className="block text-[12px] font-semibold text-ink uppercase tracking-[0.06em] mb-1.5">
                  Tipo de Documento
                </label>
                <select value={docType} onChange={e => setDocType(e.target.value)}
                        className="w-full px-4 py-2.5 border border-sand rounded-xl text-sm bg-white
                                   focus:border-[#8B3A3A] focus:ring-2 focus:ring-[#8B3A3A]/8 outline-none appearance-none">
                  {Object.entries(DOC_TYPES).map(([k, v]) => (
                    <option key={k} value={k}>{v}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-[12px] font-semibold text-ink uppercase tracking-[0.06em] mb-1.5">
                  Período de Referência <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <Calendar size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-ink-soft" />
                  <input type="month" value={refDate} onChange={e => setRefDate(e.target.value)}
                         className="w-full pl-9 pr-4 py-2.5 border border-sand rounded-xl text-sm bg-white
                                    focus:border-[#8B3A3A] focus:ring-2 focus:ring-[#8B3A3A]/8 outline-none" />
                </div>
                <p className="text-[11px] text-ink-soft mt-1.5 font-mono">Mês/ano a que o documento se refere</p>
              </div>
            </div>

            {error && (
              <p className="text-sm text-red-600 mt-4 text-center">{error}</p>
            )}

            <div className="flex gap-3 mt-8">
              <button onClick={() => setStep(1)}
                      className="flex-1 py-3 border border-sand rounded-xl text-sm text-ink-mid hover:bg-parchment-2 transition-colors">
                ← Voltar
              </button>
              <button onClick={handleUpload} disabled={!docTitle || !refDate || uploading}
                      className="flex-[2] py-3 bg-[#8B3A3A] text-white rounded-xl text-sm font-semibold disabled:opacity-50 hover:bg-[#722f2f] transition-colors flex items-center justify-center gap-2">
                {uploading ? 'A enviar...' : <><Upload size={16} /> Fazer Upload</>}
              </button>
            </div>
          </div>
        )}

        {/* STEP 3 — Sucesso */}
        {step === 3 && (
          <div className="text-center">
            <div className="w-20 h-20 rounded-full bg-[#8B3A3A] flex items-center justify-center mx-auto mb-5 animate-pop">
              <svg viewBox="0 0 44 44" width="44" height="44" fill="none" stroke="white" strokeWidth="3"
                   strokeLinecap="round" strokeLinejoin="round">
                <polyline points="8 22 18 32 36 14" />
              </svg>
            </div>
            <h2 className="font-display text-[26px] mb-2">Documento Guardado!</h2>
            <p className="text-ink-mid text-sm mb-6">
              <strong>{docTitle}</strong> foi guardado com sucesso no Drive Financeiro.
            </p>

            <div className="bg-[#F7ECEC] border border-[#d8bcbc] rounded-xl p-4 mb-6 text-left">
              <p className="font-mono text-xs text-[#8B3A3A] mb-3">
                📁 Chapateca / Financeiro / {refDate.slice(0, 4)}
              </p>
              <div className="flex flex-col gap-2">
                {['Documento guardado no Drive', 'Registo criado na base de dados', 'Acessível para Direcção e DAF'].map((item, i) => (
                  <div key={i} className="flex items-center gap-2 text-sm text-ink-mid">
                    <Check size={14} className="text-[#8B3A3A] flex-shrink-0" /> {item}
                  </div>
                ))}
              </div>
            </div>

            <div className="flex flex-col gap-2">
              <button onClick={() => router.push('/financas')}
                      className="w-full py-3.5 bg-[#8B3A3A] text-white font-bold text-sm rounded-full hover:bg-[#722f2f] transition-colors">
                Ver no Departamento Financeiro
              </button>
              <button onClick={() => { setStep(1); setFile(null); setDocTitle(''); setDocType('outro'); setRefDate(new Date().toISOString().slice(0, 7)) }}
                      className="w-full py-3 border border-sand rounded-xl text-sm text-ink-mid hover:bg-parchment-2 transition-colors">
                Carregar outro documento
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
