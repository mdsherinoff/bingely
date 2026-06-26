import { challenges } from '@/lib/challenges'
import ChallengeCard from '@/components/challenges/ChallengeCard'
import Link from 'next/link'
import ChallengeUnlock from '@/components/challenges/ChallengeUnlock'
import PageTransition from '@/components/layout/PageTransition'

const categories = [
  { key: 'director', label: 'Directors' },
  { key: 'franchise', label: 'Franchises' },
  { key: 'studio', label: 'Studios' },
  { key: 'genre', label: 'Collections' },
] as const

export default function ChallengesPage() {
  return (
    <PageTransition>
      <main className="bg-espresso min-h-screen px-6 py-12">
        <div className="mx-auto flex max-w-5xl flex-col gap-12">
          {/* Header */}
          <div className="flex flex-col gap-3">
            <Link
              href="/"
              className="text-parchment/30 hover:text-parchment/60 w-fit font-mono text-xs tracking-widest transition-colors"
            >
              ← BACK
            </Link>
            <p className="text-gold/60 font-mono text-xs tracking-widest">
              FILM CHALLENGES
            </p>
            <h1 className="font-display text-parchment text-6xl leading-none">
              Choose your journey
            </h1>
            <p className="font-body text-parchment/40 text-lg italic">
              Curated collections for the dedicated cinephile
            </p>
          </div>

          {/* Challenges by category */}
          {categories.map(({ key, label }) => {
            const items = challenges.filter((c) => c.category === key)
            if (items.length === 0) return null
            return (
              <div key={key} className="flex flex-col gap-4">
                <h2 className="font-display text-parchment/60 text-2xl">
                  {label}
                </h2>
                <div className="grid gap-4 sm:grid-cols-2">
                  {items.map((challenge, i) => (
                    <ChallengeCard
                      key={challenge.id}
                      challenge={challenge}
                      index={i}
                    />
                  ))}
                </div>
              </div>
            )
          })}
        </div>
        <ChallengeUnlock />
      </main>
    </PageTransition>
  )
}
