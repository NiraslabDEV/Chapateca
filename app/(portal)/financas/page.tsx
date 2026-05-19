import { Shield, Eye, Download, Lock } from 'lucide-react'
import { cn } from '@/lib/utils'

const DOCS = [
  { name: 'Orçamento 2025 Aprovado', type: 'XLSX', size: '1.8 MB', date: 'Jan 2025', pinned: true },
  { name: 'Relatório Financeiro Q1 2025', type: 'PDF', size: '2.3 MB', date: 'Abr 2025' },
  { name: 'Extracto Bancário — Maio 2025', type: 'PDF', size: '0.4 MB', date: 'Mai 2025' },
  { name: 'Contrato de Financiamento — FCS', type: 'PDF', size: '1.1 MB', date: 'Mar 2025', locked: true },
  { name: 'Documentação para Auditoria 2024', type: 'PDF', size: '8.9 MB', date: 'Fev 2025' },
]

const TYPE_COLORS: Record<string, string> = {
  PDF: 'bg-red-600', DOCX: 'bg-blue-700', XLSX: 'bg-green-700',
}

export default function FinancasPage() {
  return (
    <div>
      <div className="mb-8">
        <h1 className="font-display text-[34px] text-ink leading-tight">Departamento Financeiro</h1>
        <p className="text-ink-soft text-sm mt-1">Orçamentos, relatórios e documentação contabilística</p>
      </div>

      <div className="flex items-center gap-3 px-5 py-4 bg-[#F7ECEC] border border-[#d8bcbc] rounded-xl mb-6 text-sm text-[#8B3A3A]">
        <Shield size={18} className="flex-shrink-0" />
        <div><strong>Auditoria em Maio 2025</strong> — Documentação deve estar actualizada até 31 Mai.</div>
      </div>

      <div className="flex flex-col gap-2">
        {DOCS.map((doc, i) => (
          <div key={i} className={cn(
            'flex items-center gap-4 px-5 py-4 rounded-xl border transition-all group',
            doc.pinned ? 'border-l-[3px] border-gold bg-gold-soft border-l-gold' : 'border-sand-light bg-white',
            doc.locked ? 'opacity-55 cursor-not-allowed' : 'hover:border-forest-light hover:bg-[#FCFBF7] cursor-pointer',
          )}>
            <div className={cn('w-10 h-10 rounded-lg flex items-center justify-center text-[11px] font-bold text-white font-mono flex-shrink-0',
              doc.locked ? 'bg-ink-soft' : (TYPE_COLORS[doc.type] ?? 'bg-ink-soft'))}>
              {doc.locked ? <Lock size={14} /> : doc.type}
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-sm font-semibold text-ink">{doc.name}</div>
              <div className="text-xs text-ink-soft font-mono mt-0.5">{doc.type} · {doc.size} · {doc.date}</div>
            </div>
            {!doc.locked ? (
              <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                <button className="flex items-center gap-1.5 px-3 py-1.5 border border-sand rounded-lg text-xs font-medium text-ink-mid hover:border-ink-soft">
                  <Eye size={12} /> Ver
                </button>
                <button className="flex items-center gap-1.5 px-3 py-1.5 border border-sand rounded-lg text-xs font-medium text-ink-mid hover:border-ink-soft">
                  <Download size={12} /> Baixar
                </button>
              </div>
            ) : (
              <span className="text-xs text-ink-soft flex items-center gap-1 font-mono"><Lock size={11} /> Só Direcção</span>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}
