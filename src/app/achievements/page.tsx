'use client'

import { achievements } from '@/lib/achievements'
import { useAchievements } from '@/hooks/useAchievements'
import AchievementBadge from '@/components/achievements/AchievementBadge'
import Link from 'next/link'

export default function AchievementsPage() {
  const { isUnlocked, unlocked } = useAchievements()

  return (
    <main className="bg-espresso min-h-screen px-6 py-12">
      <div className="mx-auto flex max-w-4xl flex-col gap-10">
        <div className="flex flex-col gap-3">
          <Link
            href="/"
            className="text-parchment/30 hover:text-parchment/60 w-fit font-mono text-xs tracking-widest transition-colors"
          >
            ← BACK
          </Link>
          <p className="text-gold/60 font-mono text-xs tracking-widest">
            ACHIEVEMENTS
          </p>
          <h1 className="font-display text-parchment text-6xl leading-none">
            Your badges
          </h1>
          <p className="font-body text-parchment/40 italic">
            {unlocked.size} of {achievements.length} unlocked
          </p>
        </div>

        {/* Progress bar */}
        <div className="flex flex-col gap-2">
          <div className="bg-ink border-gold/10 h-1 overflow-hidden rounded-full border">
            <div
              className="bg-gold h-full rounded-full transition-all duration-500"
              style={{
                width: `${Math.round((unlocked.size / achievements.length) * 100)}%`,
              }}
            />
          </div>
          <p className="text-parchment/20 font-mono text-xs tracking-widest">
            {Math.round((unlocked.size / achievements.length) * 100)}% COMPLETE
          </p>
        </div>

        {/* Grid */}
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4">
          {achievements.map((a) => (
            <AchievementBadge
              key={a.id}
              achievement={a}
              unlocked={isUnlocked(a.id)}
            />
          ))}
        </div>
      </div>
    </main>
  )
}
