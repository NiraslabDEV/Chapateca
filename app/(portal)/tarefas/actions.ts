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
