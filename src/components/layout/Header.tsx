'use client'

import { useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import SearchBox from '@/components/search/SearchBox'

const NAV = [
  { href: '/challenges', label: 'CHALLENGES' },
  { href: '/library', label: 'LIBRARY' },
  { href: '/achievements', label: 'ACHIEVEMENTS' },
]

export default function Header() {
  const [menuOpen, setMenuOpen] = useState(false)
  const pathname = usePathname()
  // The landing page has its own big search; a second one up here just
  // competes with it
  const showSearch = pathname !== '/'

  const isActive = (href: string) =>
    pathname === href ||
    pathname.startsWith(`${href}/`) ||
    (href === '/library' && pathname.startsWith('/list/'))

  return (
    <header className="bg-espresso/95 border-line sticky top-0 z-50 border-b backdrop-blur">
      <div className="mx-auto flex max-w-6xl items-center gap-4 px-4 py-3">
        <Link
          href="/"
          className="font-display text-parchment-dim hover:text-parchment flex-shrink-0 text-2xl transition-colors"
        >
          Bingely
        </Link>

        {showSearch && (
          <div role="search" className="hidden max-w-xl flex-1 md:flex">
            <SearchBox />
          </div>
        )}

        <nav
          aria-label="Main"
          className="ml-auto hidden items-center gap-6 md:flex"
        >
          {NAV.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              aria-current={isActive(item.href) ? 'page' : undefined}
              className={`font-mono text-xs tracking-widest transition-colors ${
                isActive(item.href)
                  ? 'text-gold'
                  : 'text-parchment-dim hover:text-parchment'
              }`}
            >
              {item.label}
            </Link>
          ))}
        </nav>

        <button
          onClick={() => setMenuOpen(!menuOpen)}
          aria-label={menuOpen ? 'Close menu' : 'Open menu'}
          aria-expanded={menuOpen}
          className="text-parchment-dim hover:text-parchment ml-auto flex min-h-[44px] min-w-[44px] items-center justify-center p-2 font-mono text-xs transition-colors md:hidden"
        >
          {menuOpen ? '✕' : '☰'}
        </button>
      </div>

      {menuOpen && (
        <div className="border-line bg-espresso flex flex-col gap-4 border-t px-4 py-4 md:hidden">
          <div role="search">
            <SearchBox size="lg" onNavigate={() => setMenuOpen(false)} />
          </div>
          <nav aria-label="Main" className="flex flex-col gap-1">
            {NAV.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setMenuOpen(false)}
                aria-current={isActive(item.href) ? 'page' : undefined}
                className={`py-3 font-mono text-xs tracking-widest transition-colors ${
                  isActive(item.href)
                    ? 'text-gold'
                    : 'text-parchment-dim hover:text-parchment'
                }`}
              >
                {item.label}
              </Link>
            ))}
          </nav>
        </div>
      )}
    </header>
  )
}
