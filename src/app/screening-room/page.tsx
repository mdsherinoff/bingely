'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { challenges } from '@/lib/challenges'
import { useAchievements } from '@/hooks/useAchievements'

const SCREENING_QUOTES = [
  { quote: '"Here\'s looking at you, kid."', film: 'Casablanca, 1942' },
  {
    quote: '"I am big! It\'s the pictures that got small."',
    film: 'Sunset Boulevard, 1950',
  },
  {
    quote: '"All right, Mr. DeMille, I\'m ready for my close-up."',
    film: 'Sunset Boulevard, 1950',
  },
  { quote: '"We\'ll always have Paris."', film: 'Casablanca, 1942' },
  { quote: '"Round up the usual suspects."', film: 'Casablanca, 1942' },
  {
    quote: '"Frankly, my dear, I don\'t give a damn."',
    film: 'Gone with the Wind, 1939',
  },
  {
    quote: '"I\'m going to make him an offer he can\'t refuse."',
    film: 'The Godfather, 1972',
  },
  {
    quote: '"After all, tomorrow is another day."',
    film: 'Gone with the Wind, 1939',
  },
]

const SECRET_CHALLENGE =
  challenges.find((c) => c.id === 'nolan-marathon') ?? challenges[0]

export default function ScreeningRoom() {
  const [currentQuote, setCurrentQuote] = useState(0)
  const [visible, setVisible] = useState(true)
  const { isUnlocked } = useAchievements()

  // Cycle through quotes
  useEffect(() => {
    const interval = setInterval(() => {
      setVisible(false)
      setTimeout(() => {
        setCurrentQuote((q) => (q + 1) % SCREENING_QUOTES.length)
        setVisible(true)
      }, 500)
    }, 5000)
    return () => clearInterval(interval)
  }, [])

  const q = SCREENING_QUOTES[currentQuote]

  return (
    <main className="flex min-h-screen flex-col">
      {/* Hero — full height quote display */}
      <div className="bg-espresso relative flex min-h-screen flex-1 flex-col items-center justify-center px-8 py-24">
        {/* Heavy grain */}
        <div
          className="pointer-events-none absolute inset-0 opacity-15"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E")`,
            backgroundRepeat: 'repeat',
            backgroundSize: '128px 128px',
          }}
        />

        {/* Vignette */}
        <div
          className="pointer-events-none absolute inset-0"
          style={{
            background:
              'radial-gradient(ellipse at center, transparent 30%, #0A0A0A 100%)',
          }}
        />

        {/* Top label */}
        <div className="absolute top-8 right-0 left-0 flex flex-col items-center gap-2">
          <div className="bg-gold/40 h-px w-8" />
          <p className="text-gold/40 font-mono text-xs tracking-[0.5em]">
            THE SCREENING ROOM
          </p>
          <div className="bg-gold/40 h-px w-8" />
        </div>

        {/* Quote */}
        <div
          className="relative z-10 flex max-w-3xl flex-col items-center gap-6 text-center transition-opacity duration-500"
          style={{ opacity: visible ? 1 : 0 }}
        >
          <p className="font-display text-parchment text-4xl leading-relaxed md:text-5xl">
            {q.quote}
          </p>
          <p className="text-parchment/40 font-mono text-xs tracking-widest">
            — {q.film}
          </p>
        </div>

        {/* Quote dots */}
        <div className="absolute bottom-16 flex gap-2">
          {SCREENING_QUOTES.map((_, i) => (
            <button
              key={i}
              onClick={() => {
                setVisible(false)
                setTimeout(() => {
                  setCurrentQuote(i)
                  setVisible(true)
                }, 300)
              }}
              className={`h-1.5 w-1.5 rounded-full transition-colors ${i === currentQuote ? 'bg-gold/70' : 'bg-parchment/20'} `}
            />
          ))}
        </div>
      </div>

      {/* Secret content */}
      <div className="bg-ink border-gold/20 border-t px-6 py-16">
        <div className="mx-auto flex max-w-4xl flex-col gap-12">
          {/* Welcome message */}
          <div className="flex flex-col items-center gap-4 text-center">
            <p className="text-gold/50 font-mono text-xs tracking-[0.4em]">
              YOU FOUND THE SCREENING ROOM
            </p>
            <h1 className="font-display text-parchment text-5xl">
              A Place for Cinephiles
            </h1>
            <p className="font-body text-parchment/40 max-w-lg italic">
              Only those who know the code may enter. Welcome.
            </p>
          </div>

          {/* Film reel decoration */}
          <div className="flex items-center gap-4">
            <div className="bg-gold/20 h-px flex-1" />
            <span className="text-gold/40 font-mono text-xl">◎</span>
            <div className="bg-gold/20 h-px flex-1" />
          </div>

          {/* Secret featured challenge */}
          <div className="flex flex-col gap-4">
            <p className="text-gold/50 text-center font-mono text-xs tracking-widest">
              TONIGHT'S FEATURE PRESENTATION
            </p>
            <Link
              href={`/challenges/${SECRET_CHALLENGE.id}`}
              className="group border-gold/20 hover:border-gold/50 flex flex-col gap-4 rounded-sm border p-8 text-center transition-colors"
            >
              <span className="text-gold/40 group-hover:text-gold/70 font-mono text-4xl transition-colors">
                {SECRET_CHALLENGE.icon}
              </span>
              <h2 className="font-display text-parchment group-hover:text-gold text-3xl transition-colors">
                {SECRET_CHALLENGE.title}
              </h2>
              <p className="font-body text-parchment/40 italic">
                {SECRET_CHALLENGE.description}
              </p>
              <p className="text-gold/40 mt-2 font-mono text-xs tracking-widest">
                {SECRET_CHALLENGE.itemCount} films ·{' '}
                {Math.round(SECRET_CHALLENGE.totalRuntime / 60)}h total
              </p>
              <p className="text-gold/30 group-hover:text-gold/60 font-mono text-xs tracking-widest transition-colors">
                BEGIN THE JOURNEY →
              </p>
            </Link>
          </div>

          {/* Classic film facts */}
          <div className="grid gap-4 md:grid-cols-3">
            {[
              {
                stat: '1,000+',
                label:
                  'films submitted for Academy Award consideration annually',
              },
              {
                stat: '24 fps',
                label:
                  'the standard frame rate that made cinema feel like reality',
              },
              {
                stat: '1895',
                label:
                  'the year the Lumière brothers held the first public film screening',
              },
            ].map((f) => (
              <div
                key={f.stat}
                className="border-gold/10 flex flex-col gap-2 rounded-sm border p-5 text-center"
              >
                <p className="font-display text-parchment/80 text-3xl">
                  {f.stat}
                </p>
                <p className="text-parchment/30 font-mono text-xs leading-relaxed">
                  {f.label}
                </p>
              </div>
            ))}
          </div>

          {/* Achievement status */}
          <div className="border-gold/20 flex flex-col items-center gap-3 rounded-sm border p-6 text-center">
            <span className="text-gold font-mono text-2xl">★</span>
            <p className="text-gold/60 font-mono text-xs tracking-widest">
              CINEPHILE ELITE
            </p>
            <p className="font-body text-parchment/60 text-sm">
              {isUnlocked('challenge-accepted')
                ? 'Achievement unlocked. You are among the few.'
                : 'Keep exploring to unlock this achievement.'}
            </p>
          </div>

          {/* Exit */}
          <div className="flex flex-col items-center gap-4">
            <div className="flex items-center gap-4">
              <div className="bg-gold/10 h-px flex-1" />
              <span className="text-parchment/20 font-mono text-xs">◎</span>
              <div className="bg-gold/10 h-px flex-1" />
            </div>
            <Link
              href="/"
              className="text-parchment/20 hover:text-parchment/50 font-mono text-xs tracking-widest transition-colors"
            >
              RETURN TO BINGELY →
            </Link>
          </div>
        </div>
      </div>
    </main>
  )
}
