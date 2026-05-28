import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import { getRoleFromCookie, ROLES } from '@/lib/roles'
import { prisma } from '@/lib/prisma'
import { loadFolderTreeFlat } from '@/lib/folder-tree'
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
  const folders = await loadFolderTreeFlat('ESTRATEGIA')

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
