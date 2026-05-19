import { Eye, Download, Pin } from 'lucide-react'
import { cn } from '@/lib/utils'

const CATEGORIES = [
  {
    name: 'Operacional',
    docs: [
      { name: 'Manual do Voluntário 2025', type: 'PDF', size: '2.1 MB', date: 'Jan 2025', pinned: true },
      { name: 'Regulamento Interno', type: 'DOCX', size: '0.8 MB', date: 'Mar 2024' },
      { name: 'Guia de Segurança no Terreno', type: 'PDF', size: '1.2 MB', date: 'Fev 2025' },
    ],
  },
  {
    name: 'Comunicação',
    docs: [
      { name: 'Guia de Comunicação Externa', type: 'PDF', size: '1.4 MB', date: 'Fev 2025', pinned: true },
      { name: 'Templates de Relatório de Campo', type: 'DOCX', size: '0.4 MB', date: 'Jan 2025' },
      { name: 'Política de Dados e Privacidade', type: 'PDF', size: '0.5 MB', date: 'Jan 2025' },
    ],
  },
]

const TYPE_COLORS: Record<string, string> = {
  PDF: 'bg-red-600',
  DOCX: 'bg-blue-700',
  XLSX: 'bg-green-700',
}

export default function ManuaisPage() {
  const total = CATEGORIES.reduce((a, c) => a + c.docs.length, 0)
  return (
    <div>
      <div className="mb-8">
        <h1 className="font-display text-[34px] text-ink leading-tight">Manuais e Guias</h1>
        <p className="text-ink-soft text-sm mt-1">Documentação oficial da Chapateca · {total} documentos</p>
      </div>

      {CATEGORIES.map(cat => (
        <div key={cat.name} className="mb-8">
          <div className="flex items-center gap-3 mb-3">
            <h2 className="font-display text-lg text-ink">{cat.name}</h2>
            <span className="text-[11px] font-mono text-ink-soft bg-parchment-2 px-2 py-0.5 rounded-full">{cat.docs.length}</span>
          </div>

          <div className="flex flex-col gap-2">
            {cat.docs.map((doc, i) => (
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
                  <div className="text-xs text-ink-soft font-mono mt-0.5">
                    {doc.type} · {doc.size} · Actualizado: {doc.date}
                  </div>
                </div>
                <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button className="flex items-center gap-1.5 px-3 py-1.5 border border-sand rounded-lg text-xs font-medium text-ink-mid hover:border-ink-soft transition-colors">
                    <Eye size={12} /> Ver
                  </button>
                  <button className="flex items-center gap-1.5 px-3 py-1.5 border border-sand rounded-lg text-xs font-medium text-ink-mid hover:border-ink-soft transition-colors">
                    <Download size={12} /> Baixar
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  )
}
