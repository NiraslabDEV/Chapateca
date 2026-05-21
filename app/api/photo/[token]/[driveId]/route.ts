import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ token: string; driveId: string }> }
) {
  const { token, driveId } = await params

  if (!token || !driveId || driveId.startsWith('mock-')) {
    return new NextResponse('Not found', { status: 404 })
  }

  try {
    // Verify this driveId belongs to an album with this token
    const photo = await prisma.fileLog.findFirst({
      where: { googleDriveId: driveId, album: { shareToken: token } },
      select: { id: true },
    })
    if (!photo) return new NextResponse('Not found', { status: 404 })
  } catch {
    /* DB not available, serve anyway in dev */
  }

  // Drive auth + proxy
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
        process.env.GOOGLE_CLIENT_SECRET
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

    const meta = await drive.files.get({ fileId: driveId, fields: 'mimeType' })
    const mimeType = meta.data.mimeType ?? 'application/octet-stream'
    const response = await drive.files.get(
      { fileId: driveId, alt: 'media' },
      { responseType: 'arraybuffer' }
    )
    const buffer = Buffer.from(response.data as ArrayBuffer)
    return new NextResponse(buffer, {
      status: 200,
      headers: {
        'Content-Type': mimeType,
        'Cache-Control': 'public, max-age=86400',
        'Content-Length': buffer.length.toString(),
      },
    })
  } catch (err) {
    console.error('[Public Photo Proxy]', err)
    return new NextResponse('Erro', { status: 500 })
  }
}
