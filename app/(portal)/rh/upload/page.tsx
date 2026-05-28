import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import { getRoleFromCookie, ROLES } from '@/lib/roles'
import { prisma } from '@/lib/prisma'
import { loadFolderTreeFlat } from '@/lib/folder-tree'
import DocUploadForm from '@/components/modulos/doc-upload-form'

export default async function RHUploadPage({
  searchParams,
}: {
  searchParams: Promise<{ folder?: string }>
}) {
  const store = await cookies()
  const role = getRoleFromCookie(store.get('chapateca-role')?.value)
  if (!role) redirect('/')
  const r = ROLES[role]
  let hasAccess = r.access.rh
  try {
    const u = await prisma.user.findUnique({ where: { email: r.email }, select: { accessRH: true } })
    if (u) hasAccess = u.accessRH ?? r.access.rh
  } catch { /* usa estático */ }
  if (!hasAccess) redirect('/acesso-negado')

  const { folder: preselectedFolderId } = await searchParams
  const folders = await loadFolderTreeFlat('RH')

  return (
    <DocUploadForm
      category="RH"
      backHref="/rh"
      successHref="/rh"
      accentColor="#9C5B1F"
      categoryLabel="Recursos Humanos"
      folders={folders}
      preselectedFolderId={preselectedFolderId}
    />
  )
}
