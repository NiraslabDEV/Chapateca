'use server'

import { cookies } from 'next/headers'
import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { getRoleFromCookie, ROLES } from '@/lib/roles'
import { prisma } from '@/lib/prisma'

async function getRole() {
  const store = await cookies()
  const key = getRoleFromCookie(store.get('chapateca-role')?.value)
  if (!key) redirect('/')
  return { key, r: ROLES[key] }
}

export async function createTask(formData: FormData) {
  const { r } = await getRole()
  if (r.group !== 'admin') return

  const toEmail = formData.get('toEmail') as string
  const title   = (formData.get('title') as string)?.trim()
  const body    = (formData.get('body') as string)?.trim() || null

  if (!toEmail || !title) return

  await prisma.task.create({
    data: { fromEmail: r.email, toEmail, title, body },
  })
  revalidatePath('/tarefas')
}

export async function markTaskReceived(taskId: string) {
  const { r } = await getRole()
  await prisma.task.updateMany({
    where: { id: taskId, toEmail: r.email, status: 'pending' },
    data:  { status: 'received', readAt: new Date() },
  })
  revalidatePath('/tarefas')
}

export async function markTaskDone(formData: FormData) {
  const { r } = await getRole()
  const taskId = formData.get('taskId') as string
  await prisma.task.updateMany({
    where: { id: taskId, toEmail: r.email },
    data:  { status: 'done', doneAt: new Date() },
  })
  revalidatePath('/tarefas')
}

/** Envia uma mensagem dentro do thread de uma tarefa. */
export async function sendTaskMessage(taskId: string, body: string): Promise<{ ok: boolean; error?: string }> {
  const { r } = await getRole()
  const text = body.trim()
  if (!text) return { ok: false, error: 'Mensagem vazia' }
  if (text.length > 2000) return { ok: false, error: 'Mensagem demasiado longa (máx 2000)' }

  try {
    // Verifica que o utilizador é parte do par (sender ou receiver)
    const task = await prisma.task.findUnique({
      where: { id: taskId },
      select: { fromEmail: true, toEmail: true },
    })
    if (!task) return { ok: false, error: 'Tarefa não encontrada' }
    if (task.fromEmail !== r.email && task.toEmail !== r.email) {
      return { ok: false, error: 'Sem permissão' }
    }

    const now = new Date()
    await prisma.$transaction([
      prisma.taskMessage.create({
        data: { taskId, fromEmail: r.email, body: text },
      }),
      prisma.task.update({
        where: { id: taskId },
        data: {
          lastMessageAt: now,
          // Se a tarefa estava 'pending' e o receiver responde, automaticamente passa a 'received'
          ...(task.toEmail === r.email ? { status: 'received', readAt: now } : {}),
        },
      }),
    ])

    revalidatePath('/tarefas')
    return { ok: true }
  } catch (err) {
    return { ok: false, error: (err as Error).message }
  }
}

/** Marca todas as mensagens não-lidas de uma tarefa como lidas (chamado quando o par abre a conversa). */
export async function markMessagesRead(taskId: string): Promise<void> {
  const { r } = await getRole()
  try {
    await prisma.taskMessage.updateMany({
      where: {
        taskId,
        fromEmail: { not: r.email }, // mensagens da outra parte
        readByPeer: false,
      },
      data: { readByPeer: true },
    })
  } catch { /* silently */ }
}

/** Carrega o histórico de mensagens de uma tarefa (server-side). */
export async function getTaskMessages(taskId: string) {
  const { r } = await getRole()
  try {
    const task = await prisma.task.findUnique({
      where: { id: taskId },
      select: { fromEmail: true, toEmail: true },
    })
    if (!task) return []
    if (task.fromEmail !== r.email && task.toEmail !== r.email) return []

    return await prisma.taskMessage.findMany({
      where: { taskId },
      orderBy: { createdAt: 'asc' },
      select: { id: true, fromEmail: true, body: true, createdAt: true, readByPeer: true },
    })
  } catch {
    return []
  }
}
