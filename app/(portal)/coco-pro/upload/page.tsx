import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import { getRoleFromCookie, ROLES } from '@/lib/roles'
import { prisma } from '@/lib/prisma'
import { loadFolderTreeFlat } from '@/lib/folder-tree'
import DocUploadForm from '@/components/modulos/doc-upload-form'

export default async function CocoProUploadPage({
  searchParams,
}: {
  searchParams: Promise<{ folder?: string }>
}) {
  const store = await cookies()
  const role = getRoleFromCookie(store.get('chapateca-role')?.value)
  if (!role) redirect('/')
  const r = ROLES[role]
  let hasAccess = r.access.cocoPro
  try {
    const u = await prisma.user.findUnique({ where: { email: r.email }, select: { accessCocoPro: true } })
    if (u) hasAccess = u.accessCocoPro ?? r.access.cocoPro
  } catch { /* usa estático */ }
  if (!hasAccess) redirect('/acesso-negado')

  const { folder: preselectedFolderId } = await searchParams
  const folders = await loadFolderTreeFlat('COCO_PRO')

  return (
    <DocUploadForm
      category="COCO_PRO"
      backHref="/coco-pro"
      successHref="/coco-pro"
      accentColor="#461882"
      categoryLabel="Coco PRO"
      folders={folders}
      preselectedFolderId={preselectedFolderId}
    />
  )
}
