import { cookies } from 'next/headers'
import { getRoleFromCookie } from '@/lib/roles'
import { ROLES } from '@/lib/roles'
import { User, Shield, Bell, Globe, Palette } from 'lucide-react'

export default async function DefinicoesPage() {
  const store = await cookies()
  const roleKey = getRoleFromCookie(store.get('chapateca-role')?.value)
  const role = roleKey ? ROLES[roleKey] : null

  return (
    <div>
      <div className="mb-8">
        <h1 className="font-display text-[34px] text-ink leading-tight">Definições</h1>
        <p className="text-ink-soft text-sm mt-1">Configurações da tua conta e do portal</p>
      </div>

      <div className="flex flex-col gap-4 max-w-2xl">

        {/* Perfil actual */}
        <section className="bg-white border border-sand-light rounded-2xl p-6">
          <div className="flex items-center gap-2 mb-4">
            <User size={16} className="text-forest" />
            <h2 className="text-sm font-semibold text-ink">Perfil Activo</h2>
          </div>
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-full flex items-center justify-center text-lg font-bold text-white flex-shrink-0"
                 style={{ background: role ? role.color : '#1C3A14' }}>
              {role?.initials ?? '?'}
            </div>
            <div>
              <div className="text-sm font-semibold text-ink">{role?.name ?? 'Sem perfil'}</div>
              <div className="text-xs text-ink-soft font-mono">{role?.email ?? '—'}</div>
              <div className="text-xs text-ink-soft font-mono mt-0.5">{role?.label ?? '—'}</div>
            </div>
          </div>
        </section>

        {/* Permissões */}
        <section className="bg-white border border-sand-light rounded-2xl p-6">
          <div className="flex items-center gap-2 mb-4">
            <Shield size={16} className="text-forest" />
            <h2 className="text-sm font-semibold text-ink">Permissões de Acesso</h2>
          </div>
          <div className="grid grid-cols-2 gap-2">
            {role && Object.entries(role.access).map(([mod, allowed]) => (
              <div key={mod} className="flex items-center gap-2 text-xs">
                <span className={`w-2 h-2 rounded-full flex-shrink-0 ${allowed ? 'bg-green-500' : 'bg-sand'}`} />
                <span className={allowed ? 'text-ink' : 'text-ink-soft'}>{mod}</span>
              </div>
            ))}
          </div>
        </section>

        {/* Notificações — placeholder */}
        <section className="bg-white border border-sand-light rounded-2xl p-6 opacity-60">
          <div className="flex items-center gap-2 mb-2">
            <Bell size={16} className="text-forest" />
            <h2 className="text-sm font-semibold text-ink">Notificações</h2>
            <span className="ml-auto text-[10px] font-mono bg-sand px-2 py-0.5 rounded-full text-ink-soft">em breve</span>
          </div>
          <p className="text-xs text-ink-soft">Configura alertas por email para novos uploads e documentos partilhados.</p>
        </section>

        {/* Idioma/Região — placeholder */}
        <section className="bg-white border border-sand-light rounded-2xl p-6 opacity-60">
          <div className="flex items-center gap-2 mb-2">
            <Globe size={16} className="text-forest" />
            <h2 className="text-sm font-semibold text-ink">Idioma e Região</h2>
            <span className="ml-auto text-[10px] font-mono bg-sand px-2 py-0.5 rounded-full text-ink-soft">em breve</span>
          </div>
          <p className="text-xs text-ink-soft">Português (Moçambique) · Fuso horário: UTC+2 (Maputo)</p>
        </section>

        {/* Aparência — placeholder */}
        <section className="bg-white border border-sand-light rounded-2xl p-6 opacity-60">
          <div className="flex items-center gap-2 mb-2">
            <Palette size={16} className="text-forest" />
            <h2 className="text-sm font-semibold text-ink">Aparência</h2>
            <span className="ml-auto text-[10px] font-mono bg-sand px-2 py-0.5 rounded-full text-ink-soft">em breve</span>
          </div>
          <p className="text-xs text-ink-soft">Tema claro activo. Modo escuro disponível em breve.</p>
        </section>

      </div>
    </div>
  )
}
