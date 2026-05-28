import { cookies } from 'next/headers'
import { redirect, notFound } from 'next/navigation'
import Link from 'next/link'
import { getRoleFromCookie, ROLES, type RoleKey } from '@/lib/roles'
import { prisma } from '@/lib/prisma'
import { getEffectiveAccess } from '@/lib/effective-access'
import { MODULOS } from '@/lib/modulos'
import { ArrowLeft, Briefcase, Phone, MapPin, Calendar, FileText, Heart, Shield, Mail, CheckCircle2 } from 'lucide-react'

export const dynamic = 'force-dynamic'

export default async function FuncionarioPage({ params }: { params: Promise<{ key: string }> }) {
  const store = await cookies()
  const roleKey = getRoleFromCookie(store.get('chapateca-role')?.value)
  if (!roleKey) redirect('/')

  const me = ROLES[roleKey]
  if (me.group !== 'admin') redirect('/acesso-negado')

  const { key } = await params
  if (!(key in ROLES)) notFound()
  const target = ROLES[key as RoleKey]

  let dbUser: {
    image: string | null
    jobTitle: string | null
    phone: string | null
    address: string | null
    bio: string | null
    birthDate: Date | null
    joinedAt: Date | null
    emergencyContact: string | null
    passwordHash: string | null
    mustResetPassword: boolean
  } | null = null

  try {
    dbUser = await prisma.user.findUnique({
      where: { email: target.email },
      select: {
        image: true, jobTitle: true, phone: true, address: true,
        bio: true, birthDate: true, joinedAt: true, emergencyContact: true,
        passwordHash: true, mustResetPassword: true,
      },
    })
  } catch { /* DB indisponível */ }

  const access = await getEffectiveAccess(key as RoleKey)
  const formatDate = (d: Date | null) => d
    ? d.toLocaleDateString('pt-MZ', { day: 'numeric', month: 'long', year: 'numeric' })
    : null

  // Stats simples — quantos uploads, álbuns, tarefas
  let uploadCount = 0
  let albumCount = 0
  let tasksReceived = 0
  let tasksDone = 0
  try {
    ;[uploadCount, albumCount, tasksReceived, tasksDone] = await Promise.all([
      prisma.fileLog.count({ where: { uploadedBy: { email: target.email } } }),
      prisma.album.count({ where: { uploadedBy: { email: target.email } } }),
      prisma.task.count({ where: { toEmail: target.email } }),
      prisma.task.count({ where: { toEmail: target.email, status: 'done' } }),
    ])
  } catch { /* DB indisponível */ }

  return (
    <div>
      <Link href="/equipa"
            className="inline-flex items-center gap-1.5 text-sm text-forest font-medium mb-6 hover:text-forest-mid transition-colors">
        <ArrowLeft size={16} /> Voltar à Equipa
      </Link>

      <div className="max-w-3xl flex flex-col gap-5">

        {/* Header card */}
        <section className="bg-white border border-sand-light rounded-2xl p-6">
          <div className="flex flex-col sm:flex-row items-center sm:items-start gap-5">
            <div className="w-24 h-24 rounded-full overflow-hidden flex items-center justify-center text-2xl font-bold text-white flex-shrink-0 ring-4 ring-white shadow-[0_4px_20px_rgba(22,20,18,0.12)]"
                 style={{ background: target.color }}>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              {dbUser?.image ? <img src={dbUser.image} alt={target.name} className="w-full h-full object-cover" /> : target.initials}
            </div>

            <div className="flex-1 min-w-0 text-center sm:text-left">
              <h1 className="font-display text-[28px] text-ink leading-tight">{target.name}</h1>
              <p className="text-sm text-ink-mid mt-0.5 flex items-center gap-1.5 justify-center sm:justify-start">
                <Briefcase size={13} className="text-ink-soft" />
                {dbUser?.jobTitle || <span className="italic text-ink-soft">Função por definir</span>}
              </p>
              <div className="text-[12px] text-ink-soft font-mono mt-1 flex items-center gap-1.5 justify-center sm:justify-start">
                <Mail size={11} /> {target.email}
              </div>
              <div className="mt-3 inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-semibold"
                   style={{ background: target.bg, color: target.color }}>
                {target.label}
              </div>
            </div>
          </div>

          {dbUser?.bio && (
            <p className="text-sm text-ink-mid leading-relaxed mt-5 pt-5 border-t border-sand-light italic">
              &ldquo;{dbUser.bio}&rdquo;
            </p>
          )}
        </section>

        {/* Stats */}
        <section className="grid grid-cols-4 gap-3">
          <Stat label="Álbuns" value={albumCount} />
          <Stat label="Uploads" value={uploadCount} />
          <Stat label="Tarefas Rx" value={tasksReceived} />
          <Stat label="Concluídas" value={tasksDone} />
        </section>

        {/* Contactos & dados pessoais */}
        <section className="bg-white border border-sand-light rounded-2xl p-6">
          <h3 className="text-sm font-semibold text-ink mb-4 flex items-center gap-2">
            <Phone size={14} className="text-forest" /> Contactos e dados pessoais
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-3">
            <InfoRow icon={Phone}    label="Telefone" value={dbUser?.phone} />
            <InfoRow icon={MapPin}   label="Morada" value={dbUser?.address} />
            <InfoRow icon={Calendar} label="Data de nascimento" value={formatDate(dbUser?.birthDate ?? null)} />
            <InfoRow icon={Calendar} label="Entrou na Chapateca" value={formatDate(dbUser?.joinedAt ?? null)} />
            <InfoRow icon={Heart}    label="Contacto de emergência" value={dbUser?.emergencyContact} fullWidth />
          </div>
        </section>

        {/* Permissões */}
        <section className="bg-white border border-sand-light rounded-2xl p-6">
          <h3 className="text-sm font-semibold text-ink mb-4 flex items-center gap-2">
            <Shield size={14} className="text-forest" /> Acessos aos módulos
          </h3>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
            {MODULOS.map(m => {
              const allowed = access[m.key]
              return (
                <div key={m.key}
                     className={`flex items-center gap-2 px-3 py-2 rounded-xl text-[12px] font-medium ${allowed ? 'bg-forest/8 text-forest' : 'bg-sand-light text-ink-soft'}`}>
                  <span className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${allowed ? 'bg-forest' : 'bg-sand'}`} />
                  {m.short}
                </div>
              )
            })}
          </div>
        </section>

        {/* Estado da conta */}
        <section className="bg-white border border-sand-light rounded-2xl p-6">
          <h3 className="text-sm font-semibold text-ink mb-4 flex items-center gap-2">
            <FileText size={14} className="text-forest" /> Estado da conta
          </h3>
          <div className="flex flex-col gap-2 text-[13px]">
            <div className="flex items-center gap-2 text-ink-mid">
              <CheckCircle2 size={13} className={dbUser?.passwordHash ? 'text-green-600' : 'text-sand'} />
              {dbUser?.passwordHash ? 'Senha pessoal definida' : 'Ainda usa senha padrão (1234)'}
            </div>
            {dbUser?.mustResetPassword && (
              <div className="flex items-center gap-2 text-amber-700">
                <CheckCircle2 size={13} className="text-amber-500" />
                Tem de redefinir a senha no próximo login
              </div>
            )}
          </div>
        </section>

      </div>
    </div>
  )
}

function Stat({ label, value }: { label: string; value: number }) {
  return (
    <div className="bg-white border border-sand-light rounded-2xl p-3 text-center">
      <div className="font-display text-[26px] text-ink leading-tight">{value}</div>
      <div className="text-[10px] text-ink-soft font-mono uppercase tracking-wider mt-0.5">{label}</div>
    </div>
  )
}

function InfoRow({ icon: Icon, label, value, fullWidth }: {
  icon: React.ComponentType<{ size?: number; className?: string }>
  label: string
  value: string | null | undefined
  fullWidth?: boolean
}) {
  return (
    <div className={fullWidth ? 'sm:col-span-2' : ''}>
      <div className="text-[10px] font-bold text-ink-soft uppercase tracking-[0.08em] mb-0.5 flex items-center gap-1.5">
        <Icon size={10} /> {label}
      </div>
      <div className={`text-[13px] ${value ? 'text-ink' : 'text-ink-soft italic'}`}>
        {value || 'Por preencher'}
      </div>
    </div>
  )
}
