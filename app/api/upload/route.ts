import { NextRequest, NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { getRoleFromCookie, ROLES } from '@/lib/roles'
import { uploadFileToDrive } from '@/lib/google-drive'
import { prisma } from '@/lib/prisma'

async function ensureRoleUser(roleKey: string) {
  const r = ROLES[roleKey as keyof typeof ROLES]
  if (!r) return { id: `user-${roleKey}` }
  try {
    return await prisma.user.upsert({
      where: { email: r.email },
      update: { name: r.name },
      create: { id: `user-${roleKey}`, name: r.name, email: r.email, role: r.dbRole },
    })
  } catch (err) {
    console.error('[Upload] ensureRoleUser falhou:', (err as Error).message)
    return { id: `user-${roleKey}` }
  }
}

export async function POST(request: NextRequest) {
  const store = await cookies()
  const role = getRoleFromCookie(store.get('chapateca-role')?.value)
  if (!role) return NextResponse.json({ error: 'Não autenticado' }, { status: 401 })

  // A galeria está acessível a todos os utilizadores activos (todos têm access.galeria=true por defeito).
  // O check feito aqui é apenas garantir que o role existe em ROLES — getRoleFromCookie já garante isso.
  const userConfig = ROLES[role]
  if (!userConfig.access.galeria) {
    return NextResponse.json({ error: 'Sem permissão para upload de fotos' }, { status: 403 })
  }

  const formData = await request.formData()
  const files = formData.getAll('files') as File[]
  const uploadCategory = (formData.get('category') as string | null) ?? 'FOTOS_TERRENO'
  const isMarketing = uploadCategory === 'MARKETING'

  // ── Marketing upload (sem Album, sem localização obrigatória) ──────────
  if (isMarketing) {
    const tag = (formData.get('tag') as string | null)?.trim() || 'outro'
    const assetTitle = (formData.get('assetTitle') as string | null)?.trim() || null
    if (!files.length) return NextResponse.json({ error: 'Nenhum ficheiro seleccionado' }, { status: 400 })

    const user = await ensureRoleUser(role)
    const now = new Date()
    const results: string[] = []

    for (const file of files) {
      const buffer = Buffer.from(await file.arrayBuffer())
      const filename = `marketing_${tag}_${file.name}`
      let driveId: string
      try {
        driveId = await uploadFileToDrive({
          buffer, filename,
          mimeType: file.type || 'image/jpeg',
          category: 'MARKETING',
          activityDate: now,
        })
      } catch (err) {
        console.error('[Upload Marketing] Drive falhou:', (err as Error).message)
        driveId = `mock-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`
      }
      try {
        const log = await prisma.fileLog.create({
          data: {
            googleDriveId: driveId,
            fileName: file.name,
            activityName: assetTitle || file.name.replace(/\.[^.]+$/, ''),
            fileType: file.type.startsWith('video/') ? 'VIDEO' : 'IMAGE',
            mimeType: file.type,
            category: 'MARKETING',
            location: tag,
            activityDate: now,
            uploadedById: user.id,
          },
        })
        results.push(log.id)
      } catch (err) {
        console.error('[Upload Marketing] FileLog falhou:', (err as Error).message)
        results.push(driveId)
      }
    }
    return NextResponse.json({ success: true, count: results.length })
  }

  // ── Upload de terreno (comportamento original) ─────────────────────────
  const location = formData.get('location') as string
  const activityDateStr = formData.get('activityDate') as string
  const activityName = (formData.get('activityName') as string | null)?.trim() || null
  const activityType = (formData.get('activityType') as string | null)?.trim() || null
  const participantsRaw = formData.get('participants') as string | null
  const participantsNum = participantsRaw ? parseInt(participantsRaw, 10) || null : null
  const observations = (formData.get('observations') as string | null)?.trim() || null

  if (!files.length || !location || !activityDateStr) {
    return NextResponse.json({ error: 'Campos obrigatórios em falta' }, { status: 400 })
  }

  const activityDate = new Date(activityDateStr)
  const user = await ensureRoleUser(role)

  let albumId: string | null = null
  let albumError: string | null = null
  try {
    const album = await prisma.album.create({
      data: {
        activityName: activityName || null,
        location,
        activityDate,
        activityType: activityType || null,
        participants: participantsNum || null,
        observations: observations || null,
        uploadedById: user.id,
      },
    })
    albumId = album.id
  } catch (err) {
    albumError = (err as Error).message
    console.error('[Upload] Falhou criar Album:', albumError)
  }

  const results: string[] = []

  for (const file of files) {
    const buffer = Buffer.from(await file.arrayBuffer())
    const filename = `${activityDate.toISOString().slice(0, 10)}_${location}_${file.name}`
    let driveId: string
    try {
      driveId = await uploadFileToDrive({
        buffer, filename,
        mimeType: file.type || 'application/octet-stream',
        category: 'FOTOS_TERRENO',
        activityDate,
        location,
      })
    } catch (err) {
      console.error('[Upload Terreno] Drive falhou:', (err as Error).message)
      driveId = `mock-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`
    }
    try {
      const log = await prisma.fileLog.create({
        data: {
          googleDriveId: driveId,
          fileName: file.name,
          activityName,
          fileType: file.type.startsWith('video/') ? 'VIDEO' : 'IMAGE',
          mimeType: file.type,
          category: 'FOTOS_TERRENO',
          location,
          activityDate,
          uploadedById: user.id,
          ...(albumId ? { albumId } : {}),
        },
      })
      results.push(log.id)
    } catch (err) {
      console.error('[Upload] Falhou criar FileLog:', (err as Error).message)
      results.push(driveId)
    }
  }

  return NextResponse.json({ success: true, albumId, count: results.length, albumError })
}
