import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import { getRoleFromCookie, ROLES } from '@/lib/roles'
import { prisma } from '@/lib/prisma'
import { loadFolderTreeFlat } from '@/lib/folder-tree'
import DocUploadForm from '@/components/modulos/doc-upload-form'

export default async function FinancasUploadPage({
  searchParams,
}: {
  searchParams: Promise<{ folder?: string }>
}) {
  const store = await cookies()
  const role = getRoleFromCookie(store.get('chapateca-role')?.value)
  if (!role) redirect('/')
  const r = ROLES[role]
  let hasAccess = r.access.financas
  try {
    const u = await prisma.user.findUnique({ where: { email: r.email }, select: { accessFinancas: true } })
    if (u) hasAccess = u.accessFinancas ?? r.access.financas
  } catch { /* usa estático */ }
  if (!hasAccess) redirect('/acesso-negado')

  const { folder: preselectedFolderId } = await searchParams
  const folders = await loadFolderTreeFlat('FINANCEIRO')

  return (
    <DocUploadForm
      category="FINANCEIRO"
      backHref="/financas"
      successHref="/financas"
      accentColor="#8B3A3A"
      categoryLabel="Departamento Financeiro"
      folders={folders}
      preselectedFolderId={preselectedFolderId}
    />
  )
}
