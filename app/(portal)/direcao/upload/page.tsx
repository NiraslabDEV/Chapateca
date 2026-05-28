import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import { getRoleFromCookie, ROLES } from '@/lib/roles'
import { prisma } from '@/lib/prisma'
import { loadFolderTreeFlat } from '@/lib/folder-tree'
import DocUploadForm from '@/components/modulos/doc-upload-form'

export default async function DirecaoUploadPage({
  searchParams,
}: {
  searchParams: Promise<{ folder?: string }>
}) {
  const store = await cookies()
  const role = getRoleFromCookie(store.get('chapateca-role')?.value)
  if (!role) redirect('/')
  const r = ROLES[role]
  let hasAccess = r.access.direcao
  try {
    const u = await prisma.user.findUnique({ where: { email: r.email }, select: { accessDirecao: true } })
    if (u) hasAccess = u.accessDirecao ?? r.access.direcao
  } catch { /* usa estático */ }
  if (!hasAccess) redirect('/acesso-negado')

  const { folder: preselectedFolderId } = await searchParams
  const folders = await loadFolderTreeFlat('DIRECAO')

  return (
    <DocUploadForm
      category="DIRECAO"
      backHref="/direcao"
      successHref="/direcao"
      accentColor="#5A2D8C"
      categoryLabel="Direção"
      folders={folders}
      preselectedFolderId={preselectedFolderId}
    />
  )
}
