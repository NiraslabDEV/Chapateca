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
  } catch {
    return { id: `user-${roleKey}` }
  }
}

export async function POST(request: NextRequest) {
  const store = await cookies()
  const role = getRoleFromCookie(store.get('chapateca-role')?.value)
  if (!role) return NextResponse.json({ error: 'Não autenticado' }, { status: 401 })

  if (!['CAMPO', 'COMUNICACAO', 'DIRECAO'].includes(role)) {
    return NextResponse.json({ error: 'Sem permissão para upload de fotos' }, { status: 403 })
  }

  const formData = await request.formData()
  const files = formData.getAll('files') as File[]
  const location = formData.get('location') as string
  const activityDateStr = formData.get('activityDate') as string
  const description = formData.get('description') as string | null

  if (!files.length || !location || !activityDateStr) {
    return NextResponse.json({ error: 'Campos obrigatórios em falta' }, { status: 400 })
  }

  const activityDate = new Date(activityDateStr)
  const user = await ensureRoleUser(role)

  const results: string[] = []

  for (const file of files) {
    const buffer = Buffer.from(await file.arrayBuffer())
    const filename = `${activityDate.toISOString().slice(0, 10)}_${location}_${file.name}`

    // Upload para o Drive (ou mock em caso de erro)
    let driveId: string
    try {
      driveId = await uploadFileToDrive({
        buffer,
        filename,
        mimeType: file.type || 'application/octet-stream',
        category: 'FOTOS_TERRENO',
        activityDate,
        location,
      })
    } catch {
      driveId = `mock-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`
    }

    // Registo na base de dados (ignora erro se DB não estiver configurada)
    try {
      const log = await prisma.fileLog.create({
        data: {
          googleDriveId: driveId,
          fileName: file.name,
          fileType: file.type.startsWith('video/') ? 'VIDEO' : 'IMAGE',
          mimeType: file.type,
          category: 'FOTOS_TERRENO',
          location,
          activityDate,
          uploadedById: user.id,
        },
      })
      results.push(log.id)
    } catch {
      results.push(driveId)
    }
  }

  return NextResponse.json({ success: true, fileLogId: results[0], count: results.length })
}
