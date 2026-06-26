'use client'

import { use, useMemo } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import { getChallengeById } from '@/lib/challenges'
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

export default function ChallengeResultsPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = use(params)
  const searchParams = useSearchParams()
  const router = useRouter()

  const challenge = getChallengeById(id)

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

  const totalItems = challenge?.itemCount ?? 0
  const avgRuntime = challenge
    ? Math.round(challenge.totalRuntime / challenge.itemCount)
    : 90

  const goalPlan = useMemo(() => {
    if (!config || !challenge) return null
    if (goal.mode === 'finish-before') {
      return generateFinishBeforePlan(
        goal.targetDate,
        totalItems,
        avgRuntime,
        'movie'
      )
    }
    if (goal.mode === 'vacation') {
      return generateVacationPlan(
        goal.startDate,
        goal.endDate,
        goal.hoursPerDay,
        totalItems,
        avgRuntime,
        'movie'
      )
    }
    return null
  }, [goal, config, challenge, totalItems, avgRuntime])

  const { plan: standardPlan, loading } = useWatchPlan(
    goal.mode === 'standard' ? config : null,
    totalItems,
    'movie',
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

  if (!plan || !challenge) {
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
          href={`/challenges/${id}/plan`}
          className="text-parchment/30 hover:text-parchment/60 w-fit font-mono text-xs tracking-widest transition-colors"
        >
          ← BACK TO PLANNER
        </Link>

        {/* Header */}
        <div className="flex flex-col gap-4">
          <p className="text-gold/60 font-mono text-xs tracking-widest">
            CHALLENGE PLAN
          </p>
          <div className="flex items-start justify-between gap-4">
            <div className="flex flex-col gap-2">
              <h1 className="font-display text-parchment text-5xl leading-none">
                {challenge.title}
              </h1>
              <p className="font-body text-parchment/40 italic">
                {challenge.itemCount} films · {challenge.category}
              </p>
            </div>
            <span className="text-gold/30 flex-shrink-0 font-mono text-4xl">
              {challenge.icon}
            </span>
          </div>
        </div>

        {/* Top row */}
        <div className="grid gap-6 md:grid-cols-2">
          <CompletionCard plan={plan} title={challenge.title} />
          <RuntimeCard plan={plan} />
        </div>

        {/* Chart */}
        {plan.weeklyBlocks.length > 1 && (
          <div className="border-gold/10 rounded-sm border p-6">
            <ProgressChart blocks={plan.weeklyBlocks} />
          </div>
        )}

        {/* Weekly + milestones */}
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
            <div className="border-gold/10 mt-4 flex flex-col gap-3 border-t pt-6">
              <p className="text-parchment/30 font-mono text-xs tracking-widest">
                EXPORT
              </p>
              <ExportButton
                plan={plan}
                title={challenge.title}
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
