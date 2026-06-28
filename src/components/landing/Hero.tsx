'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Input from '@/components/ui/Input'
import Button from '@/components/ui/Button'

const hiddenQuotes = [
  '"Here\'s looking at you, kid." — Casablanca',
  '"I\'ll be back." — The Terminator',
  '"May the Force be with you." — Star Wars',
  '"All those moments will be lost in time, like tears in rain." — Blade Runner',
  '"You talkin\' to me?" — Taxi Driver',
]

export default function Hero() {
  const [query, setQuery] = useState('')
  const [quote, setQuote] = useState<string | null>(null)
  const router = useRouter()

  const handleSearch = () => {
    if (!query.trim()) return
    router.push(`/search?q=${encodeURIComponent(query.trim())}`)
  }

  const revealQuote = () => {
    const random = hiddenQuotes[Math.floor(Math.random() * hiddenQuotes.length)]
    setQuote(random)
    setTimeout(() => setQuote(null), 3000)
  }

  return (
    <section className="grain relative flex min-h-screen flex-col items-center justify-center gap-10 px-4 text-center">
      {/* Vignette */}
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_center,_transparent_40%,_#080808_100%)]" />

      <div className="relative z-10 flex flex-col items-center gap-6">
        {/* Eyebrow */}
        <p className="text-gold/60 font-mono text-xs tracking-[0.3em] uppercase">
          Your personal cinema planner
        </p>

        {/* Title — clickable easter egg */}
        <h1
          className="font-display text-parchment cursor-default text-[4rem] leading-none tracking-tight select-none sm:text-[5rem] md:text-[6rem]"
          onClick={revealQuote}
        >
          Bingely
        </h1>

        {/* Hidden quote reveal */}
        {quote && (
          <p className="text-gold/60 animate-in font-display max-w-sm text-sm italic">
            {quote}
          </p>
        )}

        {/* Tagline */}
        <p className="text-parchment/50 max-w-md font-mono text-xl">
          Stop wondering when you'll finish. Start watching with a plan.
        </p>

        {/* Search */}
        <div className="mt-4 flex w-full max-w-xl flex-col gap-3 sm:flex-row">
          <Input
            placeholder="Search a film, series, or anime..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
            className="flex-1"
          />
          <Button onClick={handleSearch} className="sm:flex-shrink-0">
            Plan It
          </Button>
        </div>

        {/* Suggestions */}
        <div className="flex flex-wrap justify-center gap-3">
          {[
            'One Piece',
            'Breaking Bad',
            'The Godfather',
            'Neon Genesis Evangelion',
          ].map((s) => (
            <button
              key={s}
              onClick={() => router.push(`/search?q=${encodeURIComponent(s)}`)}
              className="text-parchment/30 hover:text-gold/70 font-mono text-xs tracking-widest transition-colors"
            >
              {s}
            </button>
          ))}
        </div>
      </div>
    </section>
  )
}
