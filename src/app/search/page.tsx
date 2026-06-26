'use client'

import { useSearchParams, useRouter } from 'next/navigation'
import { useEffect } from 'react'
import Link from 'next/link'
import { useSearch } from '@/hooks/useSearch'
import PosterCard from '@/components/search/PosterCard'
import PosterSkeleton from '@/components/search/PosterSkeleton'
import Input from '@/components/ui/Input'
import PageTransition from '@/components/layout/PageTransition'

export default function SearchPage() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const initialQuery = searchParams.get('q') || ''

  const { query, setQuery, results, loading, error, search } =
    useSearch(initialQuery)

  useEffect(() => {
    search(initialQuery)
  }, [initialQuery])

  const handleSearch = () => {
    if (!query.trim()) return
    router.push(`/search?q=${encodeURIComponent(query.trim())}`)
  }

  return (
    <PageTransition>
      <main id="main-content" className="bg-espresso min-h-screen">
        <h1 className="sr-only">Search films, series and anime</h1>
        <header className="bg-espresso/95 border-gold/10 sticky top-0 z-50 border-b px-6 py-4 backdrop-blur">
          <div className="mx-auto flex max-w-6xl items-center gap-6">
            <Link
              href="/"
              className="font-display text-parchment/70 hover:text-parchment flex-shrink-0 text-2xl transition-colors"
            >
              Bingely
            </Link>
            <div className="flex max-w-2xl flex-1 gap-3">
              <Input
                placeholder="Search films, series, anime..."
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                className="flex-1"
              />
            </div>
          </div>
        </header>

        <section className="mx-auto max-w-6xl px-6 py-10">
          {!initialQuery && !loading && (
            <p className="text-parchment/30 mb-8 font-mono text-xs tracking-widest">
              TRENDING THIS WEEK
            </p>
          )}

          {error && (
            <p className="font-body text-rose py-20 text-center">{error}</p>
          )}

          {loading ? (
            <div className="grid grid-cols-2 gap-6 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
              {Array.from({ length: 10 }).map((_, i) => (
                <PosterSkeleton key={i} />
              ))}
            </div>
          ) : results.length === 0 ? (
            <div className="flex flex-col items-center justify-center gap-4 py-32">
              <span className="text-gold/20 font-mono text-4xl">◎</span>
              <p className="font-display text-parchment/30 text-3xl">
                No results found
              </p>
              <p className="font-body text-parchment/20 italic">
                Try searching for something else
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-6 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
              {results.map((item, i) => (
                <PosterCard key={item.id} item={item} index={i} />
              ))}
            </div>
          )}
        </section>
      </main>
    </PageTransition>
  )
}
