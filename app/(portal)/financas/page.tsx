import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { getRoleFromCookie, ROLES } from '@/lib/roles'
import { prisma } from '@/lib/prisma'
import { Upload, Eye, Download, Lock, FileText, FileSpreadsheet, Pin } from 'lucide-react'
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

function formatBytes(bytes: number | null) {
  if (!bytes) return '—'
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} KB`
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
}

function formatDate(d: Date) {
  return d.toLocaleDateString('pt-MZ', { month: 'short', year: 'numeric' })
}

type DocEntry = {
  id: string
  driveId: string
  title: string
  fileName: string
  fileType: string
  fileSize: number | null
  docType: string
  refDate: Date
  uploaderName: string
  uploaderInitials: string
  isMock: boolean
}

// Documentos de exemplo exibidos quando a DB ainda não tem nada
const MOCK_DOCS: DocEntry[] = [
  { id: 'm1', driveId: 'mock-1', title: 'Orçamento 2025 Aprovado', fileName: 'orcamento_2025.xlsx', fileType: 'XLSX', fileSize: 1843200, docType: 'orcamento', refDate: new Date('2025-01-01'), uploaderName: 'Constance', uploaderInitials: 'CO', isMock: true },
  { id: 'm2', driveId: 'mock-2', title: 'Relatório Financeiro Q1 2025', fileName: 'relatorio_q1_2025.pdf', fileType: 'PDF', fileSize: 2411520, docType: 'relatorio', refDate: new Date('2025-04-01'), uploaderName: 'Constance', uploaderInitials: 'CO', isMock: true },
  { id: 'm3', driveId: 'mock-3', title: 'Extracto Bancário — Maio 2025', fileName: 'extrato_maio_2025.pdf', fileType: 'PDF', fileSize: 419840, docType: 'extrato', refDate: new Date('2025-05-01'), uploaderName: 'Sonia Zahi', uploaderInitials: 'SZ', isMock: true },
]

export default async function FinancasPage() {
  const store = await cookies()
  const role = getRoleFromCookie(store.get('chapateca-role')?.value)
  if (!role) redirect('/')

  const r = ROLES[role]
  if (!r.access.financas) redirect('/acesso-negado')

  let docs: DocEntry[] = MOCK_DOCS
  let dbConnected = false

  try {
    const rows = await prisma.fileLog.findMany({
      where: { category: 'FINANCEIRO' },
      orderBy: { activityDate: 'desc' },
      include: { uploadedBy: true },
    })
    dbConnected = true
    if (rows.length > 0) {
      docs = rows.map(r => {
        const name = r.uploadedBy?.name ?? 'Equipa'
        return {
          id: r.id,
          driveId: r.googleDriveId,
          title: r.activityName || r.fileName,
          fileName: r.fileName,
          fileType: r.fileType,
          fileSize: (r as { fileSize?: number | null }).fileSize ?? null,
          docType: r.location || 'outro',
          refDate: r.activityDate || r.createdAt,
          uploaderName: name,
          uploaderInitials: name.split(' ').map((w: string) => w[0]).join('').slice(0, 2).toUpperCase(),
          isMock: false,
        }
      })
    }
  } catch { /* DB não disponível */ }

  // Agrupar por ano
  const grouped = docs.reduce((acc, doc) => {
    const year = doc.refDate.getFullYear().toString()
    if (!acc[year]) acc[year] = []
    acc[year].push(doc)
    return acc
  }, {} as Record<string, DocEntry[]>)

  const years = Object.keys(grouped).sort((a, b) => Number(b) - Number(a))
  const isDemo = !dbConnected || docs === MOCK_DOCS

  return (
    <div>
      {/* Header */}
      <div className="flex items-end justify-between mb-6 gap-6">
        <div>
          <h1 className="font-display text-[34px] text-ink leading-tight">Departamento Financeiro</h1>
          <p className="text-ink-soft text-sm mt-1">
            {dbConnected
              ? `${docs.length} documento${docs.length !== 1 ? 's' : ''} archivado${docs.length !== 1 ? 's' : ''}`
              : 'Orçamentos, relatórios e documentação contabilística'}
          </p>
        </div>
        <Link href="/financas/upload"
              className="flex items-center gap-2 px-5 py-3 bg-[#8B3A3A] text-white font-bold text-sm rounded-full hover:bg-[#722f2f] transition-all shadow-[0_4px_14px_rgba(139,58,58,0.35)]">
          <Upload size={16} /> Carregar Documento
        </Link>
      </div>

      {/* Banner demo */}
      {isDemo && (
        <div className="flex items-center gap-3 px-5 py-4 bg-[#F7ECEC] border border-[#d8bcbc] rounded-xl mb-6 text-sm text-[#8B3A3A]">
          <Lock size={16} className="flex-shrink-0" />
          <div>
            <strong>Documentos de demonstração</strong> — carrega o primeiro documento real para começar o arquivo.
          </div>
        </div>
      )}

      {/* Lista por ano */}
      {years.map(year => (
        <div key={year} className="mb-10">
          <div className="text-[13px] font-display uppercase tracking-[0.12em] text-ink-soft mb-4 flex items-center gap-3
                          after:flex-1 after:h-px after:bg-sand after:content-['']">
            {year}
          </div>

          <div className="flex flex-col gap-2">
            {grouped[year].map(doc => (
              <DocRow key={doc.id} doc={doc} isMock={doc.isMock} />
            ))}
          </div>
        </div>
      ))}

      {dbConnected && docs.length === 0 && (
        <div className="text-center py-16 text-ink-soft text-sm">
          Nenhum documento arquivado ainda.{' '}
          <Link href="/financas/upload" className="text-[#8B3A3A] font-medium hover:underline">
            Carregar o primeiro
          </Link>
        </div>
      )}
    </div>
  )
}

function DocRow({ doc, isMock }: { doc: DocEntry; isMock: boolean }) {
  const viewUrl = `/api/drive/doc/${doc.driveId}`
  const downloadUrl = `/api/drive/doc/${doc.driveId}?download=1`
  const docTypeLabel = DOC_TYPES[doc.docType] ?? doc.docType

  return (
    <div className={cn(
      'flex items-center gap-4 px-5 py-4 rounded-xl border transition-all group',
      isMock
        ? 'border-sand-light bg-parchment-2 opacity-60'
        : 'border-sand-light bg-white hover:border-[#d8bcbc] hover:bg-[#FCFBF7] cursor-pointer',
    )}>
      {/* Tipo badge */}
      <div className={cn(
        'w-11 h-11 rounded-xl flex items-center justify-center text-[10px] font-bold text-white font-mono flex-shrink-0',
        TYPE_COLORS[doc.fileType] ?? 'bg-ink-soft'
      )}>
        {doc.fileType === 'XLSX' ? <FileSpreadsheet size={20} /> : doc.fileType === 'DOCX' ? <FileText size={20} /> : doc.fileType}
      </div>

      {/* Info */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-0.5">
          <span className="text-sm font-semibold text-ink truncate">{doc.title}</span>
          {doc.docType === 'orcamento' && (
            <Pin size={11} className="text-gold flex-shrink-0" />
          )}
        </div>
        <div className="flex items-center gap-2.5 text-[11px] text-ink-soft font-mono flex-wrap">
          <span className="px-2 py-0.5 bg-[#F7ECEC] text-[#8B3A3A] rounded-full font-medium">{docTypeLabel}</span>
          <span>{formatBytes(doc.fileSize)}</span>
          <span>·</span>
          <span>{formatDate(doc.refDate)}</span>
          <span>·</span>
          <span>{doc.uploaderName}</span>
        </div>
      </div>

      {/* Acções */}
      {isMock ? (
        <span className="text-[11px] text-ink-soft font-mono flex items-center gap-1">
          <Lock size={11} /> Demo
        </span>
      ) : (
        <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
          {doc.fileType === 'PDF' && (
            <a href={viewUrl} target="_blank" rel="noopener noreferrer"
               className="flex items-center gap-1.5 px-3 py-1.5 border border-sand rounded-lg text-xs font-medium text-ink-mid hover:border-[#8B3A3A] hover:text-[#8B3A3A] transition-colors">
              <Eye size={12} /> Ver
            </a>
          )}
          <a href={downloadUrl}
             className="flex items-center gap-1.5 px-3 py-1.5 border border-sand rounded-lg text-xs font-medium text-ink-mid hover:border-[#8B3A3A] hover:text-[#8B3A3A] transition-colors">
            <Download size={12} /> Baixar
          </a>
        </div>
      )}
    </div>
  )
}
