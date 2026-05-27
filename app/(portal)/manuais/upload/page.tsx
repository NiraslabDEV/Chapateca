import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import { getRoleFromCookie, ROLES } from '@/lib/roles'
import { prisma } from '@/lib/prisma'
import DocUploadForm from '@/components/modulos/doc-upload-form'

export default async function ManuaisUploadPage({
  searchParams,
}: {
  searchParams: Promise<{ folder?: string }>
}) {
  const store = await cookies()
  const role = getRoleFromCookie(store.get('chapateca-role')?.value)
  if (!role) redirect('/')
  const r = ROLES[role]
  let hasAccess = r.access.manuais
  try {
    const u = await prisma.user.findUnique({ where: { email: r.email }, select: { accessManuais: true } })
    if (u) hasAccess = u.accessManuais ?? r.access.manuais
  } catch { /* usa estático */ }
  if (!hasAccess) redirect('/acesso-negado')

  const { folder: preselectedFolderId } = await searchParams

  let folders: { id: string; name: string; depth?: number }[] = []
  try {
    const raw = await prisma.folder.findMany({
      where: { category: 'MANUAIS', parentId: null },
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
      category="MANUAIS"
      backHref="/manuais"
      successHref="/manuais"
      accentColor="#2D5220"
      categoryLabel="Manuais e Guias"
      folders={folders}
      preselectedFolderId={preselectedFolderId}
    />
  )
}
