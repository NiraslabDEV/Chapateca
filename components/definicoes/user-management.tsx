'use client'

import { useState, useTransition } from 'react'
import { forcePasswordReset, adminSetPassword, updateUserAccess } from '@/app/(portal)/definicoes/actions'
import { KeyRound, RefreshCw, Check, Loader2, ShieldCheck, ShieldOff } from 'lucide-react'

type Module = 'galeria' | 'manuais' | 'estrategia' | 'financas' | 'direcao' | 'rh' | 'eventos' | 'cocoPro'

const MODULE_LABELS: Record<Module, string> = {
  galeria:    'Galeria',
  manuais:    'Procedimentos',
  estrategia: 'Estratégia Fin.',
  financas:   'Contabilidade',
  direcao:    'Direção',
  rh:         'RH',
  eventos:    'Eventos',
  cocoPro:    'Coco PRO',
}

interface UserRow {
  key: string
  name: string
  initials: string
  color: string
  email: string
  group: 'admin' | 'equipa'
  access: Record<Module, boolean>
  hasPassword: boolean
  mustReset: boolean
}

interface Props {
  users: UserRow[]
}

function Toggle({ checked, onChange, disabled }: { checked: boolean; onChange: (v: boolean) => void; disabled?: boolean }) {
  return (
    <button
      type="button"
      onClick={() => !disabled && onChange(!checked)}
      disabled={disabled}
      className={[
        'relative w-9 h-5 rounded-full transition-colors duration-200 flex-shrink-0',
        checked ? 'bg-forest' : 'bg-sand',
        disabled ? 'opacity-40 cursor-not-allowed' : 'cursor-pointer',
      ].join(' ')}>
      <span className={[
        'absolute top-0.5 left-0.5 w-4 h-4 rounded-full bg-white shadow transition-transform duration-200',
        checked ? 'translate-x-4' : 'translate-x-0',
      ].join(' ')} />
    </button>
  )
}

