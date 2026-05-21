import { createHash } from 'crypto'

// Hash simples com email como salt (suficiente para portal interno temporário)
export function hashPassword(password: string, email: string): string {
  return createHash('sha256').update(`${email}:${password}`).digest('hex')
}
