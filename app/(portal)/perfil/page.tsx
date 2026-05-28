import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import { getRoleFromCookie, ROLES } from '@/lib/roles'
import { prisma } from '@/lib/prisma'
import ProfileEditor from '@/components/perfil/profile-editor'

export const dynamic = 'force-dynamic'

export default async function PerfilPage() {
  const store = await cookies()
  const roleKey = getRoleFromCookie(store.get('chapateca-role')?.value)
  if (!roleKey) redirect('/')

  const r = ROLES[roleKey]

  let dbUser: {
    image: string | null
    jobTitle: string | null
    phone: string | null
    address: string | null
    bio: string | null
    birthDate: Date | null
    joinedAt: Date | null
    emergencyContact: string | null
  } | null = null

  try {
    dbUser = await prisma.user.findUnique({
      where: { email: r.email },
      select: {
        image: true, jobTitle: true, phone: true, address: true,
        bio: true, birthDate: true, joinedAt: true, emergencyContact: true,
      },
    })
  } catch { /* DB indisponível */ }

  return (
    <div>
      <div className="mb-8">
        <h1 className="font-display text-[34px] text-ink leading-tight">O meu perfil</h1>
        <p className="text-ink-soft text-sm mt-1">Mantém o teu perfil actualizado — ajuda toda a equipa a conhecer-se melhor</p>
      </div>

      <ProfileEditor
        name={r.name}
        email={r.email}
        roleLabel={r.label}
        roleColor={r.color}
        initials={r.initials}
        image={dbUser?.image ?? null}
        jobTitle={dbUser?.jobTitle ?? ''}
        phone={dbUser?.phone ?? ''}
        address={dbUser?.address ?? ''}
        bio={dbUser?.bio ?? ''}
        birthDate={dbUser?.birthDate?.toISOString().slice(0, 10) ?? ''}
        joinedAt={dbUser?.joinedAt?.toISOString().slice(0, 10) ?? ''}
        emergencyContact={dbUser?.emergencyContact ?? ''}
      />
    </div>
  )
}
