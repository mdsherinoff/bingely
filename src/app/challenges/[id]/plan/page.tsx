import { getChallengeById, challenges } from '@/lib/challenges'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import AvailabilityForm from '@/components/plan/AvailabilityForm'
import { AvailabilityConfig, WatchGoal } from '@/types/media'
import { decodeState } from '@/lib/urlState'

export function generateStaticParams() {
  return challenges.map((c) => ({ id: c.id }))
}

export default async function ChallengePlanPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>
  searchParams: Promise<{ config?: string; goal?: string }>
}) {
  const { id } = await params
  const { config: rawConfig, goal: rawGoal } = await searchParams
  const challenge = getChallengeById(id)

  if (!challenge) notFound()

  const avgRuntime = Math.round(challenge.totalRuntime / challenge.itemCount)
  // Arriving via "Edit Plan" on a results page pre-fills these instead
  // of the defaults, so editing someone else's plan starts from what
  // they chose.
  const initialConfig = rawConfig
    ? decodeState<AvailabilityConfig>(rawConfig)
    : null
  const initialGoal = rawGoal ? decodeState<WatchGoal>(rawGoal) : null

  return (
    <main id="main-content" className="bg-espresso min-h-screen px-6 py-12">
      <div className="mx-auto flex max-w-4xl flex-col gap-10">
        {/* Header */}
        <div className="flex flex-col gap-3">
          <Link
            href={`/challenges/${id}`}
            className="text-parchment-faint hover:text-parchment-dim w-fit font-mono text-xs tracking-widest transition-colors"
          >
            ← BACK TO CHALLENGE
          </Link>
          <div className="flex items-center gap-3">
            <span className="text-gold font-mono text-3xl">
              {challenge.icon}
            </span>
          </div>
          <h1 className="font-display text-parchment text-5xl leading-none">
            Plan — {challenge.title}
          </h1>
          <p className="text-parchment-dim font-sans">
            {challenge.itemCount} films ·{' '}
            {Math.round(challenge.totalRuntime / 60)}h total
          </p>
        </div>

        <AvailabilityForm
          totalRuntime={challenge.totalRuntime}
          totalItems={challenge.itemCount}
          itemLabel="films"
          episodeRuntime={avgRuntime}
          mediaType="movie"
          resultsPath={`/challenges/${id}/results`}
          exactItems={challenge.items.map((i) => ({
            title: i.title,
            runtime: i.runtime,
            mediaType: i.mediaType,
          }))}
          initialConfig={initialConfig ?? undefined}
          initialGoal={initialGoal ?? undefined}
        />
      </div>
    </main>
  )
}
