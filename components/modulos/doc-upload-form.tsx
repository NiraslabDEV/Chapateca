'use client'

import { useState, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { Upload, Check, ArrowLeft, ArrowRight, FileText, Calendar, FolderOpen, Plus, X } from 'lucide-react'
import { cn } from '@/lib/utils'
import type { DocCategory } from '@/lib/folder-actions'

const DOC_TYPE_OPTIONS: Record<string, string> = {
  orcamento: 'Orçamento',
  relatorio: 'Relatório',
  extrato: 'Extracto Bancário',
  contrato: 'Contrato',
  auditoria: 'Auditoria',
  plano: 'Plano',
  ata: 'Acta de Reunião',
  regulamento: 'Regulamento',
  guia: 'Guia / Manual',
  outro: 'Outro',
}

const STEPS = ['Seleccionar', 'Detalhes', 'Concluído']

function detectFileType(mimeType: string) {
  if (mimeType === 'application/pdf') return 'PDF'
  if (mimeType.includes('spreadsheet') || mimeType.includes('excel')) return 'XLSX'
  if (mimeType.includes('wordprocessing') || mimeType.includes('msword')) return 'DOCX'
  return null
}

function formatBytes(bytes: number) {
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} KB`
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
}

const TYPE_COLORS: Record<string, string> = {
  PDF: 'bg-red-600',
  XLSX: 'bg-green-700',
  DOCX: 'bg-blue-700',
}

export type FolderOption = { id: string; name: string; depth?: number }

interface DocUploadFormProps {
  category: DocCategory
  backHref: string
  successHref: string
  accentColor: string
  categoryLabel: string
  folders: FolderOption[]
  preselectedFolderId?: string
}

export default function DocUploadForm({
  category,
  backHref,
  successHref,
  accentColor,
  categoryLabel,
  folders,
  preselectedFolderId,
}: DocUploadFormProps) {
  const router = useRouter()
  const inputRef = useRef<HTMLInputElement>(null)

  const [step, setStep] = useState(1)
  const [files, setFiles] = useState<File[]>([])
  const [invalidFiles, setInvalidFiles] = useState<string[]>([])
  const [docType, setDocType] = useState('outro')
  const [folderId, setFolderId] = useState(preselectedFolderId ?? (folders[0]?.id ?? ''))
  const [newFolderName, setNewFolderName] = useState('')
  const [creatingFolder, setCreatingFolder] = useState(false)
  const [refDate, setRefDate] = useState(new Date().toISOString().slice(0, 7))
  const [uploading, setUploading] = useState(false)
  const [uploadProgress, setUploadProgress] = useState(0)
  const [error, setError] = useState('')

  const handleFiles = (picked: FileList | null) => {
    if (!picked) return
    const valid: File[] = []
    const invalid: string[] = []
    Array.from(picked).forEach(f => {
      if (detectFileType(f.type)) {
        valid.push(f)
      } else {
        invalid.push(f.name)
      }
    })
    setFiles(prev => {
      const existing = new Set(prev.map(f => f.name + f.size))
      return [...prev, ...valid.filter(f => !existing.has(f.name + f.size))]
    })
    setInvalidFiles(invalid)
  }

  const removeFile = (idx: number) => {
    setFiles(prev => prev.filter((_, i) => i !== idx))
  }

  const createFolderInline = async () => {
    if (!newFolderName.trim()) return
    setCreatingFolder(true)
    try {
      const res = await fetch('/api/folder', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ category, name: newFolderName.trim() }),
      })
      if (res.ok) {
        const data = await res.json()
        setFolderId(data.id)
        setNewFolderName('')
      }
    } catch { /* ignore */ } finally {
      setCreatingFolder(false)
    }
  }

  const handleUpload = async () => {
    if (!files.length || !refDate) return
    setUploading(true)
    setError('')
    setUploadProgress(0)
    try {
      for (let i = 0; i < files.length; i++) {
        const file = files[i]
        const fd = new FormData()
        fd.append('file', file)
        fd.append('docTitle', file.name.replace(/\.[^.]+$/, '').replace(/[_-]/g, ' '))
        fd.append('docType', docType)
        fd.append('refDate', `${refDate}-01`)
        fd.append('category', category)
        if (folderId) fd.append('folderId', folderId)
        const res = await fetch('/api/upload-doc', { method: 'POST', body: fd })
        if (!res.ok) {
          const data = await res.json().catch(() => ({}))
          setError(`Erro em "${file.name}": ${data.error ?? 'upload falhou'}`)
          setUploading(false)
          return
        }
        setUploadProgress(i + 1)
      }
      setStep(3)
    } catch {
      setError('Erro de ligação. Tenta novamente.')
    } finally {
      setUploading(false)
    }
  }

  const accentStyle = { '--accent': accentColor } as React.CSSProperties

  return (
    <div style={accentStyle}>
      <button onClick={() => router.push(backHref)}
              style={{ color: accentColor }}
              className="flex items-center gap-1.5 text-sm font-medium mb-6 hover:opacity-70 transition-opacity">
        <ArrowLeft size={16} /> Voltar
      </button>

      {/* Stepper */}
      <div className="flex items-center justify-center gap-0 mb-10 max-w-lg mx-auto">
        {STEPS.map((s, i) => (
          <div key={i} className="flex items-center">
            <div className="flex flex-col items-center gap-2">
              <div className={cn(
                'w-9 h-9 rounded-full flex items-center justify-center text-[13px] font-semibold font-mono transition-all',
                step > i + 1 || step === i + 1 ? 'text-white' : 'bg-white border-2 border-sand text-ink-soft',
              )} style={step > i + 1 || step === i + 1 ? { background: accentColor } : {}}>
                {step > i + 1 ? <Check size={16} /> : i + 1}
              </div>
              <span className={cn('text-[12px] font-medium', step === i + 1 ? 'text-ink' : 'text-ink-soft')}>{s}</span>
            </div>
            {i < STEPS.length - 1 && (
              <div className="w-20 h-0.5 mx-2 mb-5 relative overflow-hidden bg-sand">
                <div className="absolute inset-y-0 left-0 transition-all duration-500"
                     style={{ right: step > i + 1 ? 0 : '100%', background: accentColor }} />
              </div>
            )}
          </div>
        ))}
      </div>

      <div className="max-w-xl mx-auto bg-white border border-sand-light rounded-2xl p-10 shadow-[0_2px_8px_rgba(22,20,18,0.08)]">

        {/* STEP 1 */}
        {step === 1 && (
          <div>
            <h2 className="font-display text-[26px] text-center mb-1">Seleccionar Documentos</h2>
            <p className="text-center text-sm text-ink-soft mb-6">PDF, Excel (XLSX) ou Word (DOCX) · múltiplos ficheiros</p>

            <input ref={inputRef} type="file" multiple
                   accept=".pdf,.xlsx,.xls,.docx,.doc,application/pdf,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet,application/vnd.ms-excel,application/vnd.openxmlformats-officedocument.wordprocessingml.document,application/msword"
                   className="hidden" onChange={e => handleFiles(e.target.files)} />

            {/* Drop zone */}
            <button onClick={() => inputRef.current?.click()}
                    className="w-full border-2 border-dashed border-sand rounded-2xl py-10 text-center hover:border-ink-soft hover:bg-parchment-2 transition-all mb-4">
              <FileText size={34} className="mx-auto mb-3 text-ink-soft" />
              <div className="font-display text-lg text-ink mb-1">Clica para seleccionar</div>
              <div className="text-xs text-ink-soft font-mono">PDF · XLSX · DOCX · podes seleccionar vários</div>
            </button>

            {/* File list */}
            {files.length > 0 && (
              <div className="flex flex-col gap-2 mb-4">
                {files.map((file, idx) => {
                  const type = detectFileType(file.type)
                  return (
                    <div key={idx} className="flex items-center gap-3 px-4 py-2.5 border border-sand-light rounded-xl bg-parchment-2">
                      <div className={cn('w-9 h-9 rounded-lg flex items-center justify-center text-[10px] font-bold text-white font-mono flex-shrink-0', TYPE_COLORS[type ?? ''] ?? 'bg-ink-soft')}>
                        {type}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="text-sm font-medium text-ink truncate">{file.name}</div>
                        <div className="text-xs text-ink-soft font-mono">{formatBytes(file.size)}</div>
                      </div>
                      <button onClick={() => removeFile(idx)} className="text-ink-soft hover:text-red-500 transition-colors flex-shrink-0">
                        <X size={14} />
                      </button>
                    </div>
                  )
                })}
                <button onClick={() => inputRef.current?.click()}
                        className="text-xs font-medium py-2 border border-dashed border-sand rounded-xl hover:bg-parchment-2 transition-colors"
                        style={{ color: accentColor }}>
                  + Adicionar mais ficheiros
                </button>
              </div>
            )}

            {invalidFiles.length > 0 && (
              <p className="text-sm text-red-600 text-center mb-3">
                Ignorados (tipo inválido): {invalidFiles.join(', ')}
              </p>
            )}

            <div className="flex gap-3 mt-4">
              <button onClick={() => router.push(backHref)} className="flex-1 py-3 border border-sand rounded-xl text-sm text-ink-mid hover:bg-parchment-2 transition-colors">Cancelar</button>
              <button onClick={() => files.length > 0 && setStep(2)} disabled={files.length === 0}
                      className="flex-[2] py-3 text-white rounded-xl text-sm font-semibold disabled:opacity-50 hover:opacity-90 transition-opacity flex items-center justify-center gap-2"
                      style={{ background: accentColor }}>
                Continuar ({files.length}) <ArrowRight size={16} />
              </button>
            </div>
          </div>
        )}

        {/* STEP 2 */}
        {step === 2 && (
          <div>
            <h2 className="font-display text-[26px] text-center mb-1">Detalhes</h2>
            <p className="text-center text-sm text-ink-soft mb-6">{files.length} ficheiro{files.length !== 1 ? 's' : ''} serão guardados com as mesmas definições</p>
            <div className="flex flex-col gap-5">

              {/* Pasta */}
              <div>
                <label className="block text-[12px] font-semibold text-ink uppercase tracking-[0.06em] mb-1.5">
                  Pasta <span className="text-red-500">*</span>
                </label>
                {folders.length > 0 ? (
                  <div className="relative">
                    <FolderOpen size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-ink-soft" />
                    <select value={folderId} onChange={e => setFolderId(e.target.value)}
                            className="w-full pl-9 pr-4 py-2.5 border border-sand rounded-xl text-sm bg-white appearance-none focus:border-ink-soft outline-none">
                      {folders.map(f => (
                        <option key={f.id} value={f.id}>
                          {(f.depth ?? 0) > 0 ? '— ' : ''}{f.name}
                        </option>
                      ))}
                    </select>
                  </div>
                ) : (
                  <div className="flex gap-2">
                    <input value={newFolderName} onChange={e => setNewFolderName(e.target.value)}
                           placeholder="Criar primeira pasta..."
                           className="flex-1 px-3 py-2.5 border border-sand rounded-xl text-sm focus:border-ink-soft outline-none" />
                    <button onClick={createFolderInline} disabled={!newFolderName.trim() || creatingFolder}
                            className="px-3 py-2.5 text-white rounded-xl text-sm font-semibold disabled:opacity-40 flex items-center gap-1"
                            style={{ background: accentColor }}>
                      <Plus size={14} /> Criar
                    </button>
                  </div>
                )}
              </div>

              {/* Tipo */}
              <div>
                <label className="block text-[12px] font-semibold text-ink uppercase tracking-[0.06em] mb-1.5">Tipo</label>
                <select value={docType} onChange={e => setDocType(e.target.value)}
                        className="w-full px-4 py-2.5 border border-sand rounded-xl text-sm bg-white appearance-none focus:border-ink-soft outline-none">
                  {Object.entries(DOC_TYPE_OPTIONS).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
                </select>
              </div>

              {/* Data */}
              <div>
                <label className="block text-[12px] font-semibold text-ink uppercase tracking-[0.06em] mb-1.5">
                  Período de Referência <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <Calendar size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-ink-soft" />
                  <input type="month" value={refDate} onChange={e => setRefDate(e.target.value)}
                         className="w-full pl-9 pr-4 py-2.5 border border-sand rounded-xl text-sm bg-white focus:border-ink-soft outline-none" />
                </div>
              </div>
            </div>

            {error && <p className="text-sm text-red-600 mt-4 text-center">{error}</p>}

            {/* Upload progress */}
            {uploading && (
              <div className="mt-4">
                <div className="flex justify-between text-xs text-ink-soft font-mono mb-1.5">
                  <span>A enviar...</span>
                  <span>{uploadProgress} / {files.length}</span>
                </div>
                <div className="w-full h-1.5 bg-sand rounded-full overflow-hidden">
                  <div className="h-full rounded-full transition-all duration-300"
                       style={{ width: `${(uploadProgress / files.length) * 100}%`, background: accentColor }} />
                </div>
              </div>
            )}

            <div className="flex gap-3 mt-8">
              <button onClick={() => setStep(1)} className="flex-1 py-3 border border-sand rounded-xl text-sm text-ink-mid hover:bg-parchment-2 transition-colors">← Voltar</button>
              <button onClick={handleUpload} disabled={!refDate || uploading || (!folderId && folders.length > 0)}
                      className="flex-[2] py-3 text-white rounded-xl text-sm font-semibold disabled:opacity-50 hover:opacity-90 transition-opacity flex items-center justify-center gap-2"
                      style={{ background: accentColor }}>
                {uploading ? `A enviar ${uploadProgress}/${files.length}...` : <><Upload size={16} /> Enviar {files.length} ficheiro{files.length !== 1 ? 's' : ''}</>}
              </button>
            </div>
          </div>
        )}

        {/* STEP 3 */}
        {step === 3 && (
          <div className="text-center">
            <div className="w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-5 animate-pop"
                 style={{ background: accentColor }}>
              <svg viewBox="0 0 44 44" width="44" height="44" fill="none" stroke="white" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="8 22 18 32 36 14" />
              </svg>
            </div>
            <h2 className="font-display text-[26px] mb-2">
              {files.length === 1 ? 'Documento Guardado!' : `${files.length} Documentos Guardados!`}
            </h2>
            <p className="text-ink-mid text-sm mb-6">
              {files.length === 1
                ? <><strong>{files[0]?.name}</strong> guardado em {categoryLabel}.</>
                : <><strong>{files.length} ficheiros</strong> guardados em {categoryLabel}.</>}
            </p>
            <div className="flex flex-col gap-2">
              <button onClick={() => router.push(backHref)}
                      className="w-full py-3.5 text-white font-bold text-sm rounded-full hover:opacity-90 transition-opacity"
                      style={{ background: accentColor }}>
                Ver em {categoryLabel}
              </button>
              <button onClick={() => { setStep(1); setFiles([]); setDocType('outro'); setRefDate(new Date().toISOString().slice(0, 7)); setUploadProgress(0) }}
                      className="w-full py-3 border border-sand rounded-xl text-sm text-ink-mid hover:bg-parchment-2 transition-colors">
                Carregar mais documentos
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
