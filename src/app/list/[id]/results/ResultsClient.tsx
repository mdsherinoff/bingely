'use client'

import { use, useMemo } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import { useResolvedList } from '@/hooks/useResolvedList'
import { AvailabilityConfig } from '@/types/media'
import CompletionCard from '@/components/results/CompletionCard'
import RuntimeCard from '@/components/results/RuntimeCard'
import FilmstripTimeline from '@/components/results/FilmstripTimeline'
import WeekRow from '@/components/results/WeekRow'
import MilestoneCard from '@/components/results/MilestoneCard'
import ExportButton from '@/components/results/ExportButton'
import ShareButton from '@/components/results/ShareButton'
import {
  generateListPlan,
  generateListMoviePlan,
  generateMixedListPlan,
  listKind,
  MixedListPlan,
  MoviePlan,
} from '@/lib/scheduler'
import MixedListResults from '@/components/results/MixedListResults'
import ListMovieResults from '@/components/results/ListMovieResults'
import PlanActionBar from '@/components/results/PlanActionBar'
import PlanUnavailable from '@/components/results/PlanUnavailable'
import { filmEvents } from '@/lib/ics'
import { decodeState, toQuery } from '@/lib/urlState'

interface ListItem {
  title: string
  runtime: number
  mediaType: 'movie' | 'tv'
}

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

  // Items from the link win; links made before items were carried in
  // the URL fall back to the list saved on this device
  const items: ListItem[] | null = useMemo(() => {
    const fromUrl = rawItems ? decodeState<ListItem[]>(rawItems) : null
    if (fromUrl) return fromUrl
    return (
      list?.items.map((i) => ({
        title: i.title,
        runtime: i.runtime,
        mediaType: i.mediaType,
      })) ?? null
    )
  }, [rawItems, list])

  // Carry every param forward so editing a shared plan pre-fills the
  // planner with these settings — and, since the visitor may not have
  // this list in their own localStorage, with the list itself too.
  const editHref = `/list/${id}/plan${toQuery({
    config: rawConfig,
    items: rawItems,
    title: rawTitle,
  })}`

  const totalRuntime = items?.reduce((acc, i) => acc + i.runtime, 0) ?? 0
  const kind = items ? listKind(items) : null

  // Each kind of list uses the same generator as the planner preview
  const plan = useMemo(() => {
    if (!config || !items) return null
    return generateListPlan(config, items, config.pace)
  }, [config, items])

  const listMoviePlan: MoviePlan | null = useMemo(() => {
    if (!config || !items || kind !== 'movies') return null
    return generateListMoviePlan(config, items)
  }, [config, items, kind])

  const mixedPlan: MixedListPlan | null = useMemo(() => {
    if (!config || !items || kind !== 'mixed') return null
    return generateMixedListPlan(config, items)
  }, [config, items, kind])

  if (!ready) {
    return (
      <main className="bg-espresso flex min-h-screen items-center justify-center">
        <p className="text-parchment-faint animate-pulse font-mono text-xs tracking-widest">
          LOADING YOUR PLAN…
        </p>
      </main>
    )
  }

  if (!plan || !list) {
    return (
      <PlanUnavailable
        retryHref={list ? `/list/${id}/plan` : '/list/new'}
        onBack={() => router.back()}
      />
    )
  }

  return (
    <main id="main-content" className="bg-espresso min-h-screen px-6 py-12">
      <div className="mx-auto flex max-w-5xl flex-col gap-12">
        {/* Header — always shown */}
        <div className="flex flex-col gap-4">
          <p className="text-gold font-mono text-xs tracking-widest">
            CUSTOM LIST PLAN
          </p>
          <h1 className="font-display text-parchment text-5xl leading-none">
            {list.title}
          </h1>
          <p className="text-parchment-dim font-sans">
            {list.items.length} titles · {Math.round(totalRuntime / 60)}h total
          </p>
          {config?.together && (
            <p className="text-gold font-mono text-xs tracking-widest">
              ◎◎ PLANNED FOR TWO · SHARED FREE TIME ONLY
            </p>
          )}
          <PlanActionBar
            editHref={editHref}
            title={list.title}
            // Films are scheduled into real dated slots; series in a list
            // are planned week by week, so only films can be exported
            calendarEvents={
              listMoviePlan
                ? () =>
                    filmEvents(
                      listMoviePlan.sessions,
                      (items ?? []).map((i) => i.title)
                    )
                : mixedPlan?.moviePlan
                  ? () =>
                      filmEvents(
                        mixedPlan.moviePlan!.sessions,
                        mixedPlan.movieItems.map((i) => i.title)
                      )
                  : undefined
            }
            calendarLabel={mixedPlan ? 'Add films to calendar' : undefined}
          />
        </div>

        {/* Branch — all movies / mixed / all TV */}
        {listMoviePlan ? (
          <ListMovieResults
            moviePlan={listMoviePlan}
            list={list}
            exportPlan={plan}
          />
        ) : mixedPlan ? (
          <MixedListResults
            mixedPlan={mixedPlan}
            list={list}
            exportPlan={plan}
          />
        ) : (
          <>
            {/* existing all-TV week-by-week view */}
            <div className="grid gap-6 md:grid-cols-2">
              <CompletionCard plan={plan} title={list.title} />
              <RuntimeCard plan={plan} />
            </div>

            {plan.weeklyBlocks.length > 1 && (
              <FilmstripTimeline
                blocks={plan.weeklyBlocks}
                completionDate={plan.completionDate}
              />
            )}

            <div className="grid gap-10 md:grid-cols-3">
              <div className="flex flex-col gap-4 md:col-span-2">
                <h2 className="font-display text-parchment text-2xl">
                  Week by week
                </h2>
                <div
                  role="region"
                  aria-label="Week by week"
                  tabIndex={0}
                  className="flex max-h-[600px] flex-col gap-3 overflow-y-auto pr-2"
                >
                  {plan.weeklyBlocks.map((block, i) => (
                    <WeekRow
                      key={block.week}
                      block={block}
                      totalEpisodes={plan.totalEpisodes}
                      index={i}
                      titles={items?.map((it) => it.title)}
                    />
                  ))}
                </div>
              </div>

              <div className="flex flex-col gap-4">
                <h2 className="font-display text-parchment text-2xl">
                  Milestones
                </h2>
                <div className="flex flex-col">
                  {plan.milestones.map((m, i) => (
                    <MilestoneCard
                      showEpisode={false}
                      key={m.percent}
                      milestone={m}
                      isLast={i === plan.milestones.length - 1}
                    />
                  ))}
                </div>
                <div className="border-line mt-2 flex flex-col gap-2 border-t pt-4">
                  <p className="text-parchment-faint mb-1 font-mono text-xs tracking-widest">
                    YOUR TITLES
                  </p>
                  {list.items.map((item, i) => (
                    <div key={item.tmdbId} className="flex items-center gap-2">
                      <span className="text-parchment-faint w-5 font-mono text-xs">
                        {String(i + 1).padStart(2, '0')}
                      </span>
                      <p className="text-parchment-dim flex-1 truncate font-mono text-xs">
                        {item.title}
                      </p>
                      <span className="text-parchment-faint flex-shrink-0 font-mono text-xs">
                        {item.runtime}m
                      </span>
                    </div>
                  ))}
                </div>
                <div className="border-line mt-2 flex flex-col gap-3 border-t pt-6">
                  <p className="text-parchment-faint font-mono text-xs tracking-widest">
                    EXPORT
                  </p>
                  <ExportButton
                    plan={plan}
                    title={list.title}
                    releaseYear={new Date().getFullYear().toString()}
                  />
                  <ShareButton />
                </div>
              </div>
            </div>
          </>
        )}
      </div>
    </main>
  )
}
