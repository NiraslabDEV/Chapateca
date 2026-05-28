import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import { getRoleFromCookie, ROLES } from '@/lib/roles'
import { prisma } from '@/lib/prisma'
import { loadFolderTreeFlat } from '@/lib/folder-tree'
import DocUploadForm from '@/components/modulos/doc-upload-form'

export default async function EventosUploadPage({
  searchParams,
}: {
  searchParams: Promise<{ folder?: string }>
}) {
  const store = await cookies()
  const role = getRoleFromCookie(store.get('chapateca-role')?.value)
  if (!role) redirect('/')
  const r = ROLES[role]
  let hasAccess = r.access.eventos
  try {
    const u = await prisma.user.findUnique({ where: { email: r.email }, select: { accessEventos: true } })
    if (u) hasAccess = u.accessEventos ?? r.access.eventos
  } catch { /* usa estático */ }
  if (!hasAccess) redirect('/acesso-negado')

  const { folder: preselectedFolderId } = await searchParams
  const folders = await loadFolderTreeFlat('EVENTOS')

  return (
    <DocUploadForm
      category="EVENTOS"
      backHref="/eventos"
      successHref="/eventos"
      accentColor="#1F7A6A"
      categoryLabel="Eventos"
      folders={folders}
      preselectedFolderId={preselectedFolderId}
    />
  )
}
