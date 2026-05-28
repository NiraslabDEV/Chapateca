'use server'
import { cookies } from 'next/headers'
import { revalidatePath } from 'next/cache'
import { getRoleFromCookie, ROLES } from '@/lib/roles'
import { prisma } from '@/lib/prisma'
import { deleteFileFromDrive } from '@/lib/google-drive'
import { randomBytes } from 'crypto'

/** Liga/desliga visibilidade pública do álbum na página /projetos. */
export async function toggleAlbumPublicAction(albumId: string, isPublic: boolean): Promise<{ ok: boolean; error?: string }> {
  const store = await cookies()
  const roleKey = getRoleFromCookie(store.get('chapateca-role')?.value)
  if (!roleKey) return { ok: false, error: 'Não autenticado' }
  try {
    await prisma.album.update({ where: { id: albumId }, data: { isPublic } })
    revalidatePath('/galeria')
    revalidatePath('/projetos')
    revalidatePath(`/projetos/${albumId}`)
    return { ok: true }
  } catch (err) {
    return { ok: false, error: (err as Error).message }
  }
}

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

export type DeleteResult = { ok: boolean; error?: string; driveErrors?: number }

/** Apaga álbum inteiro + todas as fotos associadas (DB + Drive). Apenas admins. */
export async function deleteAlbumAction(albumId: string): Promise<DeleteResult> {
  const store = await cookies()
  const roleKey = getRoleFromCookie(store.get('chapateca-role')?.value)
  if (!roleKey) return { ok: false, error: 'Não autenticado' }

  const actor = ROLES[roleKey]
  if (actor.group !== 'admin') return { ok: false, error: 'Apenas a Direcção pode apagar álbuns' }

  try {
    const album = await prisma.album.findUnique({
      where: { id: albumId },
      include: { photos: { select: { id: true, googleDriveId: true } } },
    })
    if (!album) return { ok: false, error: 'Álbum não encontrado' }

    const photoCount = album.photos.length
    const label = album.activityName || `Actividade · ${album.location}`

    // 1. Apagar DB primeiro (assim deixa de aparecer no portal imediatamente)
    await prisma.fileLog.deleteMany({ where: { albumId } })
    await prisma.album.delete({ where: { id: albumId } })

    // 2. Apagar do Drive depois (cleanup, não bloqueia se falhar)
    let driveErrors = 0
    for (const photo of album.photos) {
      const res = await deleteFileFromDrive(photo.googleDriveId)
      if (!res.ok) driveErrors++
    }

    // 3. Audit log
    await prisma.activityLog.create({
      data: {
        actorEmail:  actor.email,
        actorName:   actor.name,
        action:      'album.delete',
        description: `apagou álbum "${label}"${photoCount ? ` (${photoCount} foto${photoCount !== 1 ? 's' : ''})` : ''}`,
      },
    }).catch(() => { /* sem audit é melhor do que falhar */ })

    revalidatePath('/galeria')
    revalidatePath('/dashboard')
    return { ok: true, driveErrors }
  } catch (err) {
    console.error('[deleteAlbum] erro:', err)
    return { ok: false, error: (err as Error).message }
  }
}

/** Apaga uma única foto (FileLog + Drive). Se for a última do álbum, mantém o álbum vazio — não auto-apaga. */
export async function deletePhotoAction(fileLogId: string): Promise<DeleteResult> {
  const store = await cookies()
  const roleKey = getRoleFromCookie(store.get('chapateca-role')?.value)
  if (!roleKey) return { ok: false, error: 'Não autenticado' }

  const actor = ROLES[roleKey]
  if (actor.group !== 'admin') return { ok: false, error: 'Apenas a Direcção pode apagar fotos' }

  try {
    const photo = await prisma.fileLog.findUnique({
      where: { id: fileLogId },
      include: { album: { select: { location: true, activityName: true } } },
    })
    if (!photo) return { ok: false, error: 'Foto não encontrada' }

    await prisma.fileLog.delete({ where: { id: fileLogId } })

    const driveRes = await deleteFileFromDrive(photo.googleDriveId)

    const context = photo.album
      ? ` do álbum "${photo.album.activityName || `Actividade · ${photo.album.location}`}"`
      : photo.category === 'MARKETING' ? ' de Marketing' : ''

    await prisma.activityLog.create({
      data: {
        actorEmail:  actor.email,
        actorName:   actor.name,
        action:      photo.category === 'MARKETING' ? 'marketing.delete' : 'photo.delete',
        description: `apagou ${photo.category === 'MARKETING' ? 'activo' : 'foto'} "${photo.fileName}"${context}`,
      },
    }).catch(() => {})

    revalidatePath('/galeria')
    revalidatePath('/dashboard')
    return { ok: true, driveErrors: driveRes.ok ? 0 : 1 }
  } catch (err) {
    console.error('[deletePhoto] erro:', err)
    return { ok: false, error: (err as Error).message }
  }
}
