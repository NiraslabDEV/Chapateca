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
  if (!ROLES[role].access.manuais) redirect('/acesso-negado')

  const { folder: preselectedFolderId } = await searchParams

  let folders: { id: string; name: string }[] = []
  try {
    folders = await prisma.folder.findMany({
      where: { category: 'MANUAIS' },
      orderBy: { createdAt: 'asc' },
      select: { id: true, name: true },
    })
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
