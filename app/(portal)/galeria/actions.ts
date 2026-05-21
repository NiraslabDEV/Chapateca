'use server'
import { cookies } from 'next/headers'
import { getRoleFromCookie } from '@/lib/roles'
import { prisma } from '@/lib/prisma'
import { randomBytes } from 'crypto'

export async function generateShareToken(albumId: string): Promise<string | null> {
  const store = await cookies()
  const roleKey = getRoleFromCookie(store.get('chapateca-role')?.value)
  if (!roleKey) return null
  try {
    const existing = await prisma.album.findUnique({
      where: { id: albumId },
      select: { shareToken: true },
    })
    if (existing?.shareToken) return existing.shareToken
    const token = randomBytes(6).toString('hex')
    await prisma.album.update({ where: { id: albumId }, data: { shareToken: token } })
    return token
  } catch { return null }
}
