'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Input from '@/components/ui/Input'
import Button from '@/components/ui/Button'

export default function Hero() {
  const [query, setQuery] = useState('')
  const router = useRouter()

  const handleSearch = () => {
    if (!query.trim()) return
    router.push(`/search?q=${encodeURIComponent(query.trim())}`)
  }

  return (
    <section className="grain relative flex min-h-screen flex-col items-center justify-center gap-10 px-4 text-center">
      {/* Vignette */}
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_center,_transparent_40%,_#1A1410_100%)]" />

      <div className="relative z-10 flex flex-col items-center gap-6">
        {/* Eyebrow */}
        <p className="text-gold/60 font-mono text-xs tracking-[0.3em] uppercase">
          Your personal cinema planner
        </p>

        {/* Title */}
        <h1 className="font-display text-parchment text-[6rem] leading-none tracking-tight">
          Bingely
        </h1>

        {/* Tagline */}
        <p className="font-body text-parchment/50 max-w-md text-xl italic">
          Stop wondering when you'll finish. Start watching with a plan.
        </p>

        {/* Search */}
        <div className="mt-4 flex w-full max-w-xl gap-3">
          <Input
            placeholder="Search a film, series, or anime..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
            className="flex-1"
          />
          <Button onClick={handleSearch}>Plan It</Button>
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
