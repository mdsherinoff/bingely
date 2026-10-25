'use client'

import { use, useMemo } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import { useResolvedList } from '@/hooks/useResolvedList'
import {
  AvailabilityConfig,
  CustomListItem,
  SharedListItem,
} from '@/types/media'
import { generateQueuePlan, queueToWatchPlan } from '@/lib/queue'
import { fromSharedItem, seasonsFromCounts, toQueueItem } from '@/lib/listItems'
import QueueResults from '@/components/results/QueueResults'
import PlanActionBar from '@/components/results/PlanActionBar'
import PlanUnavailable from '@/components/results/PlanUnavailable'
import { queueEvents } from '@/lib/ics'
import { decodeState, toQuery } from '@/lib/urlState'

export default function ListResultsPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = use(params)
  const searchParams = useSearchParams()
  const router = useRouter()
  const { list, ready } = useResolvedList(id)

  const rawConfig = searchParams.get('config')
  const config: AvailabilityConfig | null = useMemo(() => {
    if (!rawConfig) return null
    return decodeState<AvailabilityConfig>(rawConfig)
  }, [rawConfig])

  const rawItems = searchParams.get('items')
  const rawTitle = searchParams.get('title')

  // Items from the link win — they're exactly what was planned; links
  // made before items were carried fall back to the list on this device
  const items: CustomListItem[] | null = useMemo(() => {
    const fromUrl = rawItems ? decodeState<SharedListItem[]>(rawItems) : null
    if (fromUrl?.length) return fromUrl.map(fromSharedItem)
    return list?.items ?? null
  }, [rawItems, list])

  // Carry every param forward so editing a shared plan pre-fills the
  // planner with these settings — and, since the visitor may not have
  // this list in their own localStorage, with the list itself too.
  const editHref = `/list/${id}/plan${toQuery({
    config: rawConfig,
    items: rawItems,
    title: rawTitle,
  })}`

  const queue = useMemo(() => {
    if (!config || !items?.length) return null
    return generateQueuePlan(config, items.map(toQueueItem))
  }, [config, items])

  const watchPlan = useMemo(() => {
    if (!queue || !config || !items) return null
    return queueToWatchPlan(queue, items.map(toQueueItem), config.pace)
  }, [queue, config, items])

  if (!ready) {
    return (
      <main className="bg-espresso flex min-h-screen items-center justify-center">
        <p className="text-parchment-faint animate-pulse font-mono text-xs tracking-widest">
          LOADING YOUR PLAN…
        </p>
      </main>
    )
  }

  if (!queue || !watchPlan || !items || !list) {
    return (
      <PlanUnavailable
        retryHref={list ? `/list/${id}/plan` : '/list/new'}
        onBack={() => router.back()}
      />
    )
  }

  const title = rawTitle || list.title

  return (
    <main id="main-content" className="bg-espresso min-h-screen px-6 py-12">
      <div className="mx-auto flex max-w-5xl flex-col gap-12">
        <div className="flex flex-col gap-4">
          <p className="text-gold font-mono text-xs tracking-widest">
            CUSTOM LIST PLAN
          </p>
          <h1 className="font-display text-parchment text-5xl leading-none">
            {title}
          </h1>
          <p className="text-parchment-dim font-sans">
            {items.length} title{items.length === 1 ? '' : 's'} ·{' '}
            {Math.round(queue.totalMinutes / 60)}h to watch
          </p>
          {config?.together && (
            <p className="text-gold font-mono text-xs tracking-widest">
              ◎◎ PLANNED FOR TWO · SHARED FREE TIME ONLY
            </p>
          )}
          <PlanActionBar
            editHref={editHref}
            title={title}
            calendarEvents={() =>
              queueEvents(
                queue.sessions,
                items.map((i) => ({
                  title: i.title,
                  seasons: seasonsFromCounts(i.seasons),
                }))
              )
            }
          />
        </div>

        <QueueResults
          items={items}
          queue={queue}
          watchPlan={watchPlan}
          title={title}
        />
      </div>
    </main>
  )
}
