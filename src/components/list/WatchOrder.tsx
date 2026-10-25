'use client'

import Image from 'next/image'
import { useState } from 'react'
import { CustomListItem } from '@/types/media'
import { Badge } from '@/components/ui'
import { formatRuntime, itemRuntime } from '@/lib/listItems'

interface WatchOrderProps {
  items: CustomListItem[]
  onChange: (items: CustomListItem[]) => void
}

function move<T>(list: T[], from: number, to: number): T[] {
  const next = [...list]
  const [item] = next.splice(from, 1)
  next.splice(to, 0, item)
  return next
}

// Absolute episode ↔ season + episode, from episodes-per-season counts
function toAbsolute(counts: number[], season: number, episode: number) {
  return counts.slice(0, season - 1).reduce((a, n) => a + n, 0) + episode
}

function fromAbsolute(counts: number[], absolute: number) {
  let left = absolute
  for (let i = 0; i < counts.length; i++) {
    if (left <= counts[i]) return { season: i + 1, episode: left }
    left -= counts[i]
  }
  return { season: 1, episode: 1 }
}

const selectClass =
  'bg-espresso border-line-strong text-parchment focus:border-gold/60 rounded-sm border px-2 py-1 font-mono text-xs focus:outline-none'

// Where to pick a series up, for people partway through it
function StartFrom({
  item,
  onChange,
}: {
  item: CustomListItem
  onChange: (startEpisode: number) => void
}) {
  const total = item.episodes ?? 0
  const start = item.startEpisode ?? 1
  const counts = item.seasons
  const label = `Where to start ${item.title}`

  if (counts && counts.reduce((a, n) => a + n, 0) >= total) {
    const pos = fromAbsolute(counts, start)
    const set = (season: number, episode: number) =>
      onChange(Math.min(total, toAbsolute(counts, season, episode)))
    return (
      <div
        role="group"
        aria-label={label}
        className="flex items-center gap-1.5"
      >
        <span className="text-parchment-faint font-sans text-xs">From</span>
        <select
          aria-label="Season"
          value={pos.season}
          onChange={(e) => set(Number(e.target.value), 1)}
          className={selectClass}
        >
          {counts.map((_, i) => (
            <option key={i} value={i + 1}>
              S{i + 1}
            </option>
          ))}
        </select>
        <select
          aria-label="Episode"
          value={pos.episode}
          onChange={(e) => set(pos.season, Number(e.target.value))}
          className={selectClass}
        >
          {Array.from({ length: counts[pos.season - 1] ?? 1 }, (_, i) => (
            <option key={i} value={i + 1}>
              E{i + 1}
            </option>
          ))}
        </select>
      </div>
    )
  }

  return (
    <label className="flex items-center gap-1.5">
      <span className="text-parchment-faint font-sans text-xs">
        From episode
      </span>
      <input
        type="number"
        min={1}
        max={total}
        value={start}
        aria-label={label}
        onChange={(e) => {
          const n = Math.floor(Number(e.target.value))
          if (n >= 1 && n <= total) onChange(n)
        }}
        className={`${selectClass} w-16`}
      />
    </label>
  )
}

