import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import { getRoleFromCookie, ROLES } from '@/lib/roles'
import { prisma } from '@/lib/prisma'
import { loadFolderTreeFlat } from '@/lib/folder-tree'
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
  const folders = await loadFolderTreeFlat('MANUAIS')

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
