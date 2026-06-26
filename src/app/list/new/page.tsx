'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useCustomLists } from '@/hooks/useCustomLists'
import { CustomListItem } from '@/types/media'
import { Button, Badge } from '@/components/ui'
import Link from 'next/link'

export default function NewListPage() {
  const router = useRouter()
  const { createList } = useCustomLists()

  const [listTitle, setListTitle] = useState('')
  const [searchQuery, setSearchQuery] = useState('')
  const [searchResults, setSearchResults] = useState<CustomListItem[]>([])
  const [searching, setSearching] = useState(false)
  const [items, setItems] = useState<CustomListItem[]>([])

  const handleSearch = async () => {
    if (!searchQuery.trim()) return
    setSearching(true)
    try {
      const res = await fetch(
        `/api/search?q=${encodeURIComponent(searchQuery)}`
      )
      const data = await res.json()
      // Fetch runtime for each result
      const withRuntime: CustomListItem[] = await Promise.all(
        data
          .slice(0, 8)
          .map(
            async (item: {
              id: number
              title: string
              mediaType: string
              posterPath: string | null
              releaseYear: string
            }) => {
              try {
                const detail = await fetch(
                  `/api/media/${item.id}?type=${item.mediaType}`
                )
                const d = await detail.json()
                return {
                  tmdbId: item.id,
                  title: item.title,
                  mediaType: item.mediaType,
                  posterPath: item.posterPath,
                  runtime: d.runtime ?? d.episodeRuntime ?? 90,
                  releaseYear: item.releaseYear,
                }
              } catch {
                return {
                  tmdbId: item.id,
                  title: item.title,
                  mediaType: item.mediaType,
                  posterPath: item.posterPath,
                  runtime: 90,
                  releaseYear: item.releaseYear,
                }
              }
            }
          )
      )
      setSearchResults(withRuntime)
    } finally {
      setSearching(false)
    }
  }

  const addItem = (item: CustomListItem) => {
    if (items.find((i) => i.tmdbId === item.tmdbId)) return
    setItems((prev) => [...prev, item])
  }

  const removeItem = (tmdbId: number) => {
    setItems((prev) => prev.filter((i) => i.tmdbId !== tmdbId))
  }

  const handleCreate = () => {
    if (!listTitle.trim() || items.length === 0) return
    const list = createList(listTitle, items)
    router.push(`/list/${list.id}/plan`)
  }

  const totalRuntime = items.reduce((acc, i) => acc + i.runtime, 0)
  const totalHours = Math.round((totalRuntime / 60) * 10) / 10

  return (
    <main id="main-content" className="bg-espresso min-h-screen px-6 py-12">
      <div className="mx-auto flex max-w-4xl flex-col gap-10">
        {/* Header */}
        <div className="flex flex-col gap-3">
          <Link
            href="/"
            className="text-parchment/30 hover:text-parchment/60 w-fit font-mono text-xs tracking-widest transition-colors"
          >
            ← BACK
          </Link>
          <p className="text-gold/60 font-mono text-xs tracking-widest">
            CUSTOM LIST
          </p>
          <h1 className="font-display text-parchment text-5xl leading-none">
            Build your list
          </h1>
          <p className="font-body text-parchment/40 italic">
            Add any mix of films and series, then plan them all at once.
          </p>
        </div>

        {/* List title */}
        <div className="flex flex-col gap-2">
          <label className="text-parchment/40 font-mono text-xs tracking-widest uppercase">
            List name
          </label>
          <input
            type="text"
            placeholder="e.g. My 2025 Watchlist, Date Night Films..."
            value={listTitle}
            onChange={(e) => setListTitle(e.target.value)}
            className="bg-ink border-gold/20 text-parchment font-body placeholder:text-parchment/20 focus:border-gold/50 max-w-lg rounded-sm border px-4 py-3 text-lg focus:outline-none"
          />
        </div>

        <div className="grid gap-10 md:grid-cols-2">
          {/* Left — search and add */}
          <div className="flex flex-col gap-4">
            <h2 className="font-display text-parchment text-2xl">Add titles</h2>

            <div className="flex gap-2">
              <input
                type="text"
                placeholder="Search films or series..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                className="bg-ink border-gold/20 text-parchment font-body placeholder:text-parchment/20 focus:border-gold/50 flex-1 rounded-sm border px-4 py-2.5 text-sm focus:outline-none"
              />
              <Button
                onClick={handleSearch}
                disabled={searching}
                variant="secondary"
              >
                {searching ? '...' : 'Search'}
              </Button>
            </div>

            {/* Search results */}
            {searchResults.length > 0 && (
              <div className="flex max-h-96 flex-col gap-2 overflow-y-auto">
                {searchResults.map((item) => {
                  const already = items.find((i) => i.tmdbId === item.tmdbId)
                  return (
                    <div
                      key={item.tmdbId}
                      className="border-gold/10 hover:border-gold/20 flex items-center gap-3 rounded-sm border p-3 transition-colors"
                    >
                      {item.posterPath && (
                        <img
                          src={item.posterPath}
                          alt={item.title}
                          className="aspect-[2/3] w-8 flex-shrink-0 rounded-sm object-cover"
                        />
                      )}
                      <div className="min-w-0 flex-1">
                        <p className="font-body text-parchment truncate text-sm">
                          {item.title}
                        </p>
                        <div className="mt-0.5 flex items-center gap-2">
                          <Badge
                            variant={item.mediaType === 'tv' ? 'rose' : 'gold'}
                          >
                            {item.mediaType === 'tv' ? 'Series' : 'Film'}
                          </Badge>
                          <span className="text-parchment/30 font-mono text-xs">
                            {item.releaseYear}
                          </span>
                          <span className="text-parchment/30 font-mono text-xs">
                            {item.runtime}min
                          </span>
                        </div>
                      </div>
                      <button
                        onClick={() =>
                          already ? removeItem(item.tmdbId) : addItem(item)
                        }
                        className={`flex-shrink-0 rounded-sm border px-3 py-1.5 font-mono text-xs transition-colors ${
                          already
                            ? 'border-rose/30 text-rose/70 hover:bg-rose/10'
                            : 'border-gold/30 text-gold/70 hover:bg-gold/10'
                        } `}
                      >
                        {already ? 'Remove' : '+ Add'}
                      </button>
                    </div>
                  )
                })}
              </div>
            )}
          </div>

          {/* Right — current list */}
          <div className="flex flex-col gap-4">
            <div className="flex items-center justify-between">
              <h2 className="font-display text-parchment text-2xl">
                Your list
              </h2>
              {items.length > 0 && (
                <p className="text-parchment/30 font-mono text-xs">
                  {items.length} titles · {totalHours}h
                </p>
              )}
            </div>

            {items.length === 0 ? (
              <div className="border-gold/10 flex flex-col items-center gap-3 rounded-sm border p-8">
                <span className="text-gold/20 font-mono text-2xl">◎</span>
                <p className="font-body text-parchment/30 text-center text-sm">
                  Search and add titles to build your list
                </p>
              </div>
            ) : (
              <div className="flex flex-col gap-2">
                {items.map((item, i) => (
                  <div
                    key={item.tmdbId}
                    className="border-gold/10 flex items-center gap-3 rounded-sm border p-3"
                  >
                    <span className="text-parchment/20 w-5 flex-shrink-0 font-mono text-xs">
                      {String(i + 1).padStart(2, '0')}
                    </span>
                    {item.posterPath && (
                      <img
                        src={item.posterPath}
                        alt={item.title}
                        className="aspect-[2/3] w-6 flex-shrink-0 rounded-sm object-cover"
                      />
                    )}
                    <div className="min-w-0 flex-1">
                      <p className="font-body text-parchment truncate text-sm">
                        {item.title}
                      </p>
                      <p className="text-parchment/30 font-mono text-xs">
                        {item.runtime}min
                      </p>
                    </div>
                    <button
                      onClick={() => removeItem(item.tmdbId)}
                      className="text-parchment/20 hover:text-rose/60 flex-shrink-0 font-mono text-xs transition-colors"
                    >
                      ✕
                    </button>
                  </div>
                ))}

                {/* Total */}
                <div className="border-gold/10 flex justify-between border-t pt-3">
                  <p className="text-parchment/30 font-mono text-xs tracking-widest">
                    TOTAL
                  </p>
                  <p className="text-gold/60 font-mono text-xs">
                    {totalHours}h
                  </p>
                </div>
              </div>
            )}

            {/* Create button */}
            <Button
              onClick={handleCreate}
              disabled={!listTitle.trim() || items.length === 0}
              className="mt-2 w-full"
            >
              Plan this list →
            </Button>
          </div>
        </div>
      </div>
    </main>
  )
}
