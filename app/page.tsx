import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import { ROLES, type RoleKey } from '@/lib/roles'
import { prisma } from '@/lib/prisma'
import { hashPassword } from '@/lib/password'
import Image from 'next/image'
import RoleBadge from '@/components/ui/role-badge'
import { Lock } from 'lucide-react'

async function loginAction(formData: FormData) {
  'use server'
  const roleKey = formData.get('role') as string
  const password = formData.get('password') as string

  if (!Object.keys(ROLES).includes(roleKey)) redirect('/?erro=perfil')

  const r = ROLES[roleKey as RoleKey]

  // Verifica senha: DB tem prioridade, senão fallback para env/1234
  let hasCustomPassword = false
  try {
    const user = await prisma.user.findUnique({ where: { email: r.email }, select: { passwordHash: true } })
    if (user?.passwordHash) {
      hasCustomPassword = true
      const hash = hashPassword(password, r.email)
      if (hash !== user.passwordHash) redirect('/?erro=senha')
    }
  } catch { /* DB não disponível, usa fallback */ }

  if (!hasCustomPassword) {
    const envKey = `PASSWORD_${roleKey.toUpperCase()}`
    const validPassword = process.env[envKey] ?? process.env.PORTAL_PASSWORD ?? '1234'
    if (password !== validPassword) redirect('/?erro=senha')
  }

  const store = await cookies()
  store.set('chapateca-role', roleKey, {
    httpOnly: true,
    sameSite: 'lax',
    maxAge: 60 * 60 * 24 * 7,
    path: '/',
  })

  // Primeiro login (sem senha própria) → obriga a definir senha
  if (!hasCustomPassword) redirect('/definir-senha')

  redirect('/dashboard')
}

const adminRoles  = (Object.values(ROLES) as typeof ROLES[RoleKey][]).filter(r => r.group === 'admin')
const equipaRoles = (Object.values(ROLES) as typeof ROLES[RoleKey][]).filter(r => r.group === 'equipa')

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ erro?: string }>
}) {
  const { erro } = await searchParams

  return (
    <div className="min-h-screen flex items-center justify-center p-4 relative overflow-hidden"
         style={{ background: 'linear-gradient(135deg, #1A0836 0%, #461882 60%, #6B2D10 100%)' }}>
      <div className="absolute inset-0 opacity-[0.06] pointer-events-none"
           style={{ backgroundImage: 'radial-gradient(circle, #fff 1px, transparent 1px)', backgroundSize: '24px 24px' }} />

      <div className="w-full max-w-[460px] animate-card-in relative z-10">
        <div className="flex flex-col items-center gap-3 mb-8">
          <Image src="/logo-chapateca.svg" alt="Chapateca" width={160} height={54} className="object-contain brightness-0 invert" />
          <p className="text-sm text-white/50 font-mono tracking-wide">Portal Interno · Maputo</p>
        </div>

        <div className="bg-white rounded-2xl p-6 shadow-[0_32px_80px_rgba(0,0,0,0.5)]">
          <h2 className="text-sm font-semibold text-[#1A1024] mb-0.5">Bem-vindo de volta</h2>
          <p className="text-xs text-[#8B7FA8] mb-4 font-mono">Selecciona o teu perfil:</p>

          {erro === 'senha' && (
            <div className="flex items-center gap-2 px-4 py-3 bg-red-50 border border-red-200 rounded-xl mb-4 text-xs text-red-700 font-medium">
              <Lock size={13} /> Senha incorrecta. Tenta novamente.
            </div>
          )}
          {erro === 'perfil' && (
            <div className="flex items-center gap-2 px-4 py-3 bg-red-50 border border-red-200 rounded-xl mb-4 text-xs text-red-700 font-medium">
              <Lock size={13} /> Selecciona um perfil antes de entrar.
            </div>
          )}

          <form action={loginAction} className="flex flex-col gap-4">
            {/* Direcção */}
            <div>
              <p className="text-[10px] font-bold text-[#8B7FA8] uppercase tracking-[0.1em] mb-2 px-1">Direcção</p>
              <div className="flex flex-col gap-2">
                {adminRoles.map(r => (
                  <label key={r.key}
                         className="flex items-center gap-3 p-2.5 rounded-xl border-2 border-[#D4C8EC] cursor-pointer
                                    has-[:checked]:border-[#461882] has-[:checked]:bg-[#EDE8F7] transition-all">
                    <input type="radio" name="role" value={r.key} className="sr-only" />
                    <div className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold text-white flex-shrink-0"
                         style={{ background: r.color }}>
                      {r.initials}
                    </div>
                    <span className="flex-1 text-sm font-semibold text-[#1A1024]">{r.name}</span>
                    <RoleBadge role={r.key} />
                  </label>
                ))}
              </div>
            </div>

            {/* Equipa */}
            <div>
              <p className="text-[10px] font-bold text-[#8B7FA8] uppercase tracking-[0.1em] mb-2 px-1">Equipa de Campo</p>
              <div className="grid grid-cols-2 gap-2">
                {equipaRoles.map(r => (
                  <label key={r.key}
                         className="flex items-center gap-2 p-2.5 rounded-xl border-2 border-[#D4C8EC] cursor-pointer
                                    has-[:checked]:border-[#E8652A] has-[:checked]:bg-[#FFF0E8] transition-all">
                    <input type="radio" name="role" value={r.key} className="sr-only" />
                    <div className="w-7 h-7 rounded-full flex items-center justify-center text-[11px] font-bold text-white flex-shrink-0"
                         style={{ background: r.color }}>
                      {r.initials}
                    </div>
                    <span className="text-[13px] font-semibold text-[#1A1024] truncate">{r.name}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* Senha */}
            <div>
              <label className="block text-[11px] font-semibold text-[#4A3D60] uppercase tracking-[0.06em] mb-1.5">
                Senha
              </label>
              <div className="relative">
                <Lock size={13} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#8B7FA8]" />
                <input
                  type="password"
                  name="password"
                  placeholder="••••"
                  required
                  className="w-full pl-9 pr-4 py-2.5 border-2 border-[#D4C8EC] rounded-xl text-sm bg-white
                             focus:border-[#461882] focus:ring-2 focus:ring-[#461882]/10 outline-none transition-colors"
                />
              </div>
              <a href="/esqueci-senha"
                 className="block text-right text-[11px] text-[#8B7FA8] hover:text-[#461882] mt-1.5 transition-colors">
                Esqueci a senha →
              </a>
            </div>

            <button type="submit"
                    className="w-full py-3.5 bg-[#461882] text-white rounded-xl font-semibold text-sm
                               hover:bg-[#5A2AA0] transition-colors shadow-[0_4px_16px_rgba(70,24,130,0.4)]">
              Entrar no Portal →
            </button>
          </form>
        </div>
      </div>
    </div>
  )
}
