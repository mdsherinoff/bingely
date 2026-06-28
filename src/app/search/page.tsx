'use client'

import { useSearchParams, useRouter } from 'next/navigation'
import { useEffect, useState, Suspense } from 'react'
import Link from 'next/link'
import { useSearch } from '@/hooks/useSearch'
import PosterCard from '@/components/search/PosterCard'
import PosterSkeleton from '@/components/search/PosterSkeleton'
import Input from '@/components/ui/Input'
import Footer from '@/components/landing/Footer'

function SearchContent() {
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
    <>
      <section className="mx-auto max-w-6xl px-6 py-10">
        {!initialQuery && !loading && (
          <p className="text-parchment/30 mb-8 font-mono text-xs tracking-widest">
            TRENDING THIS WEEK
          </p>
        )}

        {error && (
          <p className="text-rose py-20 text-center font-mono">{error}</p>
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
            <p className="text-parchment/20 font-mono">
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
    </>
  )
}

export default function SearchPage() {
  return (
    <main id="main-content" className="bg-espresso min-h-screen">
      <Suspense
        fallback={
          <div className="bg-espresso flex min-h-screen items-center justify-center">
            <p className="text-parchment/30 animate-pulse font-mono text-xs tracking-widest">
              LOADING...
            </p>
          </div>
        }
      >
        <SearchContent />
      </Suspense>
      <Footer />
    </main>
  )
}
