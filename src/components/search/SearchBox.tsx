'use client'

import { useEffect, useId, useRef, useState } from 'react'
import Image from 'next/image'
import { useRouter } from 'next/navigation'
import { MediaItem } from '@/types/media'

const RECENT_KEY = 'bingely_recent_searches'
const MAX_RECENT = 6

function readRecent(): string[] {
  try {
    return JSON.parse(localStorage.getItem(RECENT_KEY) || '[]')
  } catch {
    return []
  }
}

function saveRecent(query: string) {
  const q = query.trim()
  if (!q) return
  try {
    const next = [
      q,
      ...readRecent().filter((r) => r.toLowerCase() !== q.toLowerCase()),
    ]
    localStorage.setItem(RECENT_KEY, JSON.stringify(next.slice(0, MAX_RECENT)))
  } catch {}
}

type Option =
  | { kind: 'result'; item: MediaItem }
  | { kind: 'recent'; query: string }
  | { kind: 'all'; query: string }

interface SearchBoxProps {
  size?: 'md' | 'lg'
  placeholder?: string
  autoFocus?: boolean
  onNavigate?: () => void
  // Adds a button next to the input (used on the landing page)
  submitLabel?: string
}

// Search that suggests as you type, remembers recent searches, and works
// fully from the keyboard (an ARIA combobox)
export default function SearchBox({
  size = 'md',
  placeholder = 'Search films, series, anime…',
  autoFocus,
  onNavigate,
  submitLabel,
}: SearchBoxProps) {
  const router = useRouter()
  const listId = useId()
  const wrapper = useRef<HTMLDivElement>(null)
  const [query, setQuery] = useState('')
  const [open, setOpen] = useState(false)
  const [results, setResults] = useState<MediaItem[]>([])
  const [recent, setRecent] = useState<string[]>([])
  const [loading, setLoading] = useState(false)
  const [active, setActive] = useState(-1)

  const trimmed = query.trim()

  // Suggestions, debounced so we don't search on every keystroke; stale
  // requests are cancelled
  useEffect(() => {
    if (trimmed.length < 2) {
      setResults([])
      setLoading(false)
      return
    }
    const controller = new AbortController()
    setLoading(true)
    const timer = setTimeout(() => {
      fetch(`/api/search?q=${encodeURIComponent(trimmed)}`, {
        signal: controller.signal,
      })
        .then((r) => (r.ok ? r.json() : []))
        .then((data: MediaItem[]) => {
          setResults(Array.isArray(data) ? data.slice(0, 6) : [])
          setLoading(false)
        })
        .catch((e) => {
          if (e?.name !== 'AbortError') setLoading(false)
        })
    }, 250)
    return () => {
      clearTimeout(timer)
      controller.abort()
    }
  }, [trimmed])

  // Close when clicking anywhere else
  useEffect(() => {
    const onDown = (e: MouseEvent) => {
      if (!wrapper.current?.contains(e.target as Node)) setOpen(false)
    }
    document.addEventListener('mousedown', onDown)
    return () => document.removeEventListener('mousedown', onDown)
  }, [])

  const options: Option[] =
    trimmed.length >= 2
      ? [
          ...results.map((item) => ({ kind: 'result' as const, item })),
          { kind: 'all' as const, query: trimmed },
        ]
      : recent.map((q) => ({ kind: 'recent' as const, query: q }))

  useEffect(() => setActive(-1), [trimmed, results.length])

  const finish = () => {
    setOpen(false)
    setQuery('')
    onNavigate?.()
  }

  const searchAll = (q: string) => {
    if (!q.trim()) return
    saveRecent(q)
    router.push(`/search?q=${encodeURIComponent(q.trim())}`)
    finish()
  }

  const choose = (option: Option) => {
    if (option.kind === 'result') {
      saveRecent(option.item.title)
      router.push(`/plan/${option.item.id}?type=${option.item.mediaType}`)
      finish()
    } else if (option.kind === 'recent') {
      setQuery(option.query)
    } else {
      searchAll(option.query)
    }
  }

  const onKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault()
      setOpen(true)
      setActive((i) => (options.length ? (i + 1) % options.length : -1))
    } else if (e.key === 'ArrowUp') {
      e.preventDefault()
      setActive((i) =>
        options.length ? (i <= 0 ? options.length - 1 : i - 1) : -1
      )
    } else if (e.key === 'Escape') {
      setOpen(false)
    } else if (e.key === 'Enter') {
      e.preventDefault()
      if (open && active >= 0 && options[active]) choose(options[active])
      else searchAll(query)
    }
  }

  const showList = open && options.length > 0
  const pad = size === 'lg' ? 'px-4 py-3 text-base' : 'px-4 py-2 text-sm'

  return (
    <div
      ref={wrapper}
      className="relative flex w-full flex-col gap-3 sm:flex-row"
    >
      <input
        type="text"
        role="combobox"
        aria-label="Search films, series, and anime"
        aria-expanded={showList}
        aria-controls={listId}
        aria-autocomplete="list"
        aria-activedescendant={active >= 0 ? `${listId}-${active}` : undefined}
        autoComplete="off"
        autoFocus={autoFocus}
        placeholder={placeholder}
        value={query}
        onChange={(e) => {
          setQuery(e.target.value)
          setOpen(true)
        }}
        onFocus={() => {
          setRecent(readRecent())
          setOpen(true)
        }}
        onKeyDown={onKeyDown}
        className={`bg-ink border-line-strong text-parchment placeholder:text-parchment-faint focus:border-gold/60 w-full min-w-0 flex-1 rounded-sm border font-sans transition-colors focus:outline-none ${pad}`}
      />
      {submitLabel && (
        <button
          type="button"
          onClick={() => searchAll(query)}
          className="bg-gold text-espresso min-h-[44px] rounded-sm px-7 font-sans text-sm font-semibold transition-colors hover:bg-[#ecb95c] sm:flex-shrink-0"
        >
          {submitLabel}
        </button>
      )}

      {showList && (
        <ul
          id={listId}
          role="listbox"
          aria-label={trimmed.length >= 2 ? 'Suggestions' : 'Recent searches'}
          className="bg-ink border-line-strong absolute top-full right-0 left-0 z-50 mt-1 max-h-[70vh] overflow-y-auto rounded-sm border py-1 text-left shadow-xl"
        >
          {trimmed.length < 2 && (
            <li
              role="presentation"
              className="text-parchment-faint flex items-center justify-between px-4 py-1.5 font-mono text-[10px] tracking-widest"
            >
              <span>RECENT</span>
              <button
                type="button"
                onMouseDown={(e) => e.preventDefault()}
                onClick={() => {
                  try {
                    localStorage.removeItem(RECENT_KEY)
                  } catch {}
                  setRecent([])
                }}
                className="hover:text-parchment-dim font-sans text-xs tracking-normal normal-case"
              >
                Clear
              </button>
            </li>
          )}
          {options.map((option, i) => (
            <li
              key={
                option.kind === 'result'
                  ? `r-${option.item.mediaType}-${option.item.id}`
                  : `${option.kind}-${option.query}`
              }
              id={`${listId}-${i}`}
              role="option"
              aria-selected={i === active}
              onMouseDown={(e) => e.preventDefault()}
              onMouseEnter={() => setActive(i)}
              onClick={() => choose(option)}
              className={`flex cursor-pointer items-center gap-3 px-4 py-2 ${
                i === active ? 'bg-raised' : ''
              }`}
            >
              {option.kind === 'result' ? (
                <>
                  <div className="bg-raised relative aspect-[2/3] w-8 flex-shrink-0 overflow-hidden rounded-sm">
                    {option.item.posterPath && (
                      <Image
                        src={option.item.posterPath}
                        alt=""
                        fill
                        sizes="32px"
                        className="object-cover"
                      />
                    )}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-parchment truncate font-sans text-sm">
                      {option.item.title}
                    </p>
                    <p className="text-parchment-faint font-mono text-[11px]">
                      {option.item.mediaType === 'tv' ? 'Series' : 'Film'} ·{' '}
                      {option.item.releaseYear}
                    </p>
                  </div>
                </>
              ) : option.kind === 'recent' ? (
                <>
                  <span
                    aria-hidden
                    className="text-parchment-faint font-mono text-xs"
                  >
                    ↺
                  </span>
                  <span className="text-parchment-dim font-sans text-sm">
                    {option.query}
                  </span>
                </>
              ) : (
                <span className="text-gold font-sans text-sm">
                  {loading
                    ? 'Searching…'
                    : `See all results for “${option.query}”`}
                </span>
              )}
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
