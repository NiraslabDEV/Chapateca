import { NextRequest, NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { getRoleFromCookie } from '@/lib/roles'

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ driveId: string }> }
) {
  const store = await cookies()
  const role = getRoleFromCookie(store.get('chapateca-role')?.value)
  if (!role) return new NextResponse('Não autenticado', { status: 401 })

  const { driveId } = await params

  if (!driveId || driveId.startsWith('mock-')) {
    return new NextResponse('Not found', { status: 404 })
  }

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

    // Busca metadata para obter o mimeType
    const meta = await drive.files.get({ fileId: driveId, fields: 'mimeType,name' })
    const mimeType = meta.data.mimeType ?? 'application/octet-stream'

    // Faz download do conteúdo
    const response = await drive.files.get(
      { fileId: driveId, alt: 'media' },
      { responseType: 'arraybuffer' }
    )

    const buffer = Buffer.from(response.data as ArrayBuffer)

    return new NextResponse(buffer, {
      status: 200,
      headers: {
        'Content-Type': mimeType,
        'Cache-Control': 'private, max-age=3600',
        'Content-Length': buffer.length.toString(),
      },
    })
  } catch (err) {
    console.error('[Drive Image Proxy]', err)
    return new NextResponse('Erro ao carregar imagem', { status: 500 })
  }
}
