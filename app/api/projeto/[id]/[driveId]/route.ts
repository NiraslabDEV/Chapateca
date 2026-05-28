import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import sharp from 'sharp'

const MAX_CACHE_ENTRIES = 80
const memCache = new Map<string, { buf: Buffer; contentType: string }>()

function getCached(key: string) {
  const hit = memCache.get(key)
  if (!hit) return null
  memCache.delete(key)
  memCache.set(key, hit)
  return hit
}
function setCached(key: string, value: { buf: Buffer; contentType: string }) {
  if (memCache.size >= MAX_CACHE_ENTRIES) {
    const firstKey = memCache.keys().next().value
    if (firstKey) memCache.delete(firstKey)
  }
  memCache.set(key, value)
}

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string; driveId: string }> }
) {
  const { id, driveId } = await params

  if (!id || !driveId || driveId.startsWith('mock-')) {
    return new NextResponse('Not found', { status: 404 })
  }

  try {
    const photo = await prisma.fileLog.findFirst({
      where: { googleDriveId: driveId, albumId: id, album: { isPublic: true } },
      select: { id: true },
    })
    if (!photo) return new NextResponse('Not found', { status: 404 })
  } catch {
    return new NextResponse('Erro', { status: 500 })
  }

  const widthParam = req.nextUrl.searchParams.get('w')
  const isDownload = req.nextUrl.searchParams.get('download') === '1'
  const width = isDownload ? 0 : (widthParam ? Math.min(Math.max(parseInt(widthParam, 10) || 0, 50), 2000) : 0)
  const cacheKey = `proj|${driveId}|${width}`

  const cached = getCached(cacheKey)
  if (cached) {
    const headers: Record<string, string> = {
      'Content-Type': cached.contentType,
      'Cache-Control': 'public, max-age=2592000, immutable',
      'Content-Length': cached.buf.length.toString(),
      'X-Cache': 'HIT',
    }
    if (isDownload) {
      headers['Content-Disposition'] = `attachment; filename="${driveId}"`
    }
    return new NextResponse(new Uint8Array(cached.buf), { status: 200, headers })
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
    const driveRes = await drive.files.get(
      { fileId: driveId, alt: 'media' },
      { responseType: 'arraybuffer' }
    )

    let buffer: Buffer = Buffer.from(driveRes.data as ArrayBuffer)
    let contentType = mimeType

    const isRasterImage = mimeType.startsWith('image/') && mimeType !== 'image/svg+xml' && mimeType !== 'image/gif'
    if (width > 0 && isRasterImage) {
      try {
        const resized = await sharp(buffer)
          .rotate()
          .resize(width, undefined, { withoutEnlargement: true, fit: 'inside' })
          .webp({ quality: 82 })
          .toBuffer()
        buffer = Buffer.from(resized)
        contentType = 'image/webp'
      } catch (resizeErr) {
        console.error('[Projeto Photo] Resize failed:', (resizeErr as Error).message)
      }
    }

    setCached(cacheKey, { buf: buffer, contentType })

    const headers: Record<string, string> = {
      'Content-Type': contentType,
      'Cache-Control': 'public, max-age=2592000, immutable',
      'Content-Length': buffer.length.toString(),
      'X-Cache': 'MISS',
    }
    if (isDownload) {
      headers['Content-Disposition'] = `attachment; filename="${driveId}"`
    }
    return new NextResponse(new Uint8Array(buffer), { status: 200, headers })
  } catch (err) {
    console.error('[Projeto Photo]', err)
    return new NextResponse('Erro', { status: 500 })
  }
}
