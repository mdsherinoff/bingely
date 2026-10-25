'use client'

import { use, useMemo, useState } from 'react'
import { useSearchParams } from 'next/navigation'
import { useResolvedList } from '@/hooks/useResolvedList'
import { useCustomLists } from '@/hooks/useCustomLists'
import AvailabilityForm from '@/components/plan/AvailabilityForm'
import TitleSearch from '@/components/list/TitleSearch'
import WatchOrder from '@/components/list/WatchOrder'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui'
import { AvailabilityConfig, CustomListItem } from '@/types/media'
import { decodeState, toQuery } from '@/lib/urlState'
import { itemRuntime, toSharedItem } from '@/lib/listItems'

interface Draft {
  title: string
  items: CustomListItem[]
}

export default function ListPlanPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = use(params)
  const { list, saved, ready } = useResolvedList(id)
  const { createList, updateList } = useCustomLists()
  const router = useRouter()
  const searchParams = useSearchParams()

  const rawConfig = searchParams.get('config')
  const initialConfig: AvailabilityConfig | null = useMemo(() => {
    if (!rawConfig) return null
    return decodeState<AvailabilityConfig>(rawConfig)
  }, [rawConfig])

  // The list as it's being edited here. A list in this device's library
  // saves every change straight away; one opened from a shared link is
  // edited for this plan only, until it's saved as your own copy.
  const [draft, setDraft] = useState<Draft | null>(null)
  if (list && draft === null) setDraft({ title: list.title, items: list.items })

  const [adding, setAdding] = useState(false)
  const [renaming, setRenaming] = useState(false)
  const [titleInput, setTitleInput] = useState('')

  const change = (next: Partial<Draft>) => {
    if (!draft) return
    setDraft({ ...draft, ...next })
    if (saved) updateList(id, next)
  }

  const exactItems = useMemo(
    () => draft?.items.map(toSharedItem) ?? [],
    [draft?.items]
  )

  if (!ready || (list && !draft)) {
    return (
      <main className="bg-espresso flex min-h-screen items-center justify-center">
        <p className="text-parchment-faint animate-pulse font-mono text-xs tracking-widest">
          LOADING...
        </p>
      </main>
    )
  }

  if (!list || !draft) {
    return (
      <main className="bg-espresso flex min-h-screen flex-col items-center justify-center gap-4">
        <p className="text-parchment-dim font-sans">List not found</p>
        <Button onClick={() => router.push('/list/new')} variant="secondary">
          Create a new list
        </Button>
      </main>
    )
  }

  const { title, items } = draft
  const totalRuntime = items.reduce((acc, i) => acc + itemRuntime(i), 0)
  const avgRuntime = items.length ? Math.round(totalRuntime / items.length) : 0
  const hasTV = items.some((i) => i.mediaType === 'tv')

  const saveCopy = () => {
    const copy = createList(title, items)
    router.replace(`/list/${copy.id}/plan${toQuery({ config: rawConfig })}`)
  }

  const commitTitle = () => {
    const next = titleInput.trim()
    if (next) change({ title: next })
    setRenaming(false)
  }

  return (
    <main id="main-content" className="bg-espresso min-h-screen px-6 py-12">
      <div className="mx-auto flex max-w-4xl flex-col gap-10">
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
          {renaming ? (
            <form
              onSubmit={(e) => {
                e.preventDefault()
                commitTitle()
              }}
              className="flex flex-wrap items-center gap-2"
            >
              <input
                autoFocus
                onFocus={(e) => e.target.select()}
                aria-label="List name"
                value={titleInput}
                onChange={(e) => setTitleInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Escape' && setRenaming(false)}
                className="bg-ink border-line-strong text-parchment focus:border-gold/60 font-display min-w-0 flex-1 rounded-sm border px-3 py-2 text-3xl focus:outline-none"
              />
              <Button type="submit" variant="secondary">
                Save name
              </Button>
            </form>
          ) : (
            <div className="flex flex-wrap items-end gap-x-4 gap-y-2">
              <h1 className="font-display text-parchment text-5xl leading-none">
                {title}
              </h1>
              <button
                type="button"
                onClick={() => {
                  setTitleInput(title)
                  setRenaming(true)
                }}
                className="text-parchment-faint hover:text-gold min-h-[32px] font-sans text-xs transition-colors"
              >
                ✎ Rename
              </button>
            </div>
          )}
          <p className="text-parchment-dim font-sans">
            {items.length} title{items.length === 1 ? '' : 's'} ·{' '}
            {Math.round(totalRuntime / 60)}h to watch
          </p>
        </div>

        {!saved && (
          <div className="border-gold/30 bg-ink flex flex-col gap-3 rounded-sm border p-4 sm:flex-row sm:items-center sm:justify-between">
            <p className="text-parchment-dim font-sans text-sm">
              This list was shared with you. Changes you make here shape this
              plan only — save it to keep your own copy.
            </p>
            <Button
              variant="secondary"
              onClick={saveCopy}
              disabled={items.length === 0}
              className="flex-shrink-0"
            >
              Save to my library
            </Button>
          </div>
        )}

        <section aria-labelledby="watch-order" className="flex flex-col gap-4">
          <div className="flex flex-wrap items-baseline justify-between gap-2">
            <h2
              id="watch-order"
              className="font-display text-parchment text-2xl"
            >
              Watch order
            </h2>
            <p className="text-parchment-faint font-sans text-xs">
              Top to bottom. Drag or use the arrows to rearrange.
              {saved && ' Changes save automatically.'}
            </p>
          </div>

          {items.length > 0 ? (
            <WatchOrder
              items={items}
              onChange={(next) => change({ items: next })}
            />
          ) : (
            <p className="border-line text-parchment-faint rounded-sm border p-6 text-center font-sans text-sm">
              Your list is empty. Add a title to plan it.
            </p>
          )}

          {adding ? (
            <div className="border-line flex flex-col gap-3 rounded-sm border p-4">
              <div className="flex items-center justify-between">
                <h3 className="text-parchment font-sans text-sm font-medium">
                  Add titles
                </h3>
                <button
                  type="button"
                  onClick={() => setAdding(false)}
                  className="text-parchment-faint hover:text-parchment min-h-[32px] font-sans text-xs transition-colors"
                >
                  Done adding
                </button>
              </div>
              <TitleSearch
                autoFocus
                isAdded={(tmdbId) => items.some((i) => i.tmdbId === tmdbId)}
                onAdd={(item) =>
                  !items.some((i) => i.tmdbId === item.tmdbId) &&
                  change({ items: [...items, item] })
                }
                onRemove={(tmdbId) =>
                  change({ items: items.filter((i) => i.tmdbId !== tmdbId) })
                }
              />
            </div>
          ) : (
            <button
              type="button"
              onClick={() => setAdding(true)}
              className="border-line-strong text-parchment hover:border-gold/60 min-h-[44px] w-fit rounded-sm border border-dashed px-5 font-sans text-sm transition-colors"
            >
              + Add more titles
            </button>
          )}
        </section>

        <AvailabilityForm
          totalRuntime={totalRuntime}
          totalItems={items.length}
          itemLabel="titles"
          episodeRuntime={avgRuntime}
          mediaType={hasTV ? 'tv' : 'movie'}
          resultsPath={`/list/${id}/results`}
          exactItems={exactItems}
          shareTitle={title}
          initialConfig={initialConfig ?? undefined}
        />
      </div>
    </main>
  )
}
