import { prisma } from '@/lib/prisma'
import { ROLES, type RoleKey, type ModuleKey } from '@/lib/roles'

export type EffectiveAccess = Record<ModuleKey, boolean>

/**
 * Devolve o acesso EFECTIVO do utilizador a cada módulo:
 * - Se houver registo na DB, usa o valor da DB
 * - Caso contrário, cai para o default estático do ROLES
 *
 * Esta é a única fonte de verdade sobre permissões — usa em todo o lado
 * que precise de saber "este utilizador pode entrar em X?".
 */
export async function getEffectiveAccess(roleKey: RoleKey): Promise<EffectiveAccess> {
  const r = ROLES[roleKey]
  const defaults = r.access
  try {
    const user = await prisma.user.findUnique({
      where: { email: r.email },
      select: {
        accessGaleria: true, accessManuais: true, accessEstrategia: true, accessFinancas: true,
        accessDirecao: true, accessRH: true, accessEventos: true, accessCocoPro: true,
      },
    })
    if (!user) return defaults
    return {
      galeria:    user.accessGaleria    ?? defaults.galeria,
      manuais:    user.accessManuais    ?? defaults.manuais,
      estrategia: user.accessEstrategia ?? defaults.estrategia,
      financas:   user.accessFinancas   ?? defaults.financas,
      direcao:    user.accessDirecao    ?? defaults.direcao,
      rh:         user.accessRH         ?? defaults.rh,
      eventos:    user.accessEventos    ?? defaults.eventos,
      cocoPro:    user.accessCocoPro    ?? defaults.cocoPro,
    }
  } catch {
    return defaults
  }
}
