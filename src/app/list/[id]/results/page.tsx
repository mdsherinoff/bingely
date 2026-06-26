'use client'

import { use, useMemo } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import { useCustomLists } from '@/hooks/useCustomLists'
import { useWatchPlan } from '@/hooks/useWatchPlan'
import { AvailabilityConfig, WatchGoal } from '@/types/media'
import CompletionCard from '@/components/results/CompletionCard'
import RuntimeCard from '@/components/results/RuntimeCard'
import ProgressChart from '@/components/results/ProgressChart'
import WeekRow from '@/components/results/WeekRow'
import MilestoneCard from '@/components/results/MilestoneCard'
import ExportButton from '@/components/results/ExportButton'
import ShareButton from '@/components/results/ShareButton'
import { Button } from '@/components/ui'
import Link from 'next/link'
import { generateFinishBeforePlan, generateVacationPlan } from '@/lib/scheduler'

export default function ListResultsPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = use(params)
  const searchParams = useSearchParams()
  const router = useRouter()
  const { getList } = useCustomLists()
  const list = getList(id)

  const rawConfig = searchParams.get('config')
  const config: AvailabilityConfig | null = useMemo(() => {
    if (!rawConfig) return null
    try {
      return JSON.parse(decodeURIComponent(rawConfig))
    } catch {
      return null
    }
  }, [rawConfig])

  const rawGoal = searchParams.get('goal')
  const goal: WatchGoal = useMemo(() => {
    if (!rawGoal) return { mode: 'standard' }
    try {
      return JSON.parse(decodeURIComponent(rawGoal))
    } catch {
      return { mode: 'standard' }
    }
  }, [rawGoal])

  const totalItems = list?.items.length ?? 0
  const totalRuntime = list?.items.reduce((acc, i) => acc + i.runtime, 0) ?? 0
  const avgRuntime = totalItems > 0 ? Math.round(totalRuntime / totalItems) : 90
  const hasTV = list?.items.some((i) => i.mediaType === 'tv') ?? false

  const goalPlan = useMemo(() => {
    if (!config || !list) return null
    if (goal.mode === 'finish-before') {
      return generateFinishBeforePlan(
        goal.targetDate,
        totalItems,
        avgRuntime,
        hasTV ? 'tv' : 'movie'
      )
    }
    if (goal.mode === 'vacation') {
      return generateVacationPlan(
        goal.startDate,
        goal.endDate,
        goal.hoursPerDay,
        totalItems,
        avgRuntime,
        hasTV ? 'tv' : 'movie'
      )
    }
    return null
  }, [goal, config, list, totalItems, avgRuntime, hasTV])

  const { plan: standardPlan, loading } = useWatchPlan(
    goal.mode === 'standard' ? config : null,
    totalItems,
    hasTV ? 'tv' : 'movie',
    avgRuntime
  )

  const plan = goalPlan ?? standardPlan

  if (loading) {
    return (
      <main className="bg-espresso flex min-h-screen items-center justify-center">
        <p className="text-parchment/30 animate-pulse font-mono text-xs tracking-widest">
          GENERATING YOUR PLAN...
        </p>
      </main>
    )
  }

  if (!plan || !list) {
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
    <main id="main-content" className="bg-espresso min-h-screen px-6 py-12">
      <div className="mx-auto flex max-w-5xl flex-col gap-12">
        <Link
          href={`/list/${id}/plan`}
          className="text-parchment/30 hover:text-parchment/60 w-fit font-mono text-xs tracking-widest transition-colors"
        >
          ← BACK TO PLANNER
        </Link>

        <div className="flex flex-col gap-4">
          <p className="text-gold/60 font-mono text-xs tracking-widest">
            CUSTOM LIST PLAN
          </p>
          <h1 className="font-display text-parchment text-5xl leading-none">
            {list.title}
          </h1>
          <p className="font-body text-parchment/40 italic">
            {list.items.length} titles · {Math.round(totalRuntime / 60)}h total
          </p>
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          <CompletionCard plan={plan} title={list.title} />
          <RuntimeCard plan={plan} />
        </div>

        {plan.weeklyBlocks.length > 1 && (
          <div className="border-gold/10 rounded-sm border p-6">
            <ProgressChart blocks={plan.weeklyBlocks} />
          </div>
        )}

        <div className="grid gap-10 md:grid-cols-3">
          <div className="flex flex-col gap-4 md:col-span-2">
            <h2 className="font-display text-parchment text-2xl">
              Week by week
            </h2>
            <div className="flex max-h-[600px] flex-col gap-3 overflow-y-auto pr-2">
              {plan.weeklyBlocks.map((block, i) => (
                <WeekRow
                  key={block.week}
                  block={block}
                  totalEpisodes={plan.totalEpisodes}
                  index={i}
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

            {/* Titles in list */}
            <div className="border-gold/10 mt-2 flex flex-col gap-2 border-t pt-4">
              <p className="text-parchment/30 mb-1 font-mono text-xs tracking-widest">
                YOUR TITLES
              </p>
              {list.items.map((item, i) => (
                <div key={item.tmdbId} className="flex items-center gap-2">
                  <span className="text-parchment/20 w-5 font-mono text-xs">
                    {String(i + 1).padStart(2, '0')}
                  </span>
                  <p className="font-body text-parchment/60 flex-1 truncate text-xs">
                    {item.title}
                  </p>
                  <span className="text-parchment/20 flex-shrink-0 font-mono text-xs">
                    {item.runtime}m
                  </span>
                </div>
              ))}
            </div>

            <div className="border-gold/10 mt-2 flex flex-col gap-3 border-t pt-6">
              <p className="text-parchment/30 font-mono text-xs tracking-widest">
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
      </div>
    </main>
  )
}
