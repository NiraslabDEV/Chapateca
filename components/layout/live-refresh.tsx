'use client'

import { useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'

/**
 * Faz polling silencioso para detectar novas tarefas e mensagens enquanto a
 * pessoa está no portal — sem precisar de F5.
 *
 * Estratégia:
 *  - Chama router.refresh() a cada {intervalMs} (padrão 20s)
 *  - Pausa quando o separador está em background (poupa servidor + bateria)
 *  - Refresca imediatamente quando o separador volta a ficar visível
 */
interface Props {
  intervalMs?: number
}

export default function LiveRefresh({ intervalMs = 20_000 }: Props) {
  const router = useRouter()
  const lastRefreshRef = useRef<number>(Date.now())

  useEffect(() => {
    let intervalId: ReturnType<typeof setInterval> | null = null

    const refresh = () => {
      lastRefreshRef.current = Date.now()
      router.refresh()
    }

    const start = () => {
      if (intervalId) return
      intervalId = setInterval(refresh, intervalMs)
    }
    const stop = () => {
      if (!intervalId) return
      clearInterval(intervalId)
      intervalId = null
    }

    const handleVisibility = () => {
      if (document.hidden) {
        stop()
      } else {
        // Se o separador esteve escondido > intervalo, refresca já
        const elapsed = Date.now() - lastRefreshRef.current
        if (elapsed > intervalMs) refresh()
        start()
      }
    }

    if (!document.hidden) start()
    document.addEventListener('visibilitychange', handleVisibility)

    return () => {
      stop()
      document.removeEventListener('visibilitychange', handleVisibility)
    }
  }, [router, intervalMs])

  return null
}