function PasswordModal({ user, onClose }: { user: UserRow; onClose: () => void }) {
  const [password, setPassword] = useState('')
  const [confirm, setConfirm]   = useState('')
  const [error, setError]       = useState('')
  const [isPending, startTransition] = useTransition()
  const [done, setDone] = useState(false)

  const handleSubmit = () => {
    if (password.length < 6) { setError('Mínimo 6 caracteres'); return }
    if (password !== confirm)  { setError('As senhas não coincidem'); return }
    setError('')
    startTransition(async () => {
      await adminSetPassword(user.email, password)
      setDone(true)
      setTimeout(onClose, 1200)
    })
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
      <div className="bg-white rounded-2xl p-6 w-full max-w-sm shadow-xl">
        <h3 className="font-semibold text-ink mb-1">Definir senha — {user.name}</h3>
        <p className="text-xs text-ink-soft mb-4">A senha será alterada imediatamente.</p>

        {done ? (
          <div className="flex items-center gap-2 text-green-600 font-medium text-sm py-2">
            <Check size={16} /> Senha actualizada!
          </div>
        ) : (
          <>
            {error && <p className="text-xs text-red-600 mb-2">{error}</p>}
            <div className="flex flex-col gap-2 mb-4">
              <input type="password" placeholder="Nova senha" value={password}
                     onChange={e => setPassword(e.target.value)} minLength={6}
                     className="w-full px-3 py-2 border-2 border-sand rounded-xl text-sm outline-none focus:border-forest transition-colors" />
              <input type="password" placeholder="Confirmar senha" value={confirm}
                     onChange={e => setConfirm(e.target.value)}
                     className="w-full px-3 py-2 border-2 border-sand rounded-xl text-sm outline-none focus:border-forest transition-colors" />
            </div>
            <div className="flex gap-2">
              <button onClick={onClose}
                      className="flex-1 py-2 border-2 border-sand rounded-xl text-sm font-medium text-ink-mid hover:border-ink-soft transition-colors">
                Cancelar
              </button>
              <button onClick={handleSubmit} disabled={isPending}
                      className="flex-1 py-2 bg-forest text-white rounded-xl text-sm font-medium hover:bg-forest-mid transition-colors disabled:opacity-60 flex items-center justify-center gap-1">
                {isPending ? <Loader2 size={14} className="animate-spin" /> : <Check size={14} />}
                Guardar
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  )
}

export default function UserManagement({ users }: Props) {
  const [modalUser, setModalUser] = useState<UserRow | null>(null)
  const [pending, startTransition] = useTransition()
  const [feedback, setFeedback] = useState<Record<string, string>>({})
  const [localAccess, setLocalAccess] = useState<Record<string, Record<Module, boolean>>>(
    Object.fromEntries(users.map(u => [u.email, u.access]))
  )

  const showFeedback = (email: string, msg: string) => {
    setFeedback(f => ({ ...f, [email]: msg }))
    setTimeout(() => setFeedback(f => { const n = { ...f }; delete n[email]; return n }), 2500)
  }

  const handleForceReset = (user: UserRow) => {
    startTransition(async () => {
      await forcePasswordReset(user.email)
      showFeedback(user.email, 'Redefinição forçada ✓')
    })
  }

  const handleAccessToggle = (user: UserRow, mod: Module, value: boolean) => {
    setLocalAccess(prev => ({ ...prev, [user.email]: { ...prev[user.email], [mod]: value } }))
    startTransition(async () => {
      await updateUserAccess(user.email, mod, value)
    })
  }

  const admins  = users.filter(u => u.group === 'admin')
  const equipa  = users.filter(u => u.group === 'equipa')

  const renderSection = (title: string, list: UserRow[]) => (
    <div className="mb-6">
      <p className="text-[11px] font-bold text-ink-soft uppercase tracking-[0.1em] mb-3">{title}</p>
      <div className="flex flex-col gap-3">
        {list.map(user => (
          <div key={user.email} className="bg-white border border-sand-light rounded-2xl p-4">
            <div className="flex items-center gap-3 mb-3">
              {/* Avatar */}
              <div className="w-9 h-9 rounded-full flex items-center justify-center text-xs font-bold text-white flex-shrink-0"
                   style={{ background: user.color }}>
                {user.initials}
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-sm font-semibold text-ink">{user.name}</div>
                <div className="text-[11px] text-ink-soft font-mono">{user.email}</div>
              </div>
              {/* Senha status */}
              <div className="flex items-center gap-1.5 text-[11px] font-mono flex-shrink-0">
                {user.mustReset
                  ? <span className="text-amber-600 flex items-center gap-1"><RefreshCw size={10} /> Deve redefinir</span>
                  : user.hasPassword
                    ? <span className="text-green-600 flex items-center gap-1"><ShieldCheck size={10} /> Senha própria</span>
                    : <span className="text-ink-soft flex items-center gap-1"><ShieldOff size={10} /> Senha padrão</span>
                }
              </div>
            </div>

            {/* Acessos — só mostra para equipa (admins têm sempre tudo) */}
            {user.group === 'equipa' && (
              <div className="flex flex-wrap gap-x-5 gap-y-2 mb-3 pl-12">
                {(Object.entries(MODULE_LABELS) as [Module, string][]).map(([mod, label]) => (
                  <label key={mod} className="flex items-center gap-2 cursor-pointer">
                    <Toggle
                      checked={localAccess[user.email]?.[mod] ?? user.access[mod]}
                      onChange={v => handleAccessToggle(user, mod, v)}
                      disabled={pending}
                    />
                    <span className="text-[12px] text-ink-mid">{label}</span>
                  </label>
                ))}
              </div>
            )}

            {/* Acções */}
            <div className="flex items-center gap-2 pl-12">
              {feedback[user.email] ? (
                <span className="text-[11px] text-green-600 font-medium flex items-center gap-1">
                  <Check size={11} /> {feedback[user.email]}
                </span>
              ) : (
                <>
                  <button
                    onClick={() => handleForceReset(user)}
                    disabled={pending}
                    className="flex items-center gap-1.5 px-3 py-1.5 border border-amber-300 bg-amber-50 rounded-lg text-[11px] font-medium text-amber-700 hover:bg-amber-100 transition-colors disabled:opacity-50">
                    <RefreshCw size={11} /> Forçar nova senha
                  </button>
                  <button
                    onClick={() => setModalUser(user)}
                    className="flex items-center gap-1.5 px-3 py-1.5 border border-sand rounded-lg text-[11px] font-medium text-ink-mid hover:border-forest hover:text-forest transition-colors">
                    <KeyRound size={11} /> Definir senha
                  </button>
                </>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  )

  return (
    <>
      {renderSection('Direcção', admins)}
      {renderSection('Equipa de Campo', equipa)}
      {modalUser && <PasswordModal user={modalUser} onClose={() => setModalUser(null)} />}
    </>
  )
}
