'use client'

import { motion } from 'framer-motion'
import { WeeklyBlock } from '@/types/media'
import ProgressBar from './ProgressBar'

interface WeekRowProps {
  block: WeeklyBlock
  totalEpisodes: number
  index?: number
}

export default function WeekRow({
  block,
  totalEpisodes,
  index = 0,
}: WeekRowProps) {
  const isLast = block.endEpisode >= totalEpisodes

  return (
    <motion.div
      initial={{ opacity: 0, x: -8 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{
        duration: 0.25,
        delay: Math.min(index * 0.05, 0.6),
        ease: 'easeOut',
      }}
      className={`bg-ink flex shrink-0 overflow-hidden rounded-sm border transition-all hover:translate-x-1 ${
        isLast ? 'border-gold/50' : 'border-line hover:border-gold/40'
      }`}
    >
      {/* Ticket stub */}
      <div className="border-line-strong bg-raised relative flex w-20 flex-shrink-0 flex-col justify-center gap-0.5 border-r border-dashed px-4 py-3">
        {/* punched notches on the perforation */}
        <span
          aria-hidden
          className="bg-espresso border-line absolute -top-2 -right-2 h-4 w-4 rounded-full border"
        />
        <span
          aria-hidden
          className="bg-espresso border-line absolute -right-2 -bottom-2 h-4 w-4 rounded-full border"
        />
        <span className="text-parchment-faint font-mono text-[9px] tracking-[0.2em]">
          {isLast ? 'FINALE' : 'WEEK'}
        </span>
        <span className="font-display text-gold text-2xl leading-none font-bold">
          {String(block.week).padStart(2, '0')}
        </span>
      </div>

      {/* Body */}
      <div className="flex flex-1 items-center justify-between gap-4 px-4 py-3">
        <div className="flex min-w-0 flex-col gap-1">
          <p className="text-parchment truncate font-sans text-sm sm:text-base">
            Episodes {block.startEpisode}–{block.endEpisode}
          </p>
          <p className="text-parchment-faint font-mono text-[11px] tracking-wide tabular-nums">
            {block.episodes} EPS · {block.hoursWatched}H
          </p>
        </div>
        <div className="w-24 flex-shrink-0 sm:w-32">
          <ProgressBar percent={block.cumulativePercent} showLabel={false} />
          <p className="text-gold mt-1.5 text-right font-mono text-xs tabular-nums">
            {block.cumulativePercent}%
          </p>
        </div>
      </div>
    </motion.div>
  )
}
