import { NextRequest, NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { getRoleFromCookie } from '@/lib/roles'
import sharp from 'sharp'

// Cache em memória do processo — válido durante o lifecycle do container.
// Chave: `${driveId}|${width}`. Evita ir ao Drive em pedidos repetidos do mesmo thumb.
const MAX_CACHE_ENTRIES = 80
const memCache = new Map<string, { buf: Buffer; contentType: string }>()

function getCached(key: string) {
  const hit = memCache.get(key)
  if (!hit) return null
  // LRU: re-insere para topo
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
  { params }: { params: Promise<{ driveId: string }> }
) {
  const store = await cookies()
  const role = getRoleFromCookie(store.get('chapateca-role')?.value)
  if (!role) return new NextResponse('Não autenticado', { status: 401 })

  const { driveId } = await params

  if (!driveId || driveId.startsWith('mock-')) {
    return new NextResponse('Not found', { status: 404 })
  }

  // Param ?w=N — redimensiona para essa largura. Sem param = imagem original.
  const widthParam = req.nextUrl.searchParams.get('w')
  const width = widthParam ? Math.min(Math.max(parseInt(widthParam, 10) || 0, 50), 2000) : 0
  const cacheKey = `${driveId}|${width}`

  // Cache hit em memória → resposta imediata
  const cached = getCached(cacheKey)
  if (cached) {
    return new NextResponse(new Uint8Array(cached.buf), {
      status: 200,
      headers: {
        'Content-Type': cached.contentType,
        'Cache-Control': 'private, max-age=2592000, immutable',
        'Content-Length': cached.buf.length.toString(),
        'X-Cache': 'HIT',
      },
    })
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

    // Metadata para mimeType
    const meta = await drive.files.get({ fileId: driveId, fields: 'mimeType,name' })
    const mimeType = meta.data.mimeType ?? 'application/octet-stream'

    // Download conteúdo
    const driveRes = await drive.files.get(
      { fileId: driveId, alt: 'media' },
      { responseType: 'arraybuffer' }
    )

    let buffer: Buffer = Buffer.from(driveRes.data as ArrayBuffer)
    let contentType = mimeType

    // Redimensiona com sharp se for imagem rasterizada e width foi pedido.
    // Converte para WebP (≈50% mais leve que JPEG na mesma qualidade visual).
    const isRasterImage = mimeType.startsWith('image/') && mimeType !== 'image/svg+xml' && mimeType !== 'image/gif'
    if (width > 0 && isRasterImage) {
      try {
        const resized = await sharp(buffer)
          .rotate() // respeita orientação EXIF (fotos de telemóvel)
          .resize(width, undefined, { withoutEnlargement: true, fit: 'inside' })
          .webp({ quality: 82 })
          .toBuffer()
        buffer = Buffer.from(resized)
        contentType = 'image/webp'
      } catch (resizeErr) {
        console.error('[Drive Image Proxy] Resize failed, returning original:', (resizeErr as Error).message)
      }
    }

    // Guarda em cache de memória para próximos pedidos
    setCached(cacheKey, { buf: buffer, contentType })

    return new NextResponse(new Uint8Array(buffer), {
      status: 200,
      headers: {
        'Content-Type': contentType,
        'Cache-Control': 'private, max-age=2592000, immutable',
        'Content-Length': buffer.length.toString(),
        'X-Cache': 'MISS',
      },
    })
  } catch (err) {
    console.error('[Drive Image Proxy]', err)
    return new NextResponse('Erro ao carregar imagem', { status: 500 })
  }
}
