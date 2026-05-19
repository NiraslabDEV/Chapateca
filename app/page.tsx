import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import { ROLES, type RoleKey } from '@/lib/roles'
import BrandGlyph from '@/components/ui/brand-glyph'
import RoleBadge from '@/components/ui/role-badge'

async function loginAction(formData: FormData) {
  'use server'
  const role = formData.get('role') as string
  if (!Object.keys(ROLES).includes(role)) return
  const store = await cookies()
  store.set('chapateca-role', role, {
    httpOnly: true,
    sameSite: 'lax',
    maxAge: 60 * 60 * 24 * 7,
    path: '/',
  })
  redirect('/dashboard')
}

export default function LoginPage() {
  return (
    <div className="min-h-screen flex items-center justify-center p-4 relative overflow-hidden"
         style={{ background: 'linear-gradient(135deg, #0D1F09 0%, #1C3A14 100%)' }}>
      {/* dot grid texture */}
      <div className="absolute inset-0 opacity-[0.07] pointer-events-none"
           style={{ backgroundImage: 'radial-gradient(circle, #fff 1px, transparent 1px)', backgroundSize: '24px 24px' }} />

      <div className="w-full max-w-[420px] animate-card-in relative z-10">
        {/* Brand */}
        <div className="flex flex-col items-center gap-2 mb-8">
          <BrandGlyph size={52} />
          <h1 className="font-display text-[32px] text-white leading-none">Chapateca</h1>
          <p className="text-sm text-white/50 font-mono tracking-wide">Portal Interno · Maputo</p>
        </div>

        {/* Card */}
        <div className="bg-parchment rounded-2xl p-8 shadow-[0_32px_80px_rgba(0,0,0,0.5)]">
          <h2 className="text-sm font-semibold text-ink mb-1">Bem-vindo de volta</h2>
          <p className="text-xs text-ink-soft mb-6 font-mono">Selecciona o teu perfil para entrar:</p>

          <form action={loginAction} className="flex flex-col gap-3">
            {(Object.values(ROLES) as typeof ROLES[RoleKey][]).map((r) => (
              <label key={r.key} className="flex items-center gap-3 p-3 rounded-xl border-2 border-sand cursor-pointer
                                            has-[:checked]:border-forest has-[:checked]:bg-forest/5 transition-all">
                <input type="radio" name="role" value={r.key} className="sr-only" />
                <div className="w-9 h-9 rounded-full flex items-center justify-center text-xs font-bold text-white flex-shrink-0"
                     style={{ background: r.color }}>
                  {r.initials}
                </div>
                <div className="flex-1">
                  <div className="text-sm font-semibold text-ink">{r.name}</div>
                  <div className="text-xs text-ink-soft font-mono">{r.label}</div>
                </div>
                <RoleBadge role={r.key} />
              </label>
            ))}

            <button type="submit"
                    className="mt-2 w-full py-3.5 bg-forest text-white rounded-xl font-semibold text-sm
                               hover:bg-forest-mid transition-colors shadow-[0_4px_16px_rgba(28,58,20,0.4)]">
              Entrar no Portal →
            </button>
          </form>

          <p className="text-center text-xs text-ink-soft mt-4 font-mono">
            🔒 Em produção: Google OAuth @chapateca.org
          </p>
        </div>
      </div>
    </div>
  )
}
