import { NextRequest, NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { getRoleFromCookie, ROLES } from '@/lib/roles'
import { prisma } from '@/lib/prisma'

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ driveId: string }> }
) {
  const store = await cookies()
  const role = getRoleFromCookie(store.get('chapateca-role')?.value)
  if (!role) return new NextResponse('Não autenticado', { status: 401 })

  const r = ROLES[role]
  if (!r.access.financas) return new NextResponse('Sem permissão', { status: 403 })

  const { driveId } = await params
  const download = req.nextUrl.searchParams.get('download') === '1'

  if (!driveId || driveId.startsWith('mock-')) {
    return new NextResponse('Ficheiro demo — Drive não configurado', { status: 404 })
  }

  // Verifica que o ficheiro existe na DB e pertence à categoria FINANCEIRO
  let fileName = 'documento'
  let mimeType = 'application/octet-stream'
  try {
    const log = await prisma.fileLog.findFirst({
      where: { googleDriveId: driveId, category: 'FINANCEIRO' },
    })
    if (!log) return new NextResponse('Ficheiro não encontrado', { status: 404 })
    fileName = log.fileName
    mimeType = log.mimeType
  } catch { /* DB indisponível — continua */ }

  try {
    const { google } = await import('googleapis')

    const isOAuthReady = !!(
      process.env.GOOGLE_CLIENT_ID &&
      process.env.GOOGLE_CLIENT_SECRET &&
      process.env.GOOGLE_REFRESH_TOKEN
    )

    let drive
    if (isOAuthReady) {
      const oauth2 = new google.auth.OAuth2(
        process.env.GOOGLE_CLIENT_ID,
        process.env.GOOGLE_CLIENT_SECRET,
      )
      oauth2.setCredentials({ refresh_token: process.env.GOOGLE_REFRESH_TOKEN })
      drive = google.drive({ version: 'v3', auth: oauth2 })
    } else {
      const auth = new google.auth.GoogleAuth({
        credentials: {
          client_email: process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL,
          private_key: process.env.GOOGLE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
        },
        scopes: ['https://www.googleapis.com/auth/drive.readonly'],
      })
      drive = google.drive({ version: 'v3', auth })
    }

    const response = await drive.files.get(
      { fileId: driveId, alt: 'media' },
      { responseType: 'arraybuffer' }
    )

    const buffer = Buffer.from(response.data as ArrayBuffer)
    const encodedName = encodeURIComponent(fileName)
    const disposition = download
      ? `attachment; filename="${encodedName}"; filename*=UTF-8''${encodedName}`
      : `inline; filename="${encodedName}"; filename*=UTF-8''${encodedName}`

    return new NextResponse(buffer, {
      status: 200,
      headers: {
        'Content-Type': mimeType,
        'Content-Disposition': disposition,
        'Cache-Control': 'private, max-age=1800',
        'Content-Length': buffer.length.toString(),
      },
    })
  } catch (err) {
    console.error('[Drive Doc Proxy]', err)
    return new NextResponse('Erro ao carregar documento', { status: 500 })
  }
}
