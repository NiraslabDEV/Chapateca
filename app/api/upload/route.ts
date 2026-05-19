import { NextRequest, NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { getRoleFromCookie } from '@/lib/roles'
import { uploadFileToDrive } from '@/lib/google-drive'
import { prisma } from '@/lib/prisma'

// Utilizador de demo enquanto não há auth real
const DEMO_USER_ID = 'demo-user'

async function ensureDemoUser() {
  try {
    return await prisma.user.upsert({
      where: { email: 'demo@chapateca.org' },
      update: {},
      create: {
        id: DEMO_USER_ID,
        name: 'Demo User',
        email: 'demo@chapateca.org',
        role: 'CAMPO',
      },
    })
  } catch {
    return { id: DEMO_USER_ID }
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
  const user = await ensureDemoUser()

  const results: string[] = []

  for (const file of files) {
    const buffer = Buffer.from(await file.arrayBuffer())
    const filename = `${activityDate.toISOString().slice(0, 10)}_${location}_${file.name}`

    // Upload para o Drive (ou mock)
    const driveId = await uploadFileToDrive({
      buffer,
      filename,
      mimeType: file.type || 'application/octet-stream',
      category: 'FOTOS_TERRENO',
      activityDate,
    })

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
