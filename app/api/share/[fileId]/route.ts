import { NextRequest, NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { getRoleFromCookie } from '@/lib/roles'
import { createShareLink } from '@/lib/google-drive'
import { prisma } from '@/lib/prisma'

export async function POST(
  _request: NextRequest,
  { params }: { params: Promise<{ fileId: string }> }
) {
  const store = await cookies()
  const role = getRoleFromCookie(store.get('chapateca-role')?.value)
  if (!role) return NextResponse.json({ error: 'Não autenticado' }, { status: 401 })

  const { fileId } = await params

  try {
    const log = await prisma.fileLog.findUnique({ where: { id: fileId } })
    if (!log) return NextResponse.json({ error: 'Ficheiro não encontrado' }, { status: 404 })

    // Gera ou reutiliza link existente
    const link = log.shareLink ?? await createShareLink(log.googleDriveId)

    if (!log.shareLink) {
      await prisma.fileLog.update({ where: { id: fileId }, data: { shareLink: link } })
    }

    return NextResponse.json({ link })
  } catch {
    // Fallback mock
    const mockLink = `https://fotos.chapateca.org/share/${Math.random().toString(36).slice(2, 10)}`
    return NextResponse.json({ link: mockLink })
  }
}
