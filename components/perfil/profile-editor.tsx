'use client'

import { useState, useRef, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { Camera, Loader2, Check, X, Trash2, Phone, MapPin, Briefcase, Calendar, FileText, Heart } from 'lucide-react'
import { updateOwnProfile } from '@/app/(portal)/perfil/actions'

interface Props {
  name: string
  email: string
  roleLabel: string
  roleColor: string
  initials: string
  image: string | null
  jobTitle: string
  phone: string
  address: string
  bio: string
  birthDate: string
  joinedAt: string
  emergencyContact: string
}

export default function ProfileEditor(props: Props) {
  const router = useRouter()
  const [image, setImage] = useState(props.image)
  const [jobTitle, setJobTitle] = useState(props.jobTitle)
  const [phone, setPhone] = useState(props.phone)
  const [address, setAddress] = useState(props.address)
  const [bio, setBio] = useState(props.bio)
  const [birthDate, setBirthDate] = useState(props.birthDate)
  const [joinedAt, setJoinedAt] = useState(props.joinedAt)
  const [emergencyContact, setEmergencyContact] = useState(props.emergencyContact)

  const [savedFlash, setSavedFlash] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [isPending, startTransition] = useTransition()

  const [uploadingPhoto, setUploadingPhoto] = useState(false)
  const fileRef = useRef<HTMLInputElement>(null)

  const handlePhotoUpload = async (file: File) => {
    setUploadingPhoto(true)
    setError(null)
    try {
      const fd = new FormData()
      fd.append('file', file)
      const res = await fetch('/api/avatar', { method: 'POST', body: fd })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error ?? 'Erro ao carregar foto')
      setImage(data.image)
      router.refresh()
    } catch (e) {
      setError((e as Error).message)
    }
    setUploadingPhoto(false)
  }

  const handlePhotoRemove = async () => {
    setUploadingPhoto(true)
    try {
      await fetch('/api/avatar', { method: 'DELETE' })
      setImage(null)
      router.refresh()
    } catch { /* silently */ }
    setUploadingPhoto(false)
  }

  const handleSave = () => {
    setError(null)
    startTransition(async () => {
      const res = await updateOwnProfile({
        jobTitle, phone, address, bio,
        birthDate: birthDate || null,
        joinedAt: joinedAt || null,
        emergencyContact,
      })
      if (!res.ok) {
        setError(res.error ?? 'Erro a guardar')
        return
      }
      setSavedFlash(true)
      setTimeout(() => setSavedFlash(false), 2500)
      router.refresh()
    })
  }

  return (
    <div className="max-w-3xl flex flex-col gap-5">

      {/* Cartão da foto + nome */}
      <section className="bg-white border border-sand-light rounded-2xl p-6 flex items-center gap-5">
        <div className="relative flex-shrink-0">
          <div className="w-24 h-24 rounded-full overflow-hidden flex items-center justify-center text-2xl font-bold text-white ring-4 ring-white shadow-[0_4px_20px_rgba(22,20,18,0.12)]"
               style={{ background: props.roleColor }}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            {image ? <img src={image} alt={props.name} className="w-full h-full object-cover" /> : props.initials}
          </div>
          <button
            onClick={() => fileRef.current?.click()}
            disabled={uploadingPhoto}
            title="Alterar foto"
            className="absolute -bottom-1 -right-1 w-8 h-8 rounded-full bg-[#461882] hover:bg-[#5A2AA0] text-white flex items-center justify-center shadow-lg transition-colors disabled:opacity-60"
          >
            {uploadingPhoto ? <Loader2 size={14} className="animate-spin" /> : <Camera size={14} />}
          </button>
          <input
            ref={fileRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={e => { const f = e.target.files?.[0]; if (f) handlePhotoUpload(f) }}
          />
        </div>
        <div className="flex-1 min-w-0">
          <h2 className="font-display text-[24px] text-ink leading-tight">{props.name}</h2>
          <p className="text-xs text-ink-soft font-mono mt-0.5">{props.email}</p>
          <p className="text-[12px] text-[#461882] font-medium mt-1">{props.roleLabel}</p>
          {image && (
            <button
              onClick={handlePhotoRemove}
              disabled={uploadingPhoto}
              className="mt-2 text-[11px] text-ink-soft hover:text-red-600 transition-colors inline-flex items-center gap-1"
            >
              <Trash2 size={10} /> Remover foto
            </button>
          )}
        </div>
      </section>

      {error && (
        <div className="px-4 py-3 bg-red-50 border border-red-200 rounded-xl text-sm text-red-700">
          {error}
        </div>
      )}

      {/* Função e contactos */}
      <section className="bg-white border border-sand-light rounded-2xl p-6">
        <div className="flex items-center gap-2 mb-4">
          <Briefcase size={16} className="text-forest" />
          <h3 className="text-sm font-semibold text-ink">Função e contactos</h3>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Field label="Função / Cargo" icon={Briefcase}>
            <input
              value={jobTitle}
              onChange={e => setJobTitle(e.target.value)}
              placeholder="Ex: Coordenadora de Campo, Bibliotecária..."
              className="input"
            />
          </Field>
          <Field label="Telefone" icon={Phone}>
            <input
              value={phone}
              onChange={e => setPhone(e.target.value)}
              placeholder="Ex: 84 149 9012"
              className="input"
            />
          </Field>
          <Field label="Morada" icon={MapPin} className="sm:col-span-2">
            <input
              value={address}
              onChange={e => setAddress(e.target.value)}
              placeholder="Ex: Bairro do Alto-Maé, Maputo"
              className="input"
            />
          </Field>
        </div>
      </section>

      {/* Datas e biografia */}
      <section className="bg-white border border-sand-light rounded-2xl p-6">
        <div className="flex items-center gap-2 mb-4">
          <FileText size={16} className="text-forest" />
          <h3 className="text-sm font-semibold text-ink">Sobre ti</h3>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Field label="Data de nascimento" icon={Calendar}>
            <input type="date" value={birthDate} onChange={e => setBirthDate(e.target.value)} className="input" />
          </Field>
          <Field label="Data de entrada na Chapateca" icon={Calendar}>
            <input type="date" value={joinedAt} onChange={e => setJoinedAt(e.target.value)} className="input" />
          </Field>
          <Field label="Pequena biografia" icon={FileText} className="sm:col-span-2">
            <textarea
              value={bio}
              onChange={e => setBio(e.target.value)}
              rows={3}
              maxLength={500}
              placeholder="Conta um pouco sobre ti — o que fazes na Chapateca, paixões, etc."
              className="input resize-none"
            />
            <p className="text-[10px] text-ink-soft font-mono mt-1">{bio.length}/500</p>
          </Field>
        </div>
      </section>

      {/* Contacto de emergência */}
      <section className="bg-white border border-sand-light rounded-2xl p-6">
        <div className="flex items-center gap-2 mb-4">
          <Heart size={16} className="text-red-500" />
          <h3 className="text-sm font-semibold text-ink">Contacto de emergência</h3>
        </div>
        <Field label="Nome e telefone" icon={Heart}>
          <input
            value={emergencyContact}
            onChange={e => setEmergencyContact(e.target.value)}
            placeholder="Ex: Maria Silva — 84 555 1234 (irmã)"
            className="input"
          />
        </Field>
        <p className="text-[11px] text-ink-soft font-mono mt-2">
          Só a Direcção vê este campo. Usa-se apenas em caso de necessidade.
        </p>
      </section>

      {/* Botão guardar (sticky no fundo em mobile) */}
      <div className="sticky bottom-4 flex items-center justify-end gap-3 bg-white/90 backdrop-blur-md p-3 border border-sand-light rounded-2xl shadow-[0_8px_24px_rgba(22,20,18,0.10)]">
        {savedFlash && (
          <span className="flex items-center gap-1.5 text-green-600 text-sm font-medium">
            <Check size={14} /> Guardado!
          </span>
        )}
        <button
          onClick={handleSave}
          disabled={isPending}
          className="px-6 py-2.5 bg-[#461882] text-white rounded-xl font-semibold text-sm hover:bg-[#5A2AA0] transition-colors disabled:opacity-60 flex items-center gap-2 shadow-[0_4px_16px_rgba(70,24,130,0.3)]"
        >
          {isPending ? <Loader2 size={14} className="animate-spin" /> : <Check size={14} />}
          {isPending ? 'A guardar...' : 'Guardar alterações'}
        </button>
      </div>

      <style jsx>{`
        :global(.input) {
          width: 100%;
          padding: 0.625rem 0.875rem;
          border: 1px solid #D4C8EC;
          border-radius: 0.75rem;
          font-size: 0.875rem;
          background: white;
          outline: none;
          transition: border-color 0.15s, box-shadow 0.15s;
        }
        :global(.input:focus) {
          border-color: #461882;
          box-shadow: 0 0 0 3px rgba(70, 24, 130, 0.1);
        }
      `}</style>
    </div>
  )
}

function Field({ label, icon: Icon, className, children }: {
  label: string
  icon: React.ComponentType<{ size?: number; className?: string }>
  className?: string
  children: React.ReactNode
}) {
  return (
    <div className={className}>
      <label className="flex items-center gap-1.5 text-[11px] font-semibold text-ink-mid uppercase tracking-[0.06em] mb-1.5">
        <Icon size={11} className="text-ink-soft" /> {label}
      </label>
      {children}
    </div>
  )
}
