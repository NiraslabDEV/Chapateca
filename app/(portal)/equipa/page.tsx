import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { getRoleFromCookie, ROLES } from '@/lib/roles'
import { prisma } from '@/lib/prisma'
import { Briefcase, Phone, ChevronRight, UserPlus, Users } from 'lucide-react'

export const dynamic = 'force-dynamic'

export default async function EquipaPage() {
  const store = await cookies()
  const roleKey = getRoleFromCookie(store.get('chapateca-role')?.value)
  if (!roleKey) redirect('/')

  const me = ROLES[roleKey]
  if (me.group !== 'admin') redirect('/acesso-negado')

  let dbUsers: { email: string; image: string | null; jobTitle: string | null; phone: string | null }[] = []
  try {
    dbUsers = await prisma.user.findMany({
      select: { email: true, image: true, jobTitle: true, phone: true },
    })
  } catch { /* DB indisponível */ }

  const byEmail = Object.fromEntries(dbUsers.map(u => [u.email, u]))

  const admins = Object.values(ROLES).filter(r => r.group === 'admin')
  const equipa = Object.values(ROLES).filter(r => r.group === 'equipa')

  const renderCard = (r: typeof ROLES[keyof typeof ROLES]) => {
    const db = byEmail[r.email]
    return (
      <Link
        key={r.key}
        href={`/equipa/${r.key}`}
        className="bg-white border border-sand-light rounded-2xl p-5 flex items-center gap-4 hover:border-forest-light hover:shadow-[0_4px_20px_rgba(22,20,18,0.08)] hover:-translate-y-px transition-all group"
      >
        <div className="w-14 h-14 rounded-full overflow-hidden flex items-center justify-center text-base font-bold text-white flex-shrink-0 ring-2 ring-white shadow-sm"
             style={{ background: r.color }}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          {db?.image ? <img src={db.image} alt={r.name} className="w-full h-full object-cover" /> : r.initials}
        </div>
        <div className="flex-1 min-w-0">
          <div className="text-sm font-semibold text-ink truncate">{r.name}</div>
          {db?.jobTitle ? (
            <div className="text-[12px] text-ink-mid flex items-center gap-1 mt-0.5">
              <Briefcase size={11} className="text-ink-soft" /> {db.jobTitle}
            </div>
          ) : (
            <div className="text-[11px] text-ink-soft italic mt-0.5">Função por definir</div>
          )}
          {db?.phone && (
            <div className="text-[11px] text-ink-soft font-mono mt-0.5 flex items-center gap-1">
              <Phone size={9} /> {db.phone}
            </div>
          )}
        </div>
        <ChevronRight size={16} className="text-ink-soft group-hover:text-forest group-hover:translate-x-0.5 transition-all flex-shrink-0" />
      </Link>
    )
  }

  return (
    <div>
      <div className="flex items-start justify-between mb-8 gap-4">
        <div>
          <h1 className="font-display text-[34px] text-ink leading-tight">Equipa</h1>
          <p className="text-ink-soft text-sm mt-1">
            {Object.values(ROLES).length} pessoas · Click numa pessoa para ver o relatório completo
          </p>
        </div>
        {/* Botão "Adicionar funcionário" — fica disabled até a feature dinâmica ficar pronta */}
        <button
          disabled
          title="Funcionalidade em breve — adicionar novo funcionário dinamicamente"
          className="flex items-center gap-2 px-4 py-2.5 bg-[#461882]/60 text-white font-semibold text-sm rounded-xl cursor-not-allowed opacity-60"
        >
          <UserPlus size={15} /> Adicionar
          <span className="text-[10px] font-mono opacity-80">(em breve)</span>
        </button>
      </div>

      <div className="flex flex-col gap-8 max-w-3xl">
        <section>
          <div className="flex items-center gap-2 mb-3">
            <Users size={14} className="text-[#461882]" />
            <h2 className="text-[11px] font-bold text-ink-soft uppercase tracking-[0.1em]">Direcção · {admins.length}</h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {admins.map(renderCard)}
          </div>
        </section>

        <section>
          <div className="flex items-center gap-2 mb-3">
            <Users size={14} className="text-[#E8652A]" />
            <h2 className="text-[11px] font-bold text-ink-soft uppercase tracking-[0.1em]">Equipa de Campo · {equipa.length}</h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {equipa.map(renderCard)}
          </div>
        </section>
      </div>
    </div>
  )
}
