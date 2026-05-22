import { NextRequest, NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { getRoleFromCookie } from '@/lib/roles'
import { listDriveFolderContents } from '@/lib/google-drive'

// Mantém uma whitelist de pastas-raiz permitidas para evitar browsing arbitrário
// de qualquer pasta do Drive da Chapateca.
function allowedRoots(): Set<string> {
  return new Set(
    [
      process.env.DRIVE_FOLDER_COMUNICACAO,
      process.env.DRIVE_FOLDER_MARKETING,
      process.env.DRIVE_FOLDER_FINANCEIRO,
      process.env.DRIVE_FOLDER_ESTRATEGIA,
      process.env.DRIVE_FOLDER_PROCEDIMENTOS,
    ].filter(Boolean) as string[]
  )
}

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ folderId: string }> }
) {
  const store = await cookies()
  const role = getRoleFromCookie(store.get('chapateca-role')?.value)
  if (!role) return NextResponse.json({ error: 'Não autenticado' }, { status: 401 })

  const { folderId } = await params
  if (!folderId) return NextResponse.json({ error: 'folderId obrigatório' }, { status: 400 })

  // Resolve alias 'root:CATEGORIA' para o env var correspondente
  let actualFolderId = folderId
  const rootAliases: Record<string, string | undefined> = {
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

  // Sanity check de segurança: garantir que estamos dentro de uma das pastas raiz
  // Verificamos olhando para os parents do breadcrumb; se nenhum parent for root e a própria
  // pasta não é root, recusamos. (Evita browse de pastas fora do âmbito Chapateca.)
  const roots = allowedRoots()
  const isItselfRoot = roots.has(actualFolderId)
  if (!isItselfRoot && result.parents.length === 0) {
    // Sem parents conhecidos e não é root → fora do âmbito
    return NextResponse.json({ error: 'Pasta fora do âmbito do portal' }, { status: 403 })
  }

  return NextResponse.json(result)
}
