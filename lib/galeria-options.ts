/**
 * Opções fixas para o formulário de upload da Galeria de Terreno.
 * Pediu a Constance (Maio 2026) que sejam listas predefinidas em vez de texto livre.
 */

export const LOCATIONS = [
  'Matola Rio – Centro Bahai',
  'Choupal – Khensany',
  'Khongolote – Skate Educação',
  'Boane Picoco – APC',
  'Ponta do Ouro – Khanimambo',
  'Mafalala – ACCD Machaka',
  'Polana Caniço – Makhallartes',
  'Matola Sede – Lar de Nova Esperança',
  'Escolas Publicas – Maputo Cidade',
  'Escolas Publicas – Maputo Provincia',
  'Outro',
] as const

export const PROJECT_NAMES = [
  'CHAPATECA MATEULA',
  'CHAPATECA MUNGANO',
  'TXOPTECA EDUCACAO SOBRE RODAS',
  'TXOPTECA CAMINHOS DE ESPERANCA',
  'TXOPTECA FRANCOTECA',
  'OUTROS',
] as const

export type Location = (typeof LOCATIONS)[number]
export type ProjectName = (typeof PROJECT_NAMES)[number]
