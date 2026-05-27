import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import { getRoleFromCookie, ROLES } from '@/lib/roles'
import { prisma } from '@/lib/prisma'
import DocUploadForm from '@/components/modulos/doc-upload-form'

export default async function EstrategiaUploadPage({
  searchParams,
}: {
  searchParams: Promise<{ folder?: string }>
}) {
  const store = await cookies()
  const role = getRoleFromCookie(store.get('chapateca-role')?.value)
  if (!role) redirect('/')
  const r = ROLES[role]
  let hasAccess = r.access.estrategia
  try {
    const u = await prisma.user.findUnique({ where: { email: r.email }, select: { accessEstrategia: true } })
    if (u) hasAccess = u.accessEstrategia ?? r.access.estrategia
  } catch { /* usa estático */ }
  if (!hasAccess) redirect('/acesso-negado')

  const { folder: preselectedFolderId } = await searchParams

  let folders: { id: string; name: string; depth?: number }[] = []
  try {
    const raw = await prisma.folder.findMany({
      where: { category: 'ESTRATEGIA', parentId: null },
      orderBy: { createdAt: 'asc' },
      include: { children: { orderBy: { createdAt: 'asc' }, select: { id: true, name: true } } },
    })
    for (const f of raw) {
      folders.push({ id: f.id, name: f.name })
      for (const c of f.children) folders.push({ id: c.id, name: c.name, depth: 1 })
    }
  } catch { /* DB indisponível */ }

  return (
    <DocUploadForm
      category="ESTRATEGIA"
      backHref="/estrategia"
      successHref="/estrategia"
      accentColor="#1A5C8A"
      categoryLabel="Gestão Estratégica"
      folders={folders}
      preselectedFolderId={preselectedFolderId}
    />
  )
}
