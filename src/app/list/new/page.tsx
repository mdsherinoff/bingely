'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useCustomLists } from '@/hooks/useCustomLists'
import { CustomListItem } from '@/types/media'
import { Button } from '@/components/ui'
import Link from 'next/link'
import TitleSearch from '@/components/list/TitleSearch'
import WatchOrder from '@/components/list/WatchOrder'
import { itemRuntime } from '@/lib/listItems'

export default function NewListPage() {
  const router = useRouter()
  const { createList } = useCustomLists()

  const [listTitle, setListTitle] = useState('')
  const [items, setItems] = useState<CustomListItem[]>([])

  const addItem = (item: CustomListItem) =>
    setItems((prev) =>
      prev.some((i) => i.tmdbId === item.tmdbId) ? prev : [...prev, item]
    )

  const removeItem = (tmdbId: number) => {
    setItems((prev) => prev.filter((i) => i.tmdbId !== tmdbId))
  }

  const handleCreate = () => {
    if (!listTitle.trim() || items.length === 0) return
    const list = createList(listTitle, items)
    router.push(`/list/${list.id}/plan`)
  }

  const totalRuntime = items.reduce((acc, i) => acc + itemRuntime(i), 0)
  const totalHours = Math.round((totalRuntime / 60) * 10) / 10

  return (
    <main id="main-content" className="bg-espresso min-h-screen px-6 py-12">
      <div className="mx-auto flex max-w-4xl flex-col gap-10">
        {/* Header */}
        <div className="flex flex-col gap-3">
          <Link
            href="/library"
            className="text-parchment-faint hover:text-parchment-dim w-fit font-mono text-xs tracking-widest transition-colors"
          >
            ← LIBRARY
          </Link>
          <p className="text-gold font-mono text-xs tracking-widest">
            CUSTOM LIST
          </p>
          <h1 className="font-display text-parchment text-5xl leading-none">
            Build your list
          </h1>
          <p className="text-parchment-dim font-sans">
            Add any mix of films and series in the order you want to watch them,
            then plan them all at once.
          </p>
        </div>

        {/* List title */}
        <div className="flex flex-col gap-2">
          <label
            htmlFor="list-name"
            className="text-parchment-dim font-mono text-xs tracking-widest uppercase"
          >
            List name
          </label>
          <input
            id="list-name"
            type="text"
            placeholder={`e.g. My ${new Date().getFullYear()} Watchlist, Date Night Films…`}
            value={listTitle}
            onChange={(e) => setListTitle(e.target.value)}
            className="bg-ink border-line-strong text-parchment placeholder:text-parchment-faint focus:border-gold/60 max-w-lg rounded-sm border px-4 py-3 font-sans text-lg focus:outline-none"
          />
        </div>

        <div className="grid gap-10 md:grid-cols-2">
          {/* Left — search and add */}
          <div className="flex flex-col gap-4">
            <h2 className="font-display text-parchment text-2xl">Add titles</h2>

            <TitleSearch
              isAdded={(id) => items.some((i) => i.tmdbId === id)}
              onAdd={addItem}
              onRemove={removeItem}
            />
          </div>

          {/* Right — current list */}
          <div className="flex flex-col gap-4">
            <div className="flex items-center justify-between">
              <h2 className="font-display text-parchment text-2xl">
                Your list
              </h2>
              {items.length > 0 && (
                <p className="text-parchment-faint font-mono text-xs">
                  {items.length} titles · {totalHours}h
                </p>
              )}
            </div>

            {items.length === 0 ? (
              <div className="border-line flex flex-col items-center gap-3 rounded-sm border p-8">
                <span className="text-gold/20 font-mono text-2xl">◎</span>
                <p className="text-parchment-faint text-center font-mono text-sm">
                  Search and add titles to build your list
                </p>
              </div>
            ) : (
              <div className="flex flex-col gap-2">
                <p className="text-parchment-faint font-sans text-xs">
                  Watched top to bottom. Drag or use the arrows to change the
                  order.
                </p>
                <WatchOrder items={items} onChange={setItems} />

                {/* Total */}
                <div className="border-line flex justify-between border-t pt-3">
                  <p className="text-parchment-faint font-mono text-xs tracking-widest">
                    TOTAL
                  </p>
                  <p className="text-gold font-mono text-xs">{totalHours}h</p>
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
            {(!listTitle.trim() || items.length === 0) && (
              <p className="text-parchment-faint -mt-1 text-center font-sans text-xs">
                {items.length === 0 && !listTitle.trim()
                  ? 'Name your list and add at least one title'
                  : items.length === 0
                    ? 'Add at least one title'
                    : 'Give your list a name'}
              </p>
            )}
          </div>
        </div>
      </div>
    </main>
  )
}
