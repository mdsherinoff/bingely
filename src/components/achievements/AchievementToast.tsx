'use client'

import { useEffect } from 'react'
import { Achievement } from '@/lib/achievements'

interface AchievementToastProps {
  achievement: Achievement | null
  onDismiss: () => void
}

export default function AchievementToast({
  achievement,
  onDismiss,
}: AchievementToastProps) {
  useEffect(() => {
    if (!achievement) return
    const t = setTimeout(onDismiss, 4000)
    return () => clearTimeout(t)
  }, [achievement, onDismiss])

  if (!achievement) return null

  return (
    <div className="bg-ink border-gold/40 animate-in fixed right-6 bottom-6 z-50 flex items-center gap-4 rounded-sm border px-5 py-4 shadow-lg">
      <span className="text-gold font-mono text-2xl">{achievement.icon}</span>
      <div className="flex flex-col gap-0.5">
        <p className="text-gold/60 font-mono text-xs tracking-widest">
          ACHIEVEMENT UNLOCKED
        </p>
        <p className="text-parchment font-mono text-base">
          {achievement.title}
        </p>
        <p className="text-parchment/40 font-mono text-xs">
          {achievement.description}
        </p>
      </div>
      <button
        onClick={onDismiss}
        className="text-parchment/20 hover:text-parchment/50 ml-2 font-mono text-xs transition-colors"
      >
        ✕
      </button>
    </div>
  )
}
