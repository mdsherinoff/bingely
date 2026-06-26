import { getChallengeById, challenges } from '@/lib/challenges'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import AvailabilityForm from '@/components/plan/AvailabilityForm'

export function generateStaticParams() {
  return challenges.map((c) => ({ id: c.id }))
}

export default async function ChallengePlanPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const challenge = getChallengeById(id)

  if (!challenge) notFound()

  const avgRuntime = Math.round(challenge.totalRuntime / challenge.itemCount)

  return (
    <main id="main-content" className="bg-espresso min-h-screen px-6 py-12">
      <div className="mx-auto flex max-w-4xl flex-col gap-10">
        {/* Header */}
        <div className="flex flex-col gap-3">
          <Link
            href={`/challenges/${id}`}
            className="text-parchment/30 hover:text-parchment/60 w-fit font-mono text-xs tracking-widest transition-colors"
          >
            ← BACK TO CHALLENGE
          </Link>
          <div className="flex items-center gap-3">
            <span className="text-gold/50 font-mono text-3xl">
              {challenge.icon}
            </span>
          </div>
          <h1 className="font-display text-parchment text-5xl leading-none">
            Plan — {challenge.title}
          </h1>
          <p className="font-body text-parchment/40 italic">
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
          }))}
        />
      </div>
    </main>
  )
}
