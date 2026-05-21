import { PassThrough } from 'stream'

// Suporta dois modos de autenticação:
// 1. OAuth2 (Gmail gratuito) — usa GOOGLE_CLIENT_ID + GOOGLE_CLIENT_SECRET + GOOGLE_REFRESH_TOKEN
// 2. Service Account (Google Workspace) — usa GOOGLE_SERVICE_ACCOUNT_EMAIL + GOOGLE_PRIVATE_KEY
const isOAuthReady = !!(
  process.env.GOOGLE_CLIENT_ID &&
  process.env.GOOGLE_CLIENT_SECRET &&
  process.env.GOOGLE_REFRESH_TOKEN &&
  process.env.DRIVE_FOLDER_COMUNICACAO
)

const isServiceAccountReady = !!(
  process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL &&
  process.env.GOOGLE_PRIVATE_KEY &&
  process.env.DRIVE_FOLDER_COMUNICACAO
)

const isDriveReady = isOAuthReady || isServiceAccountReady

const FOLDER_MAP: Record<string, string> = {
  FOTOS_TERRENO:  process.env.DRIVE_FOLDER_COMUNICACAO   ?? '',
  FINANCEIRO:     process.env.DRIVE_FOLDER_FINANCEIRO    ?? '',
  ESTRATEGIA:     process.env.DRIVE_FOLDER_ESTRATEGIA    ?? '',
  PROCEDIMENTOS:  process.env.DRIVE_FOLDER_PROCEDIMENTOS ?? '',
}

async function getDriveClient() {
  const { google } = await import('googleapis')

  if (isOAuthReady) {
    const oauth2 = new google.auth.OAuth2(
      process.env.GOOGLE_CLIENT_ID,
      process.env.GOOGLE_CLIENT_SECRET,
    )
    oauth2.setCredentials({ refresh_token: process.env.GOOGLE_REFRESH_TOKEN })
    return google.drive({ version: 'v3', auth: oauth2 })
  }

  // Fallback: Service Account
  const auth = new google.auth.GoogleAuth({
    credentials: {
      client_email: process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL,
      private_key: process.env.GOOGLE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
    },
    scopes: ['https://www.googleapis.com/auth/drive'],
  })
  return google.drive({ version: 'v3', auth })
}

async function ensureFolder(
  drive: Awaited<ReturnType<typeof getDriveClient>>,
  parentId: string,
  name: string
): Promise<string> {
  // Procura pasta existente
  const res = await drive.files.list({
    q: `'${parentId}' in parents and name = '${name}' and mimeType = 'application/vnd.google-apps.folder' and trashed = false`,
    fields: 'files(id)',
  })
  if (res.data.files?.[0]?.id) return res.data.files[0].id

  // Cria pasta se não existir
  const folder = await drive.files.create({
    requestBody: { name, mimeType: 'application/vnd.google-apps.folder', parents: [parentId] },
    fields: 'id',
  })
  return folder.data.id!
}

async function getOrCreateYearMonthFolder(
  drive: Awaited<ReturnType<typeof getDriveClient>>,
  rootFolderId: string,
  date: Date
): Promise<string> {
  const year = date.getFullYear().toString()
  const monthNames = ['01_Janeiro','02_Fevereiro','03_Março','04_Abril','05_Maio','06_Junho',
                      '07_Julho','08_Agosto','09_Setembro','10_Outubro','11_Novembro','12_Dezembro']
  const month = monthNames[date.getMonth()]

  const yearId = await ensureFolder(drive, rootFolderId, year)
  return await ensureFolder(drive, yearId, month)
}

export interface UploadParams {
  buffer: Buffer
  filename: string
  mimeType: string
  category: string
  activityDate: Date
  location?: string
}

export async function uploadFileToDrive(params: UploadParams): Promise<string> {
  if (!isDriveReady) {
    console.log(`[Drive Mock] Upload: ${params.filename} → ${params.category}`)
    return `mock-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`
  }

  const drive = await getDriveClient()
  const rootFolderId = FOLDER_MAP[params.category]
  if (!rootFolderId) throw new Error(`Pasta não configurada para categoria: ${params.category}`)

  let folderId = await getOrCreateYearMonthFolder(drive, rootFolderId, params.activityDate)

  // Subcarpeta por bairro/localização dentro do mês
  if (params.location) {
    folderId = await ensureFolder(drive, folderId, params.location)
  }

  // Converte Buffer para stream passthrough (mais compatível com googleapis)
  const stream = new PassThrough()
  stream.end(params.buffer)

  try {
    const response = await drive.files.create({
      requestBody: { name: params.filename, parents: [folderId] },
      media: { mimeType: params.mimeType, body: stream },
      fields: 'id',
    })
    console.log(`[Drive] Upload OK: ${response.data.id}`)
    return response.data.id!
  } catch (err: unknown) {
    const e = err as { code?: number; errors?: unknown[]; message?: string }
    console.error('[Drive] Upload error:', e.code, JSON.stringify(e.errors), e.message)
    throw err
  }
}

export async function createShareLink(driveFileId: string): Promise<string> {
  if (driveFileId.startsWith('mock-')) {
    return `https://fotos.chapateca.org/share/${Math.random().toString(36).slice(2, 10)}`
  }

  const drive = await getDriveClient()
  await drive.permissions.create({
    fileId: driveFileId,
    requestBody: { role: 'reader', type: 'anyone' },
  })
  const file = await drive.files.get({ fileId: driveFileId, fields: 'webViewLink' })
  return file.data.webViewLink ?? ''
}
