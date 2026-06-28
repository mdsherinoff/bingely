'use client'

import { motion } from 'framer-motion'
import { FilmChallenge } from '@/types/media'
import { Badge } from '@/components/ui'
import Link from 'next/link'

interface ChallengeCardProps {
  challenge: FilmChallenge
  index?: number
}

function formatRuntime(minutes: number): string {
  const h = Math.floor(minutes / 60)
  const m = minutes % 60
  if (m === 0) return `${h}h`
  return `${h}h ${m}m`
}

const categoryLabels: Record<FilmChallenge['category'], string> = {
  director: 'Director',
  franchise: 'Franchise',
  genre: 'Genre',
  studio: 'Studio',
}

export default function ChallengeCard({
  challenge,
  index = 0,
}: ChallengeCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: index * 0.08, ease: 'easeOut' }}
    >
      <Link
        href={`/challenges/${challenge.id}`}
        className="group border-gold/10 hover:border-gold/30 bg-espresso hover:bg-ink flex flex-col gap-4 rounded-sm border p-5 transition-colors"
      >
        <div className="flex items-start justify-between">
          <span className="text-gold/40 group-hover:text-gold/70 font-mono text-2xl transition-colors">
            {challenge.icon}
          </span>
          <Badge variant="muted">{categoryLabels[challenge.category]}</Badge>
        </div>

        <div className="flex flex-col gap-1">
          <h3 className="font-display text-parchment group-hover:text-gold text-2xl transition-colors">
            {challenge.title}
          </h3>
          <p className="text-parchment/40 font-mono text-sm leading-relaxed">
            {challenge.description}
          </p>
        </div>

        <div className="border-gold/10 flex items-center gap-4 border-t pt-2">
          <div className="flex flex-col gap-0.5">
            <p className="text-parchment/20 font-mono text-xs tracking-widest">
              FILMS
            </p>
            <p className="text-parchment font-mono text-sm">
              {challenge.itemCount}
            </p>
          </div>
          <div className="flex flex-col gap-0.5">
            <p className="text-parchment/20 font-mono text-xs tracking-widest">
              RUNTIME
            </p>
            <p className="text-parchment font-mono text-sm">
              {formatRuntime(challenge.totalRuntime)}
            </p>
          </div>
          <div className="ml-auto">
            <p className="text-gold/40 group-hover:text-gold/70 font-mono text-xs transition-colors">
              START →
            </p>
          </div>
        </div>
      </Link>
    </motion.div>
  )
}
