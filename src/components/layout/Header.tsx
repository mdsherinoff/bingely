'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'

export default function Header() {
  const [query, setQuery] = useState('')
  const [menuOpen, setMenuOpen] = useState(false)
  const router = useRouter()

  const handleSearch = () => {
    if (!query.trim()) return
    router.push(`/search?q=${encodeURIComponent(query.trim())}`)
    setMenuOpen(false)
  }

  return (
    <header className="bg-espresso/95 border-gold/10 sticky top-0 z-50 border-b backdrop-blur">
      <div className="mx-auto flex max-w-6xl items-center gap-4 px-4 py-3">
        {/* Logo */}
        <Link
          href="/"
          className="font-display text-parchment/80 hover:text-parchment flex-shrink-0 text-2xl transition-colors"
        >
          Bingely
        </Link>

        {/* Search — hidden on mobile, visible md+ */}
        <div className="hidden max-w-xl flex-1 md:flex">
          <input
            type="text"
            placeholder="Search films, series, anime..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
            className="bg-ink border-gold/20 text-parchment placeholder:text-parchment/30 focus:border-gold/50 w-full rounded-sm border px-4 py-2 font-mono text-sm transition-colors focus:outline-none"
          />
        </div>

        {/* Nav links — hidden on mobile */}
        <nav className="ml-auto hidden items-center gap-6 md:flex">
          <Link
            href="/challenges"
            className="text-parchment/40 hover:text-parchment font-mono text-xs tracking-widest transition-colors"
          >
            CHALLENGES
          </Link>
          <Link
            href="/achievements"
            className="text-parchment/40 hover:text-parchment font-mono text-xs tracking-widest transition-colors"
          >
            ACHIEVEMENTS
          </Link>
        </nav>

        {/* Mobile menu button */}
        <button
          onClick={() => setMenuOpen(!menuOpen)}
          aria-label={menuOpen ? 'Close menu' : 'Open menu'}
          aria-expanded={menuOpen}
          className="text-parchment/40 hover:text-parchment ml-auto flex min-h-[44px] min-w-[44px] items-center justify-center p-2 font-mono text-xs transition-colors md:hidden"
        >
          {menuOpen ? '✕' : '☰'}
        </button>
      </div>

      {/* Mobile menu */}
      {menuOpen && (
        <div className="border-gold/10 bg-espresso flex flex-col gap-4 border-t px-4 py-4 md:hidden">
          <input
            type="text"
            placeholder="Search films, series, anime..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
            className="bg-ink border-gold/20 text-parchment placeholder:text-parchment/30 focus:border-gold/50 w-full rounded-sm border px-4 py-3 font-mono text-sm focus:outline-none"
          />
          <nav className="flex flex-col gap-3">
            <Link
              href="/challenges"
              onClick={() => setMenuOpen(false)}
              className="text-parchment/40 hover:text-parchment py-2 font-mono text-xs tracking-widest transition-colors"
            >
              CHALLENGES
            </Link>
            <Link
              href="/achievements"
              onClick={() => setMenuOpen(false)}
              className="text-parchment/40 hover:text-parchment py-2 font-mono text-xs tracking-widest transition-colors"
            >
              ACHIEVEMENTS
            </Link>
          </nav>
        </div>
      )}
    </header>
  )
}
