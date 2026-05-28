import { ROLES, type RoleKey } from '@/lib/roles'
import Image from 'next/image'
import LoginShell, { type LoginRole } from '@/components/login/login-shell'
import { BookOpen } from 'lucide-react'

function toLoginRole(r: typeof ROLES[RoleKey]): LoginRole {
  return {
    key: r.key,
    name: r.name,
    initials: r.initials,
    color: r.color,
    group: r.group,
    label: r.label,
  }
}

const adminRoles  = (Object.values(ROLES) as typeof ROLES[RoleKey][])
  .filter(r => r.group === 'admin')
  .map(toLoginRole)

const equipaRoles = (Object.values(ROLES) as typeof ROLES[RoleKey][])
  .filter(r => r.group === 'equipa')
  .map(toLoginRole)

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ erro?: string; u?: string }>
}) {
  const { erro, u } = await searchParams
  const initialError = erro === 'senha' || erro === 'perfil' ? erro : null

  return (
    <div className="min-h-screen flex items-center justify-center p-4 relative overflow-hidden"
         style={{ background: 'linear-gradient(135deg, #1A0836 0%, #461882 60%, #6B2D10 100%)' }}>
      <div className="absolute inset-0 opacity-[0.06] pointer-events-none"
           style={{ backgroundImage: 'radial-gradient(circle, #fff 1px, transparent 1px)', backgroundSize: '24px 24px' }} />

      <div className="w-full max-w-[460px] animate-card-in relative z-10">
        <div className="flex flex-col items-center gap-3 mb-8">
          <div className="w-20 h-20 rounded-full overflow-hidden bg-white/5 ring-2 ring-white/15 shadow-[0_8px_32px_rgba(0,0,0,0.35)]">
            <Image
              src="/logo-chapateca-icone.png"
              alt="Chapateca"
              width={80}
              height={80}
              className="w-full h-full object-cover"
              priority
            />
          </div>
          <p className="text-sm text-white/50 font-mono tracking-wide">Portal Interno · Maputo</p>
        </div>

        <LoginShell
          admins={adminRoles}
          equipa={equipaRoles}
          initialError={initialError}
          initialErrorKey={u ?? null}
        />

        {/* Acesso discreto ao manual */}
        <div className="flex justify-center mt-6">
          <a
            href="/manual.html"
            target="_blank"
            rel="noopener noreferrer"
            title="Manual do Portal"
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[10px] font-mono
                       text-white/25 hover:text-white/80 hover:bg-white/5
                       transition-all duration-300 select-none"
          >
            <BookOpen size={11} />
            <span className="tracking-wider uppercase">Manual</span>
          </a>
        </div>

        {/* Credit */}
        <div className="flex flex-col items-center gap-0.5 mt-4">
          <p className="text-[10px] text-white/30 font-mono tracking-wide">Desenvolvido por</p>
          <p className="text-[12px] text-white/55 font-semibold tracking-[0.08em]">
            🐸 <span className="text-white/75">LeapFrog</span>
            <span className="text-white/35 mx-1.5">·</span>
            <span className="text-white/50">Saltos Tecnológicos</span>
          </p>
          <p className="text-[9px] text-white/25 font-mono uppercase tracking-[0.12em] mt-0.5">
            Desenvolvimento de Softwares
          </p>
        </div>
      </div>
    </div>
  )
}
