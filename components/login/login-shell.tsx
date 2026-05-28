'use client'

import { useState, useTransition, useRef, useEffect } from 'react'
import { Lock, X, Loader2, ArrowRight } from 'lucide-react'
import RoleBadge from '@/components/ui/role-badge'
import { loginAction } from '@/lib/login-action'
import type { RoleKey } from '@/lib/roles'

export type LoginRole = {
  key: string
  name: string
  initials: string
  color: string
  group: 'admin' | 'equipa'
  label: string
}

interface Props {
  admins: LoginRole[]
  equipa: LoginRole[]
  initialError?: 'senha' | 'perfil' | null
  initialErrorKey?: string | null
}

export default function LoginShell({ admins, equipa, initialError, initialErrorKey }: Props) {
  // Se voltámos do servidor com erro de senha, abrimos o modal automaticamente
  const initialSelected: LoginRole | null =
    initialError === 'senha' && initialErrorKey
      ? [...admins, ...equipa].find(r => r.key === initialErrorKey) ?? null
      : null

  const [selected, setSelected] = useState<LoginRole | null>(initialSelected)
  const [password, setPassword] = useState('')
  const [showError, setShowError] = useState(initialError === 'senha')
  const [isPending, startTransition] = useTransition()
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (selected) {
      // dá um pequeno delay para a animação acabar antes de focar
      const t = setTimeout(() => inputRef.current?.focus(), 80)
      return () => clearTimeout(t)
    }
  }, [selected])

  const closeModal = () => {
    if (isPending) return
    setSelected(null)
    setPassword('')
    setShowError(false)
  }

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    if (!selected || !password.trim() || isPending) return
    setShowError(false)
    const fd = new FormData()
    fd.append('role', selected.key)
    fd.append('password', password)
    startTransition(async () => {
      // loginAction faz redirect — esta promise nunca resolve em sucesso
      await loginAction(fd)
    })
  }

  return (
    <>
      <div className="bg-white rounded-2xl p-6 shadow-[0_32px_80px_rgba(0,0,0,0.5)]">
        <h2 className="text-sm font-semibold text-[#1A1024] mb-0.5">Bem-vindo de volta</h2>
        <p className="text-xs text-[#8B7FA8] mb-4 font-mono">Clica no teu nome para entrar:</p>

        {/* Direcção */}
        <div className="mb-4">
          <p className="text-[10px] font-bold text-[#8B7FA8] uppercase tracking-[0.1em] mb-2 px-1">Direcção</p>
          <div className="flex flex-col gap-2">
            {admins.map(r => (
              <button
                key={r.key}
                type="button"
                onClick={() => setSelected(r)}
                className="flex items-center gap-3 p-2.5 rounded-xl border-2 border-[#D4C8EC] cursor-pointer
                           hover:border-[#461882] hover:bg-[#EDE8F7]/50 hover:-translate-y-px hover:shadow-md
                           transition-all text-left"
              >
                <div className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold text-white flex-shrink-0"
                     style={{ background: r.color }}>
                  {r.initials}
                </div>
                <span className="flex-1 text-sm font-semibold text-[#1A1024]">{r.name}</span>
                <RoleBadge role={r.key as RoleKey} />
              </button>
            ))}
          </div>
        </div>

        {/* Equipa */}
        <div>
          <p className="text-[10px] font-bold text-[#8B7FA8] uppercase tracking-[0.1em] mb-2 px-1">Equipa de Campo</p>
          <div className="grid grid-cols-2 gap-2">
            {equipa.map(r => (
              <button
                key={r.key}
                type="button"
                onClick={() => setSelected(r)}
                className="flex items-center gap-2 p-2.5 rounded-xl border-2 border-[#D4C8EC] cursor-pointer
                           hover:border-[#E8652A] hover:bg-[#FFF0E8]/50 hover:-translate-y-px hover:shadow-md
                           transition-all text-left"
              >
                <div className="w-7 h-7 rounded-full flex items-center justify-center text-[11px] font-bold text-white flex-shrink-0"
                     style={{ background: r.color }}>
                  {r.initials}
                </div>
                <span className="text-[13px] font-semibold text-[#1A1024] truncate">{r.name}</span>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Modal de senha */}
      {selected && (
        <div
          className="fixed inset-0 z-[200] flex items-center justify-center p-4"
          style={{ background: 'rgba(10,6,22,0.78)', backdropFilter: 'blur(6px)' }}
          onClick={closeModal}
        >
          <div
            className="bg-white rounded-2xl shadow-[0_32px_80px_rgba(0,0,0,0.6)] w-full max-w-sm animate-card-in overflow-hidden"
            onClick={e => e.stopPropagation()}
          >
            {/* Header */}
            <div
              className="px-6 py-5 flex items-center gap-3 relative"
              style={{
                background:
                  selected.group === 'admin'
                    ? 'linear-gradient(135deg, #1A0836 0%, #461882 100%)'
                    : 'linear-gradient(135deg, #6B2D10 0%, #E8652A 100%)',
              }}
            >
              <div
                className="w-14 h-14 rounded-full flex items-center justify-center text-lg font-bold text-white flex-shrink-0 ring-4 ring-white/15"
                style={{ background: selected.color }}
              >
                {selected.initials}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-white text-[16px] font-semibold leading-tight">{selected.name}</p>
                <p className="text-white/70 text-[11px] font-mono mt-0.5">{selected.label}</p>
              </div>
              <button
                onClick={closeModal}
                disabled={isPending}
                className="w-8 h-8 rounded-lg flex items-center justify-center text-white/70 hover:bg-white/15 hover:text-white transition-colors flex-shrink-0 disabled:opacity-50"
              >
                <X size={16} />
              </button>
            </div>

            {/* Body */}
            <form onSubmit={handleSubmit} className="px-6 py-5 flex flex-col gap-4">
              {showError && (
                <div className="flex items-center gap-2 px-3 py-2.5 bg-red-50 border border-red-200 rounded-xl text-xs text-red-700 font-medium">
                  <Lock size={13} /> Senha incorrecta. Tenta novamente.
                </div>
              )}

              <div>
                <label className="block text-[11px] font-semibold text-[#4A3D60] uppercase tracking-[0.06em] mb-1.5">
                  Senha
                </label>
                <div className="relative">
                  <Lock size={13} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#8B7FA8]" />
                  <input
                    ref={inputRef}
                    type="password"
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    placeholder="••••"
                    autoComplete="current-password"
                    className="w-full pl-9 pr-4 py-3 border-2 border-[#D4C8EC] rounded-xl text-sm bg-white
                               focus:border-[#461882] focus:ring-2 focus:ring-[#461882]/10 outline-none transition-colors"
                    disabled={isPending}
                  />
                </div>
                <a
                  href={`/esqueci-senha?u=${selected.key}`}
                  className="block text-right text-[11px] text-[#8B7FA8] hover:text-[#461882] mt-1.5 transition-colors"
                >
                  Esqueci a senha →
                </a>
              </div>

              <button
                type="submit"
                disabled={!password.trim() || isPending}
                className="w-full py-3.5 bg-[#461882] text-white rounded-xl font-semibold text-sm
                           hover:bg-[#5A2AA0] transition-colors shadow-[0_4px_16px_rgba(70,24,130,0.4)]
                           disabled:opacity-50 disabled:cursor-not-allowed
                           flex items-center justify-center gap-2"
              >
                {isPending ? (
                  <>
                    <Loader2 size={15} className="animate-spin" /> A entrar...
                  </>
                ) : (
                  <>
                    Entrar como {selected.name.split(' ')[0]} <ArrowRight size={15} />
                  </>
                )}
              </button>
            </form>
          </div>
        </div>
      )}
    </>
  )
}
