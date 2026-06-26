'use client'

import { motion } from 'framer-motion'
import { WatchPlan } from '@/types/media'
import { Card } from '@/components/ui'

interface PlanSummaryProps {
  plan: WatchPlan
  title: string
}

const paceLabels: Record<string, string> = {
  casual: 'Casual',
  balanced: 'Balanced',
  binge: 'Binge',
  hardcore: 'Hardcore',
}

export default function PlanSummary({ plan, title }: PlanSummaryProps) {
  const stats =
    plan.mediaType === 'tv'
      ? [
          { label: 'COMPLETION', value: plan.completionDate },
          { label: 'TOTAL WEEKS', value: `${plan.totalWeeks} weeks` },
          { label: 'EPS / WEEK', value: `${plan.episodesPerWeek} eps` },
          { label: 'TOTAL HOURS', value: `${plan.totalHours}h` },
          { label: 'PACE', value: paceLabels[plan.pace] },
          { label: 'TOTAL EPISODES', value: plan.totalEpisodes },
        ]
      : [
          { label: 'WATCH DATE', value: plan.completionDate },
          { label: 'RUNTIME', value: `${plan.runtime} min` },
          { label: 'TOTAL HOURS', value: `${plan.totalHours}h` },
        ]

  return (
    <div className="flex flex-col gap-6">
      <div>
        <p className="text-gold/60 mb-2 font-mono text-xs tracking-widest">
          WATCH PLAN
        </p>
        <h1 className="font-display text-parchment text-5xl leading-tight">
          {title}
        </h1>
      </div>

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
        {stats.map((s, i) => (
          <motion.div
            key={s.label}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: i * 0.08, ease: 'easeOut' }}
          >
            <Card className="flex flex-col gap-1">
              <p className="text-parchment/30 font-mono text-xs tracking-widest">
                {s.label}
              </p>
              <p className="font-body text-parchment text-lg">{s.value}</p>
            </Card>
          </motion.div>
        ))}
      </div>
    </div>
  )
}
