import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import { getRoleFromCookie, ROLES } from '@/lib/roles'
import { prisma } from '@/lib/prisma'
import { hashPassword } from '@/lib/password'
import { Lock, ShieldCheck } from 'lucide-react'

async function definirSenhaAction(formData: FormData) {
  'use server'
  const store = await cookies()
  const roleKey = getRoleFromCookie(store.get('chapateca-role')?.value)
  if (!roleKey) redirect('/')

  const nova = formData.get('nova') as string
  const confirma = formData.get('confirma') as string

  if (nova.length < 6) redirect('/definir-senha?erro=curta')
  if (nova !== confirma) redirect('/definir-senha?erro=diferente')

  const r = ROLES[roleKey]
  const passwordHash = hashPassword(nova, r.email)

  try {
    await prisma.user.upsert({
      where: { email: r.email },
      update: { passwordHash },
      create: {
        id: `user-${roleKey}`,
        name: r.name,
        email: r.email,
        role: r.dbRole,
        passwordHash,
      },
    })
  } catch {
    redirect('/definir-senha?erro=db')
  }

  redirect('/dashboard')
}

export default async function DefinirSenhaPage({
  searchParams,
}: {
  searchParams: Promise<{ erro?: string }>
}) {
  const store = await cookies()
  const roleKey = getRoleFromCookie(store.get('chapateca-role')?.value)
  if (!roleKey) redirect('/')

  const r = ROLES[roleKey]
  const { erro } = await searchParams

  const erros: Record<string, string> = {
    curta:     'A senha deve ter pelo menos 6 caracteres.',
    diferente: 'As senhas não coincidem.',
    db:        'Erro ao guardar. Tenta novamente.',
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4"
         style={{ background: 'linear-gradient(135deg, #1A0836 0%, #461882 60%, #6B2D10 100%)' }}>
      <div className="w-full max-w-sm animate-card-in">
        <div className="bg-white rounded-2xl p-8 shadow-[0_32px_80px_rgba(0,0,0,0.5)]">
          {/* Ícone */}
          <div className="w-14 h-14 rounded-full bg-[#EDE8F7] flex items-center justify-center mb-5 mx-auto">
            <ShieldCheck size={28} className="text-[#461882]" />
          </div>

          <h1 className="text-lg font-display font-semibold text-[#1A1024] text-center mb-1">
            Define a tua senha
          </h1>
          <p className="text-xs text-[#8B7FA8] text-center font-mono mb-6">
            Olá, <strong className="text-[#461882]">{r.name}</strong> — é o teu primeiro acesso.<br />
            Escolhe uma senha pessoal para continuar.
          </p>

          {erro && erros[erro] && (
            <div className="flex items-center gap-2 px-4 py-3 bg-red-50 border border-red-200 rounded-xl mb-4 text-xs text-red-700 font-medium">
              <Lock size={13} /> {erros[erro]}
            </div>
          )}

          <form action={definirSenhaAction} className="flex flex-col gap-3">
            <div>
              <label className="block text-[11px] font-semibold text-[#4A3D60] uppercase tracking-[0.06em] mb-1.5">
                Nova senha
              </label>
              <div className="relative">
                <Lock size={13} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#8B7FA8]" />
                <input type="password" name="nova" placeholder="mínimo 6 caracteres" required minLength={6}
                       className="w-full pl-9 pr-4 py-2.5 border-2 border-[#D4C8EC] rounded-xl text-sm bg-white
                                  focus:border-[#461882] focus:ring-2 focus:ring-[#461882]/10 outline-none transition-colors" />
              </div>
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-[#4A3D60] uppercase tracking-[0.06em] mb-1.5">
                Confirmar senha
              </label>
              <div className="relative">
                <Lock size={13} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#8B7FA8]" />
                <input type="password" name="confirma" placeholder="repete a senha" required minLength={6}
                       className="w-full pl-9 pr-4 py-2.5 border-2 border-[#D4C8EC] rounded-xl text-sm bg-white
                                  focus:border-[#461882] focus:ring-2 focus:ring-[#461882]/10 outline-none transition-colors" />
              </div>
            </div>

            <button type="submit"
                    className="mt-1 w-full py-3.5 bg-[#461882] text-white rounded-xl font-semibold text-sm
                               hover:bg-[#5A2AA0] transition-colors shadow-[0_4px_16px_rgba(70,24,130,0.4)]">
              Guardar e Entrar →
            </button>
          </form>
        </div>
      </div>
    </div>
  )
}
