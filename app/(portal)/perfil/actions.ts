'use server'

import { cookies } from 'next/headers'
import { revalidatePath } from 'next/cache'
import { getRoleFromCookie, ROLES } from '@/lib/roles'
import { prisma } from '@/lib/prisma'

export type UpdateProfileInput = {
  jobTitle?: string | null
  phone?: string | null
  address?: string | null
  bio?: string | null
  birthDate?: string | null   // YYYY-MM-DD
  joinedAt?: string | null    // YYYY-MM-DD
  emergencyContact?: string | null
}

export async function updateOwnProfile(input: UpdateProfileInput): Promise<{ ok: boolean; error?: string }> {
  const store = await cookies()
  const roleKey = getRoleFromCookie(store.get('chapateca-role')?.value)
  if (!roleKey) return { ok: false, error: 'Não autenticado' }
  const r = ROLES[roleKey]

  try {
    await prisma.user.upsert({
      where: { email: r.email },
      update: {
        jobTitle:         input.jobTitle?.trim() || null,
        phone:            input.phone?.trim() || null,
        address:          input.address?.trim() || null,
        bio:              input.bio?.trim() || null,
        birthDate:        input.birthDate ? new Date(input.birthDate) : null,
        joinedAt:         input.joinedAt ? new Date(input.joinedAt) : null,
        emergencyContact: input.emergencyContact?.trim() || null,
      },
      create: {
        id: `user-${roleKey}`,
        name: r.name,
        email: r.email,
        role: r.dbRole,
        jobTitle:         input.jobTitle?.trim() || null,
        phone:            input.phone?.trim() || null,
        address:          input.address?.trim() || null,
        bio:              input.bio?.trim() || null,
        birthDate:        input.birthDate ? new Date(input.birthDate) : null,
        joinedAt:         input.joinedAt ? new Date(input.joinedAt) : null,
        emergencyContact: input.emergencyContact?.trim() || null,
      },
    })
    revalidatePath('/perfil')
    revalidatePath('/equipa')
    return { ok: true }
  } catch (err) {
    return { ok: false, error: (err as Error).message }
  }
}
