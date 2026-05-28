import { NextRequest, NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { getRoleFromCookie, ROLES } from '@/lib/roles'
import { prisma } from '@/lib/prisma'
import sharp from 'sharp'

/**
 * Upload de foto de perfil.
 * Estratégia simples: redimensiona para 256x256 webp e guarda inline (data URL)
 * no campo User.image. Para evitar carga em Drive e cache complexa.
 *
 * Tamanho típico: 15-30 KB por imagem → 13 utilizadores ≈ 400 KB total na DB.
 * Aceitável e simples.
 */
export async function POST(req: NextRequest) {
  const store = await cookies()
  const roleKey = getRoleFromCookie(store.get('chapateca-role')?.value)
  if (!roleKey) return NextResponse.json({ error: 'Não autenticado' }, { status: 401 })
  const r = ROLES[roleKey]

  const formData = await req.formData()
  const file = formData.get('file') as File | null
  if (!file) return NextResponse.json({ error: 'Sem ficheiro' }, { status: 400 })

  if (!file.type.startsWith('image/')) {
    return NextResponse.json({ error: 'Tem que ser uma imagem' }, { status: 400 })
  }
  if (file.size > 5 * 1024 * 1024) {
    return NextResponse.json({ error: 'Máximo 5 MB' }, { status: 400 })
  }

  try {
    const inputBuffer = Buffer.from(await file.arrayBuffer())
    const resized = await sharp(inputBuffer)
      .rotate()
      .resize(256, 256, { fit: 'cover', position: 'center' })
      .webp({ quality: 82 })
      .toBuffer()

    const dataUrl = `data:image/webp;base64,${resized.toString('base64')}`

    await prisma.user.upsert({
      where: { email: r.email },
      update: { image: dataUrl },
      create: { id: `user-${roleKey}`, name: r.name, email: r.email, role: r.dbRole, image: dataUrl },
    })

    return NextResponse.json({ ok: true, image: dataUrl })
  } catch (err) {
    return NextResponse.json({ error: (err as Error).message }, { status: 500 })
  }
}

// Remover foto de perfil
export async function DELETE() {
  const store = await cookies()
  const roleKey = getRoleFromCookie(store.get('chapateca-role')?.value)
  if (!roleKey) return NextResponse.json({ error: 'Não autenticado' }, { status: 401 })
  const r = ROLES[roleKey]

  try {
    await prisma.user.update({ where: { email: r.email }, data: { image: null } })
    return NextResponse.json({ ok: true })
  } catch {
    return NextResponse.json({ error: 'Erro' }, { status: 500 })
  }
}
