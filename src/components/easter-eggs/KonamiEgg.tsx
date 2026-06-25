'use client'

import { useState, useCallback } from 'react'
import { useKonamiCode } from '@/hooks/useKonamiCode'
import { useAchievements } from '@/hooks/useAchievements'
import AchievementToast from '@/components/achievements/AchievementToast'

export default function KonamiEgg() {
  const [active, setActive] = useState(false)
  const { unlock, newUnlock, clearNewUnlock } = useAchievements()

  const onSuccess = useCallback(() => {
    setActive(true)
    unlock('challenge-accepted')
    setTimeout(() => setActive(false), 5000)
  }, [unlock])

  useKonamiCode(onSuccess)

  if (!active)
    return (
      <AchievementToast achievement={newUnlock} onDismiss={clearNewUnlock} />
    )

  return (
    <>
      <div className="pointer-events-none fixed inset-0 z-50 flex items-center justify-center">
        <div className="animate-in flex flex-col items-center gap-4">
          <p className="font-display text-gold/80 text-6xl">↑↑↓↓←→←→BA</p>
          <p className="text-gold/40 font-mono text-xs tracking-widest">
            YOU FOUND IT · CINEPHILE ELITE
          </p>
        </div>
      </div>
      <AchievementToast achievement={newUnlock} onDismiss={clearNewUnlock} />
    </>
  )
}