// The list in the order it'll be watched: drag rows, or use the arrow
// buttons (keyboard and touch friendly), to rearrange
export default function WatchOrder({ items, onChange }: WatchOrderProps) {
  const [dragging, setDragging] = useState<number | null>(null)
  const [over, setOver] = useState<number | null>(null)
  const [announcement, setAnnouncement] = useState('')

  const moveTo = (from: number, to: number) => {
    if (to < 0 || to >= items.length || from === to) return
    onChange(move(items, from, to))
    setAnnouncement(
      `${items[from].title} moved to position ${to + 1} of ${items.length}`
    )
  }

  const remove = (index: number) => {
    onChange(items.filter((_, i) => i !== index))
    setAnnouncement(`${items[index].title} removed`)
  }

  const setStart = (index: number, startEpisode: number) =>
    onChange(
      items.map((it, i) =>
        i === index
          ? { ...it, startEpisode: startEpisode > 1 ? startEpisode : undefined }
          : it
      )
    )

  const sortBy = (label: string, key: (item: CustomListItem) => number) => {
    // Stable: ties keep the order they were in
    const sorted = items
      .map((item, i) => ({ item, i }))
      .sort((a, b) => key(a.item) - key(b.item) || a.i - b.i)
      .map(({ item }) => item)
    onChange(sorted)
    setAnnouncement(`List sorted ${label}`)
  }

  const iconButton =
    'text-parchment-faint hover:text-gold disabled:hover:text-parchment-faint flex h-9 w-9 items-center justify-center rounded-sm font-mono text-sm transition-colors disabled:opacity-25'

  return (
    <div className="flex flex-col gap-3">
      <p aria-live="polite" className="sr-only">
        {announcement}
      </p>

      {items.length >= 3 && (
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-parchment-faint font-sans text-xs">Sort:</span>
          {[
            {
              label: 'by release year',
              text: 'Release order',
              key: (i: CustomListItem) => Number(i.releaseYear) || 9999,
            },
            {
              label: 'shortest first',
              text: 'Shortest first',
              key: (i: CustomListItem) => itemRuntime(i),
            },
            {
              label: 'films first',
              text: 'Films first',
              key: (i: CustomListItem) => (i.mediaType === 'movie' ? 0 : 1),
            },
          ].map((s) => (
            <button
              key={s.text}
              type="button"
              onClick={() => sortBy(s.label, s.key)}
              className="border-line text-parchment-dim hover:border-gold/50 hover:text-parchment min-h-[32px] rounded-sm border px-2.5 font-sans text-xs transition-colors"
            >
              {s.text}
            </button>
          ))}
        </div>
      )}

      <ol className="flex flex-col gap-2">
        {items.map((item, i) => {
          const isSeries = item.mediaType === 'tv'
          return (
            <li
              key={item.tmdbId}
              draggable
              onDragStart={(e) => {
                setDragging(i)
                e.dataTransfer.effectAllowed = 'move'
              }}
              onDragOver={(e) => {
                e.preventDefault()
                setOver(i)
              }}
              onDragLeave={() => setOver((o) => (o === i ? null : o))}
              onDrop={(e) => {
                e.preventDefault()
                if (dragging !== null) moveTo(dragging, i)
                setDragging(null)
                setOver(null)
              }}
              onDragEnd={() => {
                setDragging(null)
                setOver(null)
              }}
              className={`bg-espresso flex flex-wrap items-center gap-x-3 gap-y-2 rounded-sm border p-2 pl-1 transition-colors sm:flex-nowrap ${
                over === i && dragging !== null && dragging !== i
                  ? 'border-gold'
                  : 'border-line'
              } ${dragging === i ? 'opacity-50' : ''}`}
            >
              <span
                aria-hidden
                title="Drag to reorder"
                className="text-parchment-faint hidden cursor-grab px-1 font-mono text-sm select-none sm:block"
              >
                ⋮⋮
              </span>
              <span className="text-parchment-faint w-5 flex-shrink-0 pl-1 font-mono text-xs tabular-nums sm:pl-0">
                {String(i + 1).padStart(2, '0')}
              </span>
              {item.posterPath && (
                <div className="relative aspect-[2/3] w-7 flex-shrink-0 overflow-hidden rounded-sm">
                  <Image
                    src={item.posterPath}
                    alt=""
                    fill
                    sizes="28px"
                    className="object-cover"
                  />
                </div>
              )}
              <div className="min-w-0 flex-1">
                <p className="text-parchment truncate font-sans text-sm">
                  {item.title}
                </p>
                <div className="mt-0.5 flex flex-wrap items-center gap-x-2 gap-y-1">
                  <Badge variant={isSeries ? 'rose' : 'gold'}>
                    {isSeries ? 'Series' : 'Film'}
                  </Badge>
                  <span className="text-parchment-faint font-mono text-xs">
                    {formatRuntime(itemRuntime(item))}
                  </span>
                  {isSeries && (item.episodes ?? 0) > 1 && (
                    <StartFrom item={item} onChange={(n) => setStart(i, n)} />
                  )}
                </div>
              </div>
              <div className="ml-auto flex flex-shrink-0 items-center">
                <button
                  type="button"
                  onClick={() => moveTo(i, i - 1)}
                  disabled={i === 0}
                  aria-label={`Move ${item.title} up`}
                  className={iconButton}
                >
                  ↑
                </button>
                <button
                  type="button"
                  onClick={() => moveTo(i, i + 1)}
                  disabled={i === items.length - 1}
                  aria-label={`Move ${item.title} down`}
                  className={iconButton}
                >
                  ↓
                </button>
                <button
                  type="button"
                  onClick={() => remove(i)}
                  aria-label={`Remove ${item.title}`}
                  className={`${iconButton} hover:text-rose`}
                >
                  ✕
                </button>
              </div>
            </li>
          )
        })}
      </ol>
    </div>
  )
}
