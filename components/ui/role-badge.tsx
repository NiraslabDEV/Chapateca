import { ROLES, type RoleKey } from '@/lib/roles'
import { cn } from '@/lib/utils'

export default function RoleBadge({ role, onDark }: { role: RoleKey; onDark?: boolean }) {
  const r = ROLES[role]
  const isAdmin = r.group === 'admin'

  const lightStyle = isAdmin
    ? 'bg-[#EDE8F7] text-[#461882]'
    : 'bg-[#FFF0E8] text-[#E8652A]'

  const dotStyle = isAdmin ? 'bg-[#461882]' : 'bg-[#E8652A]'

  return (
    <span className={cn(
      'inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-semibold whitespace-nowrap',
      onDark ? 'bg-white/15 text-white' : lightStyle,
    )}>
      <span className={cn('w-1.5 h-1.5 rounded-full', onDark ? 'bg-current' : dotStyle)} />
      {r.short}
    </span>
  )
}
