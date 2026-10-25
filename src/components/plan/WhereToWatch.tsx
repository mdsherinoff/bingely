'use client'

import { useEffect, useMemo, useState } from 'react'
import Image from 'next/image'
import type { WatchProviders, Provider } from '@/services/tmdb'

const REGION_KEY = 'bingely_region'

// Country from the browser's language ("en-GB" → GB); a saved choice wins
function initialRegion(): string {
  try {
    const saved = localStorage.getItem(REGION_KEY)
    if (saved) return saved
  } catch {}
  const fromLocale = navigator.language?.split('-')[1]?.toUpperCase()
  return fromLocale && /^[A-Z]{2}$/.test(fromLocale) ? fromLocale : 'US'
}

function ProviderRow({ label, providers }: { label: string; providers: Provider[] }) {
  if (providers.length === 0) return null
  return (
    <div className="flex flex-wrap items-center gap-2">
      <span className="text-parchment-faint w-14 font-mono text-[10px] tracking-widest">
        {label}
      </span>
      {providers.map((p) => (
        <span
          key={p.id}
          title={p.name}
          className="border-line bg-raised flex items-center gap-1.5 rounded-sm border py-1 pr-2 pl-1"
        >
          {p.logo && (
            <Image
              src={p.logo}
              alt=""
              width={20}
              height={20}
              className="rounded-[3px]"
            />
          )}
          <span className="text-parchment font-sans text-xs">{p.name}</span>
        </span>
      ))}
    </div>
  )
}

export default function WhereToWatch({ id, type }: { id: number; type: 'movie' | 'tv' }) {
  const [region, setRegion] = useState<string | null>(null)
  const [data, setData] = useState<WatchProviders | null>(null)
  const [failed, setFailed] = useState(false)

  useEffect(() => setRegion(initialRegion()), [])

  useEffect(() => {
    if (!region) return
    const controller = new AbortController()
    setFailed(false)
    fetch(`/api/media/${id}/providers?type=${type}&region=${region}`, {
      signal: controller.signal,
    })
      .then((r) => (r.ok ? r.json() : Promise.reject()))
      .then(setData)
      .catch((e) => {
        if (e?.name !== 'AbortError') setFailed(true)
      })
    return () => controller.abort()
  }, [id, type, region])

  const names = useMemo(() => {
    try {
      return new Intl.DisplayNames(undefined, { type: 'region' })
    } catch {
      return null
    }
  }, [])
  const regionName = (code: string) => names?.of(code) ?? code

  // Stay quiet if the lookup fails — this is a nice-to-have, not core
  if (failed || !data || !region) return null

  const empty = data.stream.length + data.rent.length + data.buy.length === 0
  const changeRegion = (code: string) => {
    setRegion(code)
    try {
      localStorage.setItem(REGION_KEY, code)
    } catch {}
  }

  return (
    <section
      aria-label="Where to watch"
      className="border-line flex flex-col gap-3 rounded-sm border p-4"
    >
      <div className="flex flex-wrap items-center justify-between gap-2">
        <p className="text-parchment-dim font-mono text-xs tracking-widest">
          WHERE TO WATCH
        </p>
        <label className="text-parchment-faint flex items-center gap-2 font-sans text-xs">
          <span className="sr-only">Country</span>
          <select
            value={region}
            onChange={(e) => changeRegion(e.target.value)}
            className="bg-ink border-line-strong text-parchment-dim focus:border-gold/60 max-w-[12rem] rounded-sm border px-2 py-1 font-sans text-xs focus:outline-none"
          >
            {(data.regions.includes(region) ? data.regions : [region, ...data.regions]).map(
              (code) => (
                <option key={code} value={code}>
                  {regionName(code)}
                </option>
              )
            )}
          </select>
        </label>
      </div>

      {empty ? (
        <p className="text-parchment-dim font-sans text-sm">
          Not available to stream, rent or buy in {regionName(region)} right now.
        </p>
      ) : (
        <div className="flex flex-col gap-2">
          <ProviderRow label="STREAM" providers={data.stream} />
          <ProviderRow label="RENT" providers={data.rent} />
          <ProviderRow label="BUY" providers={data.buy} />
        </div>
      )}

      <p className="text-parchment-faint font-sans text-[11px]">
        Availability from{' '}
        <a
          href="https://www.justwatch.com"
          target="_blank"
          rel="noopener noreferrer"
          className="hover:text-parchment-dim underline"
        >
          JustWatch
        </a>
        {data.link && (
          <>
            {' · '}
            <a
              href={data.link}
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-parchment-dim underline"
            >
              See all options
            </a>
          </>
        )}
      </p>
    </section>
  )
}
