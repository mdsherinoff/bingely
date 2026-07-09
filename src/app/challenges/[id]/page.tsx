import { getChallengeById, challenges } from '@/lib/challenges'
import { Badge } from '@/components/ui'
import Link from 'next/link'
import { notFound } from 'next/navigation'

function formatRuntime(minutes: number): string {
  const h = Math.floor(minutes / 60)
  const m = minutes % 60
  if (m === 0) return `${h}h`
  return `${h}h ${m}m`
}

export function generateStaticParams() {
  return challenges.map((c) => ({ id: c.id }))
}

export default async function ChallengePage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const challenge = getChallengeById(id)

  if (!challenge) notFound()

  const totalHours = Math.round((challenge.totalRuntime / 60) * 10) / 10

  return (
    <main id="main-content" className="bg-espresso min-h-screen px-6 py-12">
      <div className="mx-auto flex max-w-4xl flex-col gap-10">
        {/* Back */}
        <Link
          href="/challenges"
          className="text-parchment-faint hover:text-parchment-dim w-fit font-mono text-xs tracking-widest transition-colors"
        >
          ← ALL CHALLENGES
        </Link>

        {/* Header */}
        <div className="flex flex-col gap-4">
          <div className="flex items-center gap-3">
            <span className="text-gold font-mono text-3xl">
              {challenge.icon}
            </span>
            <Badge variant="gold">{challenge.category}</Badge>
          </div>
          <h1 className="font-display text-parchment text-6xl leading-none">
            {challenge.title}
          </h1>
          <p className="text-parchment-dim font-mono text-lg">
            {challenge.description}
          </p>

          {/* Stats */}
          <div className="flex gap-8 pt-2">
            <div className="flex flex-col gap-0.5">
              <p className="text-parchment-faint font-mono text-xs tracking-widest">
                FILMS
              </p>
              <p className="text-parchment font-mono text-2xl">
                {challenge.itemCount}
              </p>
            </div>
            <div className="flex flex-col gap-0.5">
              <p className="text-parchment-faint font-mono text-xs tracking-widest">
                TOTAL RUNTIME
              </p>
              <p className="text-parchment font-mono text-2xl">{totalHours}h</p>
            </div>
          </div>
        </div>

        {/* Plan this challenge CTA */}
        <div className="border-line-strong bg-ink flex flex-col gap-3 rounded-sm border p-6">
          <p className="text-gold font-mono text-xs tracking-widest">
            READY TO START?
          </p>
          <p className="text-parchment-dim font-mono text-sm">
            Plan this entire challenge around your schedule. Get a week-by-week
            breakdown and know exactly when you'll finish.
          </p>
          <Link
            href={`/challenges/${id}/plan`}
            className="bg-gold text-espresso hover:bg-gold-muted inline-flex w-fit items-center gap-2 rounded-sm px-5 py-2.5 font-mono text-sm font-semibold transition-colors"
          >
            Plan this challenge →
          </Link>
        </div>

        {/* Film list */}
        <div className="flex flex-col gap-4">
          <h2 className="font-display text-parchment text-2xl">
            The watchlist
          </h2>
          <div className="flex flex-col">
            {challenge.items.map((item, i) => (
              <div
                key={item.tmdbId}
                className="border-line flex items-center gap-4 border-b py-3 last:border-0"
              >
                <span className="text-parchment-faint w-6 flex-shrink-0 font-mono text-xs">
                  {String(i + 1).padStart(2, '0')}
                </span>
                <div className="flex-1">
                  <p className="text-parchment font-mono text-base">
                    {item.title}
                  </p>
                  <p className="text-parchment-faint font-mono text-xs">
                    {item.year}
                  </p>
                </div>
                <p className="text-parchment-faint flex-shrink-0 font-mono text-xs">
                  {formatRuntime(item.runtime)}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </main>
  )
}
