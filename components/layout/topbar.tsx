import Image from 'next/image'
import { Bell } from 'lucide-react'
import RoleBadge from '@/components/ui/role-badge'
import { ROLES, type RoleKey } from '@/lib/roles'

interface TopbarProps {
  role: RoleKey
  crumbs?: string[]
}

export default function Topbar({ role, crumbs = [] }: TopbarProps) {
  const r = ROLES[role]
  return (
    <header className="h-16 bg-forest border-b border-white/8 flex items-center px-6 gap-6 sticky top-0 z-50">
      {/* Brand */}
      <div className="flex items-center">
        <Image src="/logo-chapateca.svg" alt="Chapateca" width={130} height={44} className="object-contain brightness-0 invert" />
      </div>

      {/* Breadcrumb */}
      {crumbs.length > 0 && (
        <nav className="flex items-center gap-2 text-[13px] text-white/60">
          <span>Portal</span>
          {crumbs.map((c, i) => (
            <span key={i} className="flex items-center gap-2">
              <span className="text-white/30">›</span>
              <span className={i === crumbs.length - 1 ? 'text-white font-medium' : ''}>{c}</span>
            </span>
          ))}
        </nav>
      )}

      <div className="ml-auto flex items-center gap-4">
        {/* Notificações */}
        <button className="relative w-9 h-9 rounded-full flex items-center justify-center text-white/80 hover:bg-white/8 transition-colors">
          <Bell size={20} />
          <span className="absolute top-2 right-2 w-4 h-4 bg-red-500 rounded-full text-[9px] font-bold text-white flex items-center justify-center border-2 border-forest">
            3
          </span>
        </button>

        {/* Avatar pill */}
        <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-white/6 border border-white/8 cursor-pointer hover:bg-white/10 transition-colors">
          <div className="w-8 h-8 rounded-full flex items-center justify-center text-[12px] font-bold text-white"
               style={{ background: 'linear-gradient(135deg, #E5B84A, #C8952A)' }}>
            {r.initials}
          </div>
          <span className="text-[13px] text-white font-medium">{r.name.split(' ')[0]}</span>
          <RoleBadge role={role} onDark />
        </div>
      </div>
    </header>
  )
}
