export type RoleKey = 'DIRECAO' | 'DAF' | 'COMUNICACAO' | 'CAMPO'

export interface RoleConfig {
  key: RoleKey
  label: string
  short: string
  name: string        // nome de demo
  initials: string
  email: string
  color: string
  bg: string
  access: {
    galeria: boolean
    manuais: boolean
    estrategia: boolean
    financas: boolean
  }
}

export const ROLES: Record<RoleKey, RoleConfig> = {
  DIRECAO: {
    key: 'DIRECAO',
    label: 'Direcção',
    short: 'Direcção',
    name: 'Lourenço Tembe',
    initials: 'LT',
    email: 'lourenco@chapateca.org',
    color: '#5A3A8B',
    bg: '#EDE8F7',
    access: { galeria: true, manuais: true, estrategia: true, financas: true },
  },
  DAF: {
    key: 'DAF',
    label: 'Departamento Financeiro',
    short: 'DAF',
    name: 'Sandra Mabunda',
    initials: 'SM',
    email: 'sandra@chapateca.org',
    color: '#8B3A3A',
    bg: '#F7ECEC',
    access: { galeria: false, manuais: true, estrategia: false, financas: true },
  },
  COMUNICACAO: {
    key: 'COMUNICACAO',
    label: 'Comunicação',
    short: 'Comunicação',
    name: 'Carlos Mucavele',
    initials: 'CM',
    email: 'carlos@chapateca.org',
    color: '#1A5C8A',
    bg: '#E3EEF7',
    access: { galeria: true, manuais: true, estrategia: false, financas: false },
  },
  CAMPO: {
    key: 'CAMPO',
    label: 'Equipa de Campo',
    short: 'Campo',
    name: 'Beatriz Nhantumbo',
    initials: 'BN',
    email: 'beatriz@chapateca.org',
    color: '#2D7D46',
    bg: '#E8F5EC',
    access: { galeria: true, manuais: true, estrategia: false, financas: false },
  },
}

export function getRoleFromCookie(cookie: string | undefined): RoleKey | null {
  if (!cookie || !Object.keys(ROLES).includes(cookie)) return null
  return cookie as RoleKey
}
