'use client'

import { useState, useTransition, useRef } from 'react'
import { createTask } from '@/app/(portal)/tarefas/actions'
import { Plus, Send, X, Loader2, Check } from 'lucide-react'

interface Recipient {
  email: string
  name: string
  initials: string
  color: string
  group: 'admin' | 'equipa'
}

export default function ComposePanel({ recipients }: { recipients: Recipient[] }) {
  const [open, setOpen]       = useState(false)
  const [sent, setSent]       = useState(false)
  const [isPending, startTransition] = useTransition()
  const formRef = useRef<HTMLFormElement>(null)

  const handleSubmit = (formData: FormData) => {
    startTransition(async () => {
      await createTask(formData)
      setSent(true)
      formRef.current?.reset()
      setTimeout(() => { setSent(false); setOpen(false) }, 1400)
    })
  }

  const admins = recipients.filter(r => r.group === 'admin')
  const equipa = recipients.filter(r => r.group === 'equipa')

  return (
    <div className="mb-6">
      {!open ? (
        <button onClick={() => setOpen(true)}
                className="flex items-center gap-2 px-5 py-3 bg-[#461882] text-white rounded-xl text-sm font-semibold
                           hover:bg-[#5A2AA0] transition-colors shadow-[0_4px_16px_rgba(70,24,130,0.25)]">
          <Plus size={16} /> Nova Tarefa
        </button>
      ) : (
        <div className="bg-white border border-sand-light rounded-2xl p-5 shadow-[0_4px_20px_rgba(22,20,18,0.08)]">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-semibold text-ink">Nova Tarefa / Mensagem</h3>
            <button onClick={() => setOpen(false)}
                    className="w-7 h-7 rounded-lg flex items-center justify-center hover:bg-sand/60 transition-colors">
              <X size={14} className="text-ink-mid" />
            </button>
          </div>

          {sent ? (
            <div className="flex items-center gap-2 py-4 text-green-600 font-semibold text-sm justify-center">
              <Check size={18} /> Tarefa enviada com sucesso!
            </div>
          ) : (
            <form ref={formRef} action={handleSubmit} className="flex flex-col gap-3">
              <div>
                <label className="block text-[11px] font-semibold text-ink-mid uppercase tracking-[0.06em] mb-1.5">
                  Para <span className="text-red-500">*</span>
                </label>
                <select name="toEmail" required
                        className="w-full px-3 py-2.5 border border-sand rounded-xl text-sm bg-white
                                   focus:border-[#461882] focus:ring-2 focus:ring-[#461882]/10 outline-none appearance-none">
                  <option value="">Seleccionar pessoa...</option>
                  {admins.length > 0 && (
                    <optgroup label="Direcção">
                      {admins.map(r => <option key={r.email} value={r.email}>{r.name}</option>)}
                    </optgroup>
                  )}
                  {equipa.length > 0 && (
                    <optgroup label="Equipa de Campo">
                      {equipa.map(r => <option key={r.email} value={r.email}>{r.name}</option>)}
                    </optgroup>
                  )}
                </select>
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-ink-mid uppercase tracking-[0.06em] mb-1.5">
                  Tarefa / Mensagem <span className="text-red-500">*</span>
                </label>
                <input name="title" required placeholder="Ex: Carregar fotos da actividade de sábado"
                       className="w-full px-3 py-2.5 border border-sand rounded-xl text-sm bg-white
                                  focus:border-[#461882] focus:ring-2 focus:ring-[#461882]/10 outline-none" />
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-ink-mid uppercase tracking-[0.06em] mb-1.5">
                  Detalhe <span className="text-[11px] font-normal normal-case text-ink-soft">(opcional)</span>
                </label>
                <textarea name="body" rows={2}
                          placeholder="Instruções adicionais, prazo, etc..."
                          className="w-full px-3 py-2.5 border border-sand rounded-xl text-sm bg-white resize-none
                                     focus:border-[#461882] focus:ring-2 focus:ring-[#461882]/10 outline-none" />
              </div>

              <div className="flex gap-2 pt-1">
                <button type="button" onClick={() => setOpen(false)}
                        className="flex-1 py-2.5 border border-sand rounded-xl text-sm text-ink-mid hover:bg-parchment-2 transition-colors">
                  Cancelar
                </button>
                <button type="submit" disabled={isPending}
                        className="flex-[2] py-2.5 bg-[#461882] text-white rounded-xl text-sm font-semibold
                                   hover:bg-[#5A2AA0] transition-colors disabled:opacity-60
                                   flex items-center justify-center gap-2">
                  {isPending ? <Loader2 size={14} className="animate-spin" /> : <Send size={14} />}
                  Enviar Tarefa
                </button>
              </div>
            </form>
          )}
        </div>
      )}
    </div>
  )
}
