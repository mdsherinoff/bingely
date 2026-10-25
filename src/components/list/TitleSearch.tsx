'use client'

import Image from 'next/image'
import { useEffect, useRef, useState } from 'react'
import { CustomListItem } from '@/types/media'
import { Button, Badge } from '@/components/ui'
import { fetchSeriesDetails, formatRuntime } from '@/lib/listItems'

interface TitleSearchProps {
  isAdded: (tmdbId: number) => boolean
  onAdd: (item: CustomListItem) => void
  onRemove: (tmdbId: number) => void
  autoFocus?: boolean
}

interface SearchHit {
  id: number
  title: string
  mediaType: 'movie' | 'tv'
  posterPath: string | null
  releaseYear: string
}

// Looks up what the list scheduler needs for one search result: a film's
// runtime, or a series' episode count, episode length and season sizes
async function withDetails(
  hit: SearchHit,
  signal: AbortSignal
): Promise<CustomListItem> {
  const base = {
    tmdbId: hit.id,
    title: hit.title,
    mediaType: hit.mediaType,
    posterPath: hit.posterPath,
    releaseYear: hit.releaseYear,
  }
  try {
    if (hit.mediaType === 'tv')
      return { ...base, ...(await fetchSeriesDetails(hit.id, signal)) }
    const res = await fetch(`/api/media/${hit.id}?type=movie`, { signal })
    const d = await res.json()
    return { ...base, runtime: d.runtime || 90 }
  } catch (e) {
    if (signal.aborted) throw e
    return { ...base, runtime: hit.mediaType === 'tv' ? 24 : 90 }
  }
}

export default function TitleSearch({
  isAdded,
  onAdd,
  onRemove,
  autoFocus,
}: TitleSearchProps) {
  const [query, setQuery] = useState('')
  const [results, setResults] = useState<CustomListItem[]>([])
  const [searching, setSearching] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [searched, setSearched] = useState(false)

  // Only the newest search may update the results
  const latest = useRef<AbortController | null>(null)

  const search = async (q: string = query) => {
    if (!q.trim()) return
    latest.current?.abort()
    const controller = new AbortController()
    latest.current = controller
    const { signal } = controller
    setSearching(true)
    setError(null)
    try {
      const res = await fetch(`/api/search?q=${encodeURIComponent(q)}`, {
        signal,
      })
      if (!res.ok) throw new Error('search failed')
      const data: SearchHit[] = await res.json()
      const found = await Promise.all(
        data.slice(0, 8).map((hit) => withDetails(hit, signal))
      )
      if (signal.aborted) return
      setResults(found)
    } catch {
      if (signal.aborted) return
      setResults([])
      setError("Search isn't working right now. Try again in a moment.")
    }
    setSearched(true)
    setSearching(false)
  }

  // Search as you type, once typing pauses
  useEffect(() => {
    const q = query.trim()
    if (q.length < 3) return
    const timer = setTimeout(() => search(q), 450)
    return () => clearTimeout(timer)
    // search is recreated each render; the query is what matters
  }, [query])

  return (
    <div className="flex flex-col gap-4">
      <form
        role="search"
        onSubmit={(e) => {
          e.preventDefault()
          search()
        }}
        className="flex gap-2"
      >
        <input
          type="search"
          aria-label="Search films or series to add"
          placeholder="Search films or series…"
          value={query}
          autoFocus={autoFocus}
          onChange={(e) => setQuery(e.target.value)}
          className="bg-ink border-line-strong text-parchment placeholder:text-parchment-faint focus:border-gold/60 min-w-0 flex-1 rounded-sm border px-4 py-2.5 font-sans text-sm focus:outline-none"
        />
        <Button type="submit" disabled={searching} variant="secondary">
          {searching ? 'Searching…' : 'Search'}
        </Button>
      </form>

      {error && (
        <p role="alert" className="text-rose font-sans text-sm">
          {error}
        </p>
      )}

      {searched && !searching && !error && results.length === 0 && (
        <p className="text-parchment-dim font-sans text-sm">
          No films or series match that. Try a shorter or different title.
        </p>
      )}

      {results.length > 0 && (
        <ul className="flex max-h-96 flex-col gap-2 overflow-y-auto">
          {results.map((item) => {
            const added = isAdded(item.tmdbId)
            return (
              <li
                key={item.tmdbId}
                className="border-line hover:border-line-strong flex items-center gap-3 rounded-sm border p-3 transition-colors"
              >
                {item.posterPath && (
                  <div className="relative aspect-[2/3] w-8 flex-shrink-0 overflow-hidden rounded-sm">
                    <Image
                      src={item.posterPath}
                      alt=""
                      fill
                      sizes="32px"
                      className="poster-color object-cover"
                    />
                  </div>
                )}
                <div className="min-w-0 flex-1">
                  <p className="text-parchment truncate font-sans text-sm">
                    {item.title}
                  </p>
                  <div className="mt-0.5 flex flex-wrap items-center gap-2">
                    <Badge variant={item.mediaType === 'tv' ? 'rose' : 'gold'}>
                      {item.mediaType === 'tv' ? 'Series' : 'Film'}
                    </Badge>
                    <span className="text-parchment-faint font-mono text-xs">
                      {item.releaseYear}
                    </span>
                    <span className="text-parchment-faint font-mono text-xs">
                      {item.episodes
                        ? `${item.episodes} eps · ${formatRuntime(item.runtime)}`
                        : formatRuntime(item.runtime)}
                    </span>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => (added ? onRemove(item.tmdbId) : onAdd(item))}
                  aria-label={`${added ? 'Remove' : 'Add'} ${item.title}`}
                  className={`min-h-[36px] flex-shrink-0 rounded-sm border px-3 font-mono text-xs transition-colors ${
                    added
                      ? 'border-rose/30 text-rose hover:bg-rose/10'
                      : 'border-gold/30 text-gold hover:bg-gold/10'
                  }`}
                >
                  {added ? 'Remove' : '+ Add'}
                </button>
              </li>
            )
          })}
        </ul>
      )}
    </div>
  )
}
