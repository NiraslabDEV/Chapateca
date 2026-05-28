import { prisma } from '@/lib/prisma'
import type { DocCategory } from '@/lib/folder-actions'

export type FlatFolderOption = {
  id: string
  name: string
  depth?: number  // 0=raiz, 1=sub, 2=sub-sub
}

/**
 * Carrega a hierarquia de pastas (até 3 níveis) e devolve um array plano
 * para usar em <select>, com indentação visual via campo "depth".
 */
export async function loadFolderTreeFlat(category: DocCategory): Promise<FlatFolderOption[]> {
  const out: FlatFolderOption[] = []
  try {
    const raw = await prisma.folder.findMany({
      where: { category, parentId: null },
      orderBy: { createdAt: 'asc' },
      include: {
        children: {
          orderBy: { createdAt: 'asc' },
          include: {
            children: {
              orderBy: { createdAt: 'asc' },
              select: { id: true, name: true },
            },
          },
        },
      },
    })
    for (const f of raw) {
      out.push({ id: f.id, name: f.name })
      for (const c of f.children) {
        out.push({ id: c.id, name: c.name, depth: 1 })
        for (const g of c.children) {
          out.push({ id: g.id, name: g.name, depth: 2 })
        }
      }
    }
  } catch { /* DB indisponível — devolve vazio */ }
  return out
}
