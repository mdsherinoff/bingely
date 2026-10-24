'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useCustomLists } from '@/hooks/useCustomLists'
import { CustomList } from '@/types/media'

function describe(list: CustomList): string {
  const films = list.items.filter((i) => i.mediaType === 'movie').length
  const series = list.items.length - films
  const parts = []
  if (films) parts.push(`${films} film${films === 1 ? '' : 's'}`)
  if (series) parts.push(`${series} series`)
  const hours = Math.round(list.items.reduce((a, i) => a + i.runtime, 0) / 60)
  return `${parts.join(' · ')} · ${hours}h`
}

export default function ListsPage() {
  const { lists, ready, deleteList } = useCustomLists()
  const [confirming, setConfirming] = useState<string | null>(null)

  const sorted = [...lists].sort((a, b) =>
    b.createdAt.localeCompare(a.createdAt)
  )

  return (
    <main id="main-content" className="bg-espresso min-h-screen px-6 py-12">
      <div className="mx-auto flex max-w-3xl flex-col gap-10">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div className="flex flex-col gap-2">
            <p className="text-gold font-mono text-xs tracking-widest">
              MY LISTS
            </p>
            <h1 className="font-display text-parchment text-5xl leading-none">
              Your watchlists
            </h1>
            <p className="text-parchment-dim font-sans">
              Saved on this device. Share a plan to send one to someone else.
            </p>
          </div>
          <Link
            href="/list/new"
            className="bg-gold text-espresso inline-flex min-h-[44px] items-center rounded-sm px-5 font-sans text-sm font-semibold transition-colors hover:bg-[#ecb95c]"
          >
            + New list
          </Link>
        </div>

        {!ready ? (
          <div className="flex flex-col gap-3" aria-busy="true">
            {[0, 1].map((i) => (
              <div key={i} className="bg-ink h-20 animate-pulse rounded-sm" />
            ))}
          </div>
        ) : sorted.length === 0 ? (
          <div className="border-line flex flex-col items-center gap-4 rounded-sm border px-6 py-14 text-center">
            <span aria-hidden className="text-gold/60 font-mono text-3xl">
              ◎
            </span>
            <p className="text-parchment font-sans text-lg">No lists yet</p>
            <p className="text-parchment-dim max-w-sm font-sans text-sm">
              Mix any films and series into one list and Bingely will plan the
              whole thing around your free time.
            </p>
            <div className="flex flex-wrap justify-center gap-3">
              <Link
                href="/list/new"
                className="bg-gold text-espresso inline-flex min-h-[44px] items-center rounded-sm px-5 font-sans text-sm font-semibold"
              >
                Build your first list
              </Link>
              <Link
                href="/challenges"
                className="border-line-strong text-parchment hover:border-gold/60 inline-flex min-h-[44px] items-center rounded-sm border px-5 font-sans text-sm transition-colors"
              >
                Browse challenges
              </Link>
            </div>
          </div>
        ) : (
          <ul className="flex flex-col gap-3">
            {sorted.map((list) => (
              <li
                key={list.id}
                className="border-line bg-ink flex flex-wrap items-center gap-4 rounded-sm border p-4"
              >
                <div className="min-w-0 flex-1">
                  <p className="text-parchment truncate font-sans text-base font-medium">
                    {list.title}
                  </p>
                  <p className="text-parchment-faint font-mono text-xs tabular-nums">
                    {describe(list)}
                  </p>
                </div>

                {confirming === list.id ? (
                  <div className="flex items-center gap-2">
                    <span className="text-parchment-dim font-sans text-sm">
                      Delete this list?
                    </span>
                    <button
                      onClick={() => {
                        deleteList(list.id)
                        setConfirming(null)
                      }}
                      className="border-rose/50 text-rose hover:bg-rose/10 min-h-[40px] rounded-sm border px-3 font-sans text-sm transition-colors"
                    >
                      Delete
                    </button>
                    <button
                      onClick={() => setConfirming(null)}
                      className="text-parchment-dim hover:text-parchment min-h-[40px] px-2 font-sans text-sm transition-colors"
                    >
                      Keep
                    </button>
                  </div>
                ) : (
                  <div className="flex items-center gap-2">
                    <Link
                      href={`/list/${list.id}/plan`}
                      className="border-line-strong text-parchment hover:border-gold/60 inline-flex min-h-[40px] items-center rounded-sm border px-4 font-sans text-sm transition-colors"
                    >
                      Plan it →
                    </Link>
                    <button
                      onClick={() => setConfirming(list.id)}
                      aria-label={`Delete ${list.title}`}
                      className="text-parchment-faint hover:text-rose min-h-[40px] px-2 font-sans text-sm transition-colors"
                    >
                      Delete
                    </button>
                  </div>
                )}
              </li>
            ))}
          </ul>
        )}
      </div>
    </main>
  )
}
