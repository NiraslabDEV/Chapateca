export type RoleKey =
  | 'CONSTANCE'
  | 'SONIA'
  | 'SHADIA'
  | 'JUDITE'
  | 'LASHINDA'
  | 'ANTONIO'
  | 'ERIC'
  | 'ROGERIO'
  | 'LUCAS'
  | 'LAERCIO'
  | 'ROSA'
  | 'MILENA'
  | 'ILDA'

export type DbRole = 'DIRECAO' | 'DAF' | 'COMUNICACAO' | 'CAMPO'

export type ModuleKey =
  | 'galeria'
  | 'manuais'      // Procedimentos Internos e Regulamentos
  | 'estrategia'   // Estratégia Financeira
  | 'financas'     // Contabilidade
  | 'direcao'
  | 'rh'
  | 'eventos'
  | 'cocoPro'

export interface RoleConfig {
  key: RoleKey
  dbRole: DbRole
  group: 'admin' | 'equipa'
  label: string
  short: string
  name: string
  initials: string
  email: string
  color: string
  bg: string
  access: Record<ModuleKey, boolean>
}

const FULL_ACCESS: Record<ModuleKey, boolean> = {
  galeria: true, manuais: true, estrategia: true, financas: true,
  direcao: true, rh: true, eventos: true, cocoPro: false,
}
const CONSTANCE_ACCESS: Record<ModuleKey, boolean> = { ...FULL_ACCESS, cocoPro: true }
const GALERIA_ONLY: Record<ModuleKey, boolean> = {
  galeria: true, manuais: false, estrategia: false, financas: false,
  direcao: false, rh: false, eventos: true, cocoPro: false,
}

const ADMIN_COLOR = '#461882'
const ADMIN_BG    = '#EDE8F7'
const EQUIPA_COLOR = '#E8652A'
const EQUIPA_BG    = '#FFF0E8'

export const ROLES: Record<RoleKey, RoleConfig> = {
  // ── DIRECÇÃO / ADMIN ────────────────────────────────
  CONSTANCE: {
    key: 'CONSTANCE', dbRole: 'DIRECAO', group: 'admin',
    label: 'Administração Geral', short: 'Admin',
    name: 'Constance', initials: 'CO',
    email: 'constance@chapateca.org',
    color: ADMIN_COLOR, bg: ADMIN_BG,
    access: CONSTANCE_ACCESS,
  },
  SONIA: {
    key: 'SONIA', dbRole: 'DIRECAO', group: 'admin',
    label: 'Administração', short: 'Admin',
    name: 'Sonia Zahi', initials: 'SZ',
    email: 'sonia@chapateca.org',
    color: ADMIN_COLOR, bg: ADMIN_BG,
    access: FULL_ACCESS,
  },
  SHADIA: {
    key: 'SHADIA', dbRole: 'DIRECAO', group: 'admin',
    label: 'Administração', short: 'Admin',
    name: 'Shadia Gafur', initials: 'SG',
    email: 'shadia@chapateca.org',
    color: ADMIN_COLOR, bg: ADMIN_BG,
    access: FULL_ACCESS,
  },

  // ── EQUIPA DE CAMPO ──────────────────────────────────
  JUDITE: {
    key: 'JUDITE', dbRole: 'CAMPO', group: 'equipa',
    label: 'Equipa Campo', short: 'Campo',
    name: 'Judite', initials: 'JU',
    email: 'judite@chapateca.org',
    color: EQUIPA_COLOR, bg: EQUIPA_BG,
    access: GALERIA_ONLY,
  },
  LASHINDA: {
    key: 'LASHINDA', dbRole: 'CAMPO', group: 'equipa',
    label: 'Equipa Campo', short: 'Campo',
    name: 'Lashinda', initials: 'LS',
    email: 'lashinda@chapateca.org',
    color: EQUIPA_COLOR, bg: EQUIPA_BG,
    access: GALERIA_ONLY,
  },
  ANTONIO: {
    key: 'ANTONIO', dbRole: 'CAMPO', group: 'equipa',
    label: 'Equipa Campo', short: 'Campo',
    name: 'António', initials: 'AT',
    email: 'antonio@chapateca.org',
    color: EQUIPA_COLOR, bg: EQUIPA_BG,
    access: GALERIA_ONLY,
  },
  ERIC: {
    key: 'ERIC', dbRole: 'CAMPO', group: 'equipa',
    label: 'Equipa Campo', short: 'Campo',
    name: 'Eric', initials: 'ER',
    email: 'eric@chapateca.org',
    color: EQUIPA_COLOR, bg: EQUIPA_BG,
    access: GALERIA_ONLY,
  },
  ROGERIO: {
    key: 'ROGERIO', dbRole: 'CAMPO', group: 'equipa',
    label: 'Equipa Campo', short: 'Campo',
    name: 'Rogério', initials: 'RG',
    email: 'rogerio@chapateca.org',
    color: EQUIPA_COLOR, bg: EQUIPA_BG,
    access: GALERIA_ONLY,
  },
  LUCAS: {
    key: 'LUCAS', dbRole: 'CAMPO', group: 'equipa',
    label: 'Equipa Campo', short: 'Campo',
    name: 'Lucas', initials: 'LU',
    email: 'lucas@chapateca.org',
    color: EQUIPA_COLOR, bg: EQUIPA_BG,
    access: GALERIA_ONLY,
  },
  LAERCIO: {
    key: 'LAERCIO', dbRole: 'CAMPO', group: 'equipa',
    label: 'Equipa Campo', short: 'Campo',
    name: 'Laércio', initials: 'LC',
    email: 'laercio@chapateca.org',
    color: EQUIPA_COLOR, bg: EQUIPA_BG,
    access: GALERIA_ONLY,
  },
  ROSA: {
    key: 'ROSA', dbRole: 'CAMPO', group: 'equipa',
    label: 'Equipa Campo', short: 'Campo',
    name: 'Rosa', initials: 'RS',
    email: 'rosa@chapateca.org',
    color: EQUIPA_COLOR, bg: EQUIPA_BG,
    access: GALERIA_ONLY,
  },
  MILENA: {
    key: 'MILENA', dbRole: 'CAMPO', group: 'equipa',
    label: 'Equipa Campo', short: 'Campo',
    name: 'Milena', initials: 'MI',
    email: 'milena@chapateca.org',
    color: EQUIPA_COLOR, bg: EQUIPA_BG,
    access: GALERIA_ONLY,
  },
  ILDA: {
    key: 'ILDA', dbRole: 'CAMPO', group: 'equipa',
    label: 'Equipa Campo', short: 'Campo',
    name: 'Ilda', initials: 'IL',
    email: 'ilda@chapateca.org',
    color: EQUIPA_COLOR, bg: EQUIPA_BG,
    access: GALERIA_ONLY,
  },
}

export function getRoleFromCookie(cookie: string | undefined): RoleKey | null {
  if (!cookie || !Object.keys(ROLES).includes(cookie)) return null
  return cookie as RoleKey
}
