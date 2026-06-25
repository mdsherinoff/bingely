'use client'

import { useEffect } from 'react'
import { useAchievements } from '@/hooks/useAchievements'
import AchievementToast from '@/components/achievements/AchievementToast'

export default function ChallengeUnlock() {
  const { unlock, newUnlock, clearNewUnlock } = useAchievements()

  useEffect(() => {
    unlock('challenge-accepted')
  }, [unlock])

  return <AchievementToast achievement={newUnlock} onDismiss={clearNewUnlock} />
}
