import { cookies } from 'next/headers'
import { getRoleFromCookie, ROLES, type RoleKey } from '@/lib/roles'
import { prisma } from '@/lib/prisma'
import { getEffectiveAccess } from '@/lib/effective-access'
import { User, Shield, Users } from 'lucide-react'
import UserManagement from '@/components/definicoes/user-management'

type Module = 'galeria' | 'manuais' | 'estrategia' | 'financas' | 'direcao' | 'rh' | 'eventos' | 'cocoPro'

const MODULE_LABELS: Record<Module, string> = {
  galeria:    'Galeria',
  manuais:    'Procedimentos',
  estrategia: 'Estratégia Financeira',
  financas:   'Contabilidade',
  direcao:    'Direção',
  rh:         'RH',
  eventos:    'Eventos',
  cocoPro:    'Coco PRO',
}

export default async function DefinicoesPage() {
  const store = await cookies()
  const roleKey = getRoleFromCookie(store.get('chapateca-role')?.value)
  const role = roleKey ? ROLES[roleKey] : null
  const isAdmin = role?.group === 'admin'

  // Acesso efectivo do utilizador actual (respeitando overrides da admin na DB)
  const myAccess: Record<Module, boolean> = roleKey
    ? await getEffectiveAccess(roleKey as RoleKey)
    : { galeria: false, manuais: false, estrategia: false, financas: false, direcao: false, rh: false, eventos: false, cocoPro: false }

  // Para admins: busca estado de todos os utilizadores na DB
  type UserRow = {
    key: string; name: string; initials: string; color: string; email: string
    group: 'admin' | 'equipa'; access: Record<Module, boolean>
    hasPassword: boolean; mustReset: boolean
  }

  let allUsers: UserRow[] = []

  if (isAdmin) {
    let dbUsers: { email: string; passwordHash: string | null; mustResetPassword: boolean;
      accessGaleria: boolean | null; accessManuais: boolean | null;
      accessEstrategia: boolean | null; accessFinancas: boolean | null;
      accessDirecao: boolean | null; accessRH: boolean | null;
      accessEventos: boolean | null; accessCocoPro: boolean | null }[] = []
    try {
      dbUsers = await prisma.user.findMany({
        select: {
          email: true, passwordHash: true, mustResetPassword: true,
          accessGaleria: true, accessManuais: true, accessEstrategia: true, accessFinancas: true,
          accessDirecao: true, accessRH: true, accessEventos: true, accessCocoPro: true,
        },
      })
    } catch { /* DB não disponível */ }

    const dbByEmail = Object.fromEntries(dbUsers.map(u => [u.email, u]))

    allUsers = Object.values(ROLES).map(r => {
      const db = dbByEmail[r.email]
      return {
        key: r.key, name: r.name, initials: r.initials, color: r.color,
        email: r.email, group: r.group,
        access: {
          galeria:    db?.accessGaleria    ?? r.access.galeria,
          manuais:    db?.accessManuais    ?? r.access.manuais,
          estrategia: db?.accessEstrategia ?? r.access.estrategia,
          financas:   db?.accessFinancas   ?? r.access.financas,
          direcao:    db?.accessDirecao    ?? r.access.direcao,
          rh:         db?.accessRH         ?? r.access.rh,
          eventos:    db?.accessEventos    ?? r.access.eventos,
          cocoPro:    db?.accessCocoPro    ?? r.access.cocoPro,
        },
        hasPassword: !!db?.passwordHash,
        mustReset:   db?.mustResetPassword ?? false,
      }
    })
  }

  return (
    <div>
      <div className="mb-8">
        <h1 className="font-display text-[34px] text-ink leading-tight">Definições</h1>
        <p className="text-ink-soft text-sm mt-1">Configurações da conta e do portal</p>
      </div>

      <div className="flex flex-col gap-4 max-w-3xl">

        {/* Perfil actual */}
        <section className="bg-white border border-sand-light rounded-2xl p-6">
          <div className="flex items-center gap-2 mb-4">
            <User size={16} className="text-forest" />
            <h2 className="text-sm font-semibold text-ink">Perfil Activo</h2>
          </div>
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-full flex items-center justify-center text-lg font-bold text-white flex-shrink-0"
                 style={{ background: role?.color ?? '#461882' }}>
              {role?.initials ?? '?'}
            </div>
            <div>
              <div className="text-sm font-semibold text-ink">{role?.name ?? '—'}</div>
              <div className="text-xs text-ink-soft font-mono">{role?.email ?? '—'}</div>
              <div className="text-xs text-ink-soft font-mono mt-0.5">{role?.label ?? '—'}</div>
            </div>
          </div>
        </section>

        {/* Permissões actuais */}
        <section className="bg-white border border-sand-light rounded-2xl p-6">
          <div className="flex items-center gap-2 mb-4">
            <Shield size={16} className="text-forest" />
            <h2 className="text-sm font-semibold text-ink">Permissões de Acesso</h2>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {role && (Object.entries(MODULE_LABELS) as [Module, string][]).map(([mod, label]) => {
              const allowed = myAccess[mod]
              return (
                <div key={mod} className={`flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-medium ${allowed ? 'bg-forest/8 text-forest' : 'bg-sand-light text-ink-soft'}`}>
                  <span className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${allowed ? 'bg-forest' : 'bg-sand'}`} />
                  {label}
                </div>
              )
            })}
          </div>
        </section>

        {/* ── Gestão de utilizadores — só admins ── */}
        {isAdmin && (
          <section className="bg-white border border-sand-light rounded-2xl p-6">
            <div className="flex items-center gap-2 mb-5">
              <Users size={16} className="text-forest" />
              <h2 className="text-sm font-semibold text-ink">Gestão de Utilizadores</h2>
              <span className="ml-auto text-[10px] font-mono bg-forest/10 text-forest px-2 py-0.5 rounded-full">Só admins</span>
            </div>
            <UserManagement users={allUsers} />
          </section>
        )}

      </div>
    </div>
  )
}
