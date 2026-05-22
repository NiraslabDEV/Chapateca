import { NextRequest, NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { getRoleFromCookie } from '@/lib/roles'
import { listDriveFolderContents, getChapatecaRootId } from '@/lib/google-drive'

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ folderId: string }> }
) {
  const store = await cookies()
  const role = getRoleFromCookie(store.get('chapateca-role')?.value)
  if (!role) return NextResponse.json({ error: 'Não autenticado' }, { status: 401 })

  const { folderId } = await params
  if (!folderId) return NextResponse.json({ error: 'folderId obrigatório' }, { status: 400 })

  const chapatecaRoot = await getChapatecaRootId()

  // Resolve alias 'root:CATEGORIA' para o env var correspondente
  let actualFolderId = folderId
  const rootAliases: Record<string, string | undefined> = {
    'root:CHAPATECA':    chapatecaRoot,
    'root:COMUNICACAO':  process.env.DRIVE_FOLDER_COMUNICACAO,
    'root:MARKETING':    process.env.DRIVE_FOLDER_MARKETING,
    'root:FINANCEIRO':   process.env.DRIVE_FOLDER_FINANCEIRO,
    'root:ESTRATEGIA':   process.env.DRIVE_FOLDER_ESTRATEGIA,
    'root:PROCEDIMENTOS': process.env.DRIVE_FOLDER_PROCEDIMENTOS,
  }
  if (folderId in rootAliases) {
    const resolved = rootAliases[folderId]
    if (!resolved) return NextResponse.json({ error: 'Pasta raiz não configurada' }, { status: 404 })
    actualFolderId = resolved
  }

  const result = await listDriveFolderContents(actualFolderId)
  if (!result) return NextResponse.json({ error: 'Não foi possível listar a pasta' }, { status: 500 })

  // Check de segurança: a pasta tem de ser a Chapateca root ou estar dentro dela.
  // O breadcrumb pára nas roots conhecidas — se conseguiu chegar até uma, está OK.
  const knownRoots = new Set([
    chapatecaRoot,
    process.env.DRIVE_FOLDER_COMUNICACAO,
    process.env.DRIVE_FOLDER_MARKETING,
    process.env.DRIVE_FOLDER_FINANCEIRO,
    process.env.DRIVE_FOLDER_ESTRATEGIA,
    process.env.DRIVE_FOLDER_PROCEDIMENTOS,
  ].filter(Boolean))

  const isItselfRoot = knownRoots.has(actualFolderId)
  // Se não é root, precisa de ter parents (significa que está dentro de uma estrutura conhecida)
  if (!isItselfRoot && result.parents.length === 0) {
    return NextResponse.json({ error: 'Pasta fora do âmbito do portal' }, { status: 403 })
  }

  return NextResponse.json(result)
}
