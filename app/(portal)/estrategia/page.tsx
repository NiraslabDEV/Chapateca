import { Shield, Eye, Download, Pin } from 'lucide-react'
import { cn } from '@/lib/utils'

const DOCS = [
  { name: 'Plano Estratégico 2025–2027', type: 'PDF', size: '4.8 MB', date: 'Dez 2024', pinned: true },
  { name: 'Relatório de Impacto 2024', type: 'PDF', size: '6.2 MB', date: 'Jan 2025', pinned: true },
  { name: 'OKRs Q2 2025', type: 'XLSX', size: '0.3 MB', date: 'Abr 2025' },
  { name: 'Proposta de Parceria — UNICEF', type: 'DOCX', size: '1.1 MB', date: 'Mar 2025' },
  { name: 'Atas da Reunião de Direcção', type: 'PDF', size: '0.7 MB', date: 'Mai 2025' },
]

const TYPE_COLORS: Record<string, string> = {
  PDF: 'bg-red-600', DOCX: 'bg-blue-700', XLSX: 'bg-green-700',
}

export default function EstrategiaPage() {
  return (
    <div>
      <div className="mb-8">
        <h1 className="font-display text-[34px] text-ink leading-tight">Gestão Estratégica</h1>
        <p className="text-ink-soft text-sm mt-1">Documentos de direcção e impacto organizacional</p>
      </div>

      <div className="flex items-center gap-3 px-5 py-4 bg-[#EDE8F7] border border-[#cabae3] rounded-xl mb-6 text-sm text-[#5A3A8B]">
        <Shield size={18} className="flex-shrink-0" />
        <div><strong>Acesso restrito</strong> — Documentos confidenciais de uso exclusivo da Direcção.</div>
      </div>

      <div className="flex flex-col gap-2">
        {DOCS.map((doc, i) => (
          <div key={i} className={cn(
            'flex items-center gap-4 px-5 py-4 rounded-xl border transition-all group cursor-pointer',
            doc.pinned
              ? 'border-l-[3px] border-gold bg-gold-soft border-l-gold hover:bg-gold/10'
              : 'border-sand-light bg-white hover:border-forest-light hover:bg-[#FCFBF7]',
          )}>
            <div className={cn('w-10 h-10 rounded-lg flex items-center justify-center text-[11px] font-bold text-white font-mono flex-shrink-0',
              TYPE_COLORS[doc.type] ?? 'bg-ink-soft')}>
              {doc.type}
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-1.5 text-sm font-semibold text-ink">
                {doc.pinned && <Pin size={12} className="text-gold flex-shrink-0" />}
                {doc.name}
              </div>
              <div className="text-xs text-ink-soft font-mono mt-0.5">{doc.type} · {doc.size} · {doc.date}</div>
            </div>
            <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
              <button className="flex items-center gap-1.5 px-3 py-1.5 border border-sand rounded-lg text-xs font-medium text-ink-mid hover:border-ink-soft">
                <Eye size={12} /> Ver
              </button>
              <button className="flex items-center gap-1.5 px-3 py-1.5 border border-sand rounded-lg text-xs font-medium text-ink-mid hover:border-ink-soft">
                <Download size={12} /> Baixar
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
