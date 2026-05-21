import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import { ROLES, type RoleKey } from '@/lib/roles'
import Image from 'next/image'
import RoleBadge from '@/components/ui/role-badge'
import { Lock } from 'lucide-react'

async function loginAction(formData: FormData) {
  'use server'
  const role = formData.get('role') as string
  const password = formData.get('password') as string

  if (!Object.keys(ROLES).includes(role)) redirect('/?erro=perfil')

  const validPassword = process.env.PORTAL_PASSWORD ?? '1234'
  if (password !== validPassword) redirect('/?erro=senha')

  const store = await cookies()
  store.set('chapateca-role', role, {
    httpOnly: true,
    sameSite: 'lax',
    maxAge: 60 * 60 * 24 * 7,
    path: '/',
  })
  redirect('/dashboard')
}

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ erro?: string }>
}) {
  const { erro } = await searchParams

  return (
    <div className="min-h-screen flex items-center justify-center p-4 relative overflow-hidden"
         style={{ background: 'linear-gradient(135deg, #0D1F09 0%, #1C3A14 100%)' }}>
      {/* dot grid texture */}
      <div className="absolute inset-0 opacity-[0.07] pointer-events-none"
           style={{ backgroundImage: 'radial-gradient(circle, #fff 1px, transparent 1px)', backgroundSize: '24px 24px' }} />

      <div className="w-full max-w-[420px] animate-card-in relative z-10">
        {/* Brand */}
        <div className="flex flex-col items-center gap-3 mb-8">
          <Image src="/logo-chapateca.svg" alt="Chapateca" width={160} height={54} className="object-contain brightness-0 invert" />
          <p className="text-sm text-white/50 font-mono tracking-wide">Portal Interno · Maputo</p>
        </div>

        {/* Card */}
        <div className="bg-parchment rounded-2xl p-8 shadow-[0_32px_80px_rgba(0,0,0,0.5)]">
          <h2 className="text-sm font-semibold text-ink mb-1">Bem-vindo de volta</h2>
          <p className="text-xs text-ink-soft mb-6 font-mono">Selecciona o teu perfil para entrar:</p>

          {erro === 'senha' && (
            <div className="flex items-center gap-2 px-4 py-3 bg-red-50 border border-red-200 rounded-xl mb-4 text-xs text-red-700 font-medium">
              <Lock size={13} /> Senha incorrecta. Tenta novamente.
            </div>
          )}

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

            {/* Senha */}
            <div className="mt-1">
              <label className="block text-[11px] font-semibold text-ink uppercase tracking-[0.06em] mb-1.5">
                Senha
              </label>
              <div className="relative">
                <Lock size={13} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-ink-soft" />
                <input
                  type="password"
                  name="password"
                  placeholder="••••"
                  required
                  className="w-full pl-9 pr-4 py-2.5 border-2 border-sand rounded-xl text-sm bg-white
                             focus:border-forest focus:ring-2 focus:ring-forest/10 outline-none transition-colors"
                />
              </div>
            </div>

            <button type="submit"
                    className="mt-1 w-full py-3.5 bg-forest text-white rounded-xl font-semibold text-sm
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
