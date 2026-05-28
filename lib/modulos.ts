import type { ModuleKey } from '@/lib/roles'

/**
 * Configuração central dos módulos do portal.
 *
 * Cada módulo:
 *  - tem um `key` que é a flag de acesso no User
 *  - tem uma `category` que é o código guardado em FileLog.category (DB)
 *  - tem rota, label, ícone, cores próprios
 *
 * Adicionar um módulo novo = só adicionar uma entrada aqui + criar a rota
 * em `app/(portal)/<href>/`.
 */
export type ModuloConfig = {
  key: ModuleKey
  category: string  // código guardado em FileLog.category (DB)
  href: string      // rota frontend
  uploadHref: string
  label: string     // nome mostrado ao utilizador
  short: string     // versão curta (sidebar)
  description: string
  iconName: 'BookOpen' | 'Crown' | 'TrendingUp' | 'Wallet' | 'Camera' | 'Users' | 'CalendarDays' | 'Sparkles'
  accentColor: string
  accentBg: string
  order: number     // ordem no menu (1, 2, 3...)
  visibleInDashboard: boolean
  visibleInSidebar: boolean
}

export const MODULOS: ModuloConfig[] = [
  {
    key: 'manuais',
    category: 'MANUAIS',
    href: '/manuais',
    uploadHref: '/manuais/upload',
    label: 'Procedimentos Internos e Regulamentos',
    short: 'Procedimentos',
    description: 'Documentação, regulamentos e procedimentos internos',
    iconName: 'BookOpen',
    accentColor: '#2D5220',
    accentBg: '#E8EDE2',
    order: 1,
    visibleInDashboard: true,
    visibleInSidebar: true,
  },
  {
    key: 'direcao',
    category: 'DIRECAO',
    href: '/direcao',
    uploadHref: '/direcao/upload',
    label: 'Direção',
    short: 'Direção',
    description: 'Actas, decisões e documentos da Direcção',
    iconName: 'Crown',
    accentColor: '#5A2D8C',
    accentBg: '#EDE8F7',
    order: 2,
    visibleInDashboard: true,
    visibleInSidebar: true,
  },
  {
    key: 'estrategia',
    category: 'ESTRATEGIA',
    href: '/estrategia',
    uploadHref: '/estrategia/upload',
    label: 'Estratégia Financeira',
    short: 'Estratégia',
    description: 'Planos financeiros, orçamentos estratégicos e captação',
    iconName: 'TrendingUp',
    accentColor: '#1A5C8A',
    accentBg: '#E0EDF5',
    order: 3,
    visibleInDashboard: true,
    visibleInSidebar: true,
  },
  {
    key: 'financas',
    category: 'FINANCEIRO',
    href: '/financas',
    uploadHref: '/financas/upload',
    label: 'Contabilidade',
    short: 'Contabilidade',
    description: 'Lançamentos, relatórios contabilísticos e contratos',
    iconName: 'Wallet',
    accentColor: '#8B3A3A',
    accentBg: '#F5E0E0',
    order: 4,
    visibleInDashboard: true,
    visibleInSidebar: true,
  },
  {
    key: 'rh',
    category: 'RH',
    href: '/rh',
    uploadHref: '/rh/upload',
    label: 'Recursos Humanos',
    short: 'RH',
    description: 'Contratos, salários, formações e gestão da equipa',
    iconName: 'Users',
    accentColor: '#9C5B1F',
    accentBg: '#F5E8D8',
    order: 5,
    visibleInDashboard: true,
    visibleInSidebar: true,
  },
  {
    key: 'galeria',
    category: 'FOTOS_TERRENO',
    href: '/galeria',
    uploadHref: '/galeria/upload',
    label: 'Galeria de Fotos',
    short: 'Galeria',
    description: 'Fotos e vídeos das actividades no terreno + marketing',
    iconName: 'Camera',
    accentColor: '#C8952A',
    accentBg: '#F7EFD8',
    order: 7,
    visibleInDashboard: true,
    visibleInSidebar: true,
  },
  {
    key: 'eventos',
    category: 'EVENTOS',
    href: '/eventos',
    uploadHref: '/eventos/upload',
    label: 'Eventos · Documentos',
    short: 'Eventos',
    description: 'Convites, programas, materiais e relatórios de eventos',
    iconName: 'CalendarDays',
    accentColor: '#1F7A6A',
    accentBg: '#DCEEEA',
    order: 8,
    visibleInDashboard: true,
    visibleInSidebar: true,
  },
  {
    key: 'cocoPro',
    category: 'COCO_PRO',
    href: '/coco-pro',
    uploadHref: '/coco-pro/upload',
    label: 'Coco PRO',
    short: 'Coco PRO',
    description: 'Espaço pessoal de trabalho da Direcção Geral',
    iconName: 'Sparkles',
    accentColor: '#461882',
    accentBg: '#EDE8F7',
    order: 10,
    visibleInDashboard: true,
    visibleInSidebar: true,
  },
]

export function moduloByKey(key: ModuleKey): ModuloConfig | undefined {
  return MODULOS.find(m => m.key === key)
}

export function moduloByCategory(category: string): ModuloConfig | undefined {
  return MODULOS.find(m => m.category === category)
}
