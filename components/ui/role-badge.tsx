import { ROLES, type RoleKey } from '@/lib/roles'
import { cn } from '@/lib/utils'

const badgeStyles: Record<RoleKey, string> = {
  CAMPO:       'bg-[#E8F5EC] text-[#2D7D46]',
  COMUNICACAO: 'bg-[#E3EEF7] text-[#1A5C8A]',
  DAF:         'bg-[#F7ECEC] text-[#8B3A3A]',
  DIRECAO:     'bg-[#EDE8F7] text-[#5A3A8B]',
}

const dotStyles: Record<RoleKey, string> = {
  CAMPO:       'bg-[#2D7D46]',
  COMUNICACAO: 'bg-[#1A5C8A]',
  DAF:         'bg-[#8B3A3A]',
  DIRECAO:     'bg-[#5A3A8B]',
}

export default function RoleBadge({ role, onDark }: { role: RoleKey; onDark?: boolean }) {
  const r = ROLES[role]
  return (
    <span className={cn(
      'inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-semibold whitespace-nowrap',
      onDark ? 'bg-white/10 text-white' : badgeStyles[role]
    )}>
      <span className={cn('w-1.5 h-1.5 rounded-full', onDark ? 'bg-current' : dotStyles[role])} />
      {r.short}
    </span>
  )
}
