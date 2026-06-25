'use client'

import { use, useMemo } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import { useMediaDetails } from '@/hooks/useMediaDetails'
import { useWatchPlan } from '@/hooks/useWatchPlan'
import { AvailabilityConfig, MediaType } from '@/types/media'
import CompletionCard from '@/components/results/CompletionCard'
import RuntimeCard from '@/components/results/RuntimeCard'
import ProgressChart from '@/components/results/ProgressChart'
import MilestoneCard from '@/components/results/MilestoneCard'
import WeekRow from '@/components/results/WeekRow'
import { Button } from '@/components/ui'
import Link from 'next/link'

export default function ResultsPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = use(params)
  const searchParams = useSearchParams()
  const router = useRouter()
  const type = (searchParams.get('type') || 'tv') as MediaType

  const rawConfig = searchParams.get('config')
  const config: AvailabilityConfig | null = useMemo(() => {
    if (!rawConfig) return null
    try {
      return JSON.parse(decodeURIComponent(rawConfig))
    } catch {
      return null
    }
  }, [rawConfig])

  const { media, loading: mediaLoading } = useMediaDetails(Number(id), type)
  const totalEpisodes = media?.episodeCount ?? 1
  const runtime = media?.runtime ?? config?.episodeRuntime ?? 24

  const { plan, loading: planLoading } = useWatchPlan(
    config,
    totalEpisodes,
    type,
    runtime
  )

  const loading = mediaLoading || planLoading

  if (loading) {
    return (
      <main className="bg-espresso flex min-h-screen items-center justify-center">
        <p className="text-parchment/30 animate-pulse font-mono text-xs tracking-widest">
          GENERATING YOUR PLAN...
        </p>
      </main>
    )
  }

  if (!plan || !media) {
    return (
      <main className="bg-espresso flex min-h-screen flex-col items-center justify-center gap-4">
        <p className="font-body text-rose">Failed to generate plan</p>
        <Button onClick={() => router.back()} variant="secondary">
          Go back
        </Button>
      </main>
    )
  }

  return (
    <main className="bg-espresso min-h-screen px-6 py-12">
      <div className="mx-auto flex max-w-5xl flex-col gap-12">
        {/* Back link */}
        <Link
          href={`/plan/${id}?type=${type}`}
          className="text-parchment/30 hover:text-parchment/60 w-fit font-mono text-xs tracking-widest transition-colors"
        >
          ← BACK TO PLANNER
        </Link>

        {/* Header */}
        <div className="flex flex-col gap-4">
          <p className="text-gold/60 font-mono text-xs tracking-widest">
            WATCH PLAN
          </p>
          <div className="flex items-center justify-between">
            <div className="my-auto flex flex-col gap-2">
              <h1 className="font-display text-parchment text-6xl leading-none">
                {media.title}
              </h1>
              <p className="font-body text-parchment/40 italic">
                {media.releaseYear} · {media.genres.slice(0, 3).join(', ')}
              </p>
            </div>
            {media.posterPath && (
              <div className="border-gold/10 hidden aspect-[2/3] w-48 flex-shrink-0 overflow-hidden rounded-sm border md:block">
                <img
                  src={media.posterPath}
                  alt={media.title}
                  className="h-full w-full object-cover"
                />
              </div>
            )}
          </div>
        </div>

        {/* Top row — completion + runtime */}
        <div className="grid gap-6 md:grid-cols-2">
          <CompletionCard plan={plan} title={media.title} />
          <div className="flex flex-col gap-4">
            <RuntimeCard plan={plan} />
          </div>
        </div>

        {/* Progress chart */}
        {plan.mediaType === 'tv' && plan.weeklyBlocks.length > 1 && (
          <div className="border-gold/10 rounded-sm border p-6">
            <ProgressChart blocks={plan.weeklyBlocks} />
          </div>
        )}

        {/* Bottom row — weekly breakdown + milestones */}
        <div className="grid gap-10 md:grid-cols-3">
          <div className="flex flex-col gap-4 md:col-span-2">
            <h2 className="font-display text-parchment text-2xl">
              Week by week
            </h2>
            <div className="flex max-h-[600px] flex-col gap-3 overflow-y-auto pr-2">
              {plan.weeklyBlocks.map((block) => (
                <WeekRow
                  key={block.week}
                  block={block}
                  totalEpisodes={plan.totalEpisodes}
                />
              ))}
            </div>
          </div>

          <div className="flex flex-col gap-4">
            <h2 className="font-display text-parchment text-2xl">Milestones</h2>
            <div className="flex flex-col">
              {plan.milestones.map((m, i) => (
                <MilestoneCard
                  key={m.percent}
                  milestone={m}
                  isLast={i === plan.milestones.length - 1}
                />
              ))}
            </div>
          </div>
        </div>
      </div>
    </main>
  )
}
