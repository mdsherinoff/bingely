'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { challenges } from '@/lib/challenges'
import { useAchievements } from '@/hooks/useAchievements'
import AchievementToast from '@/components/achievements/AchievementToast'

export default function MysteryReel() {
  const router = useRouter()
  const [spinning, setSpinning] = useState(false)
  const { unlock, newUnlock, clearNewUnlock } = useAchievements()

  const handleSpin = () => {
    setSpinning(true)
    unlock('challenge-accepted')
    setTimeout(() => {
      const random = challenges[Math.floor(Math.random() * challenges.length)]
      router.push(`/challenges/${random.id}`)
    }, 800)
  }

  return (
    <>
      <button
        onClick={handleSpin}
        title="Mystery Reel"
        className={`group border-gold/10 bg-ink hover:border-gold/40 fixed bottom-6 left-6 z-40 flex h-10 w-10 items-center justify-center rounded-full border transition-all duration-300 ${spinning ? 'border-gold/60 animate-spin' : ''} `}
      >
        <span className="text-gold/30 group-hover:text-gold/70 font-mono text-xs transition-colors">
          ◎
        </span>
      </button>
      <AchievementToast achievement={newUnlock} onDismiss={clearNewUnlock} />
    </>
  )
}
