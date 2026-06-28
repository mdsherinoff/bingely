'use client'

import { useState, useCallback, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useKonamiCode } from '@/hooks/useKonamiCode'
import { useAchievements } from '@/hooks/useAchievements'
import { useCinemaMode } from '@/hooks/useCinemaMode'
import AchievementToast from '@/components/achievements/AchievementToast'

const DRAMATIC_QUOTES = [
  '"All those moments will be lost in time, like tears in rain."',
  '"Here\'s looking at you, kid."',
  '"I am big! It\'s the pictures that got small."',
  '"We\'ll always have Paris."',
  '"Round up the usual suspects."',
]

type Stage = 'idle' | 'flicker' | 'quote' | 'unlock' | 'done'

export default function KonamiEgg() {
  const router = useRouter()
  const [stage, setStage] = useState<Stage>('idle')
  const [quote, setQuote] = useState('')
  const { unlock, newUnlock, clearNewUnlock } = useAchievements()
  const { enable: enableClassic } = useCinemaMode()

  const onSuccess = useCallback(() => {
    if (stage !== 'idle') return
    const randomQuote =
      DRAMATIC_QUOTES[Math.floor(Math.random() * DRAMATIC_QUOTES.length)]
    setQuote(randomQuote)
    setStage('flicker')
  }, [stage])

  useKonamiCode(onSuccess)

  useEffect(() => {
    if (stage === 'flicker') {
      // Enable classic cinema mode
      enableClassic()
      const t = setTimeout(() => setStage('quote'), 1200)
      return () => clearTimeout(t)
    }
    if (stage === 'quote') {
      const t = setTimeout(() => setStage('unlock'), 2800)
      return () => clearTimeout(t)
    }
    if (stage === 'unlock') {
      unlock('cinephile-elite')
      unlock('challenge-accepted')
      const t = setTimeout(() => setStage('done'), 1500)
      return () => clearTimeout(t)
    }
    if (stage === 'done') {
      const t = setTimeout(() => {
        setStage('idle')
        router.push('/screening-room')
      }, 800)
      return () => clearTimeout(t)
    }
  }, [stage, unlock, enableClassic, router])

  if (stage === 'idle') {
    return (
      <AchievementToast achievement={newUnlock} onDismiss={clearNewUnlock} />
    )
  }

  return (
    <>
      {/* Full screen overlay */}
      <div
        className={`bg-espresso fixed inset-0 z-[999] flex flex-col items-center justify-center transition-all duration-700 ${stage === 'flicker' ? 'opacity-100' : 'opacity-100'} `}
      >
        {/* Film grain cranked up */}
        <div
          className="pointer-events-none absolute inset-0 opacity-20"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E")`,
            backgroundRepeat: 'repeat',
            backgroundSize: '128px 128px',
            mixBlendMode: 'overlay',
            filter: 'grayscale(100%)',
          }}
        />

        {/* Projector flicker */}
        {stage === 'flicker' && (
          <div className="flex animate-pulse flex-col items-center gap-8">
            <div className="bg-gold/60 h-24 w-1 rounded-full" />
            <p className="text-gold/40 font-mono text-xs tracking-[0.4em]">
              NOW PRESENTING
            </p>
            <div className="bg-gold/60 h-24 w-1 rounded-full" />
          </div>
        )}

        {/* Quote */}
        {(stage === 'quote' || stage === 'unlock' || stage === 'done') && (
          <div className="flex max-w-2xl flex-col items-center gap-8 px-12 text-center">
            <div className="bg-gold/40 h-px w-16" />
            <p
              className="font-display text-parchment text-3xl leading-relaxed"
              style={{ filter: 'grayscale(100%)' }}
            >
              {quote}
            </p>
            <div className="bg-gold/40 h-px w-16" />

            {stage === 'unlock' && (
              <div className="flex animate-pulse flex-col items-center gap-2">
                <p className="text-gold/60 font-mono text-xs tracking-[0.4em]">
                  CINEPHILE ELITE · UNLOCKED
                </p>
              </div>
            )}

            {stage === 'done' && (
              <p className="text-parchment/30 font-mono text-xs tracking-widest">
                ENTERING THE SCREENING ROOM...
              </p>
            )}
          </div>
        )}

        {/* Vignette */}
        <div
          className="pointer-events-none absolute inset-0"
          style={{
            background:
              'radial-gradient(ellipse at center, transparent 40%, #0A0A0A 100%)',
          }}
        />
      </div>

      <AchievementToast achievement={newUnlock} onDismiss={clearNewUnlock} />
    </>
  )
}
