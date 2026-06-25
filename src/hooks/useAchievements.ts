'use client'

import { useState, useEffect, useCallback } from 'react'
import { achievements, Achievement } from '@/lib/achievements'

const STORAGE_KEY = 'bingely_achievements'

export function useAchievements() {
  const [unlocked, setUnlocked] = useState<Set<string>>(new Set())
  const [newUnlock, setNewUnlock] = useState<Achievement | null>(null)

  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY)
      if (stored) {
        setUnlocked(new Set(JSON.parse(stored)))
      }
    } catch {}
  }, [])

  const unlock = useCallback((id: string) => {
    setUnlocked((prev) => {
      if (prev.has(id)) return prev
      const next = new Set(prev)
      next.add(id)
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify([...next]))
      } catch {}
      const achievement = achievements.find((a) => a.id === id)
      if (achievement) setNewUnlock(achievement)
      return next
    })
  }, [])

  const clearNewUnlock = useCallback(() => setNewUnlock(null), [])

  const isUnlocked = useCallback((id: string) => unlocked.has(id), [unlocked])

  return { unlocked, unlock, isUnlocked, newUnlock, clearNewUnlock }
}
