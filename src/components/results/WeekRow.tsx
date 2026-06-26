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
        delay: Math.min(index * 0.03, 0.5),
        ease: 'easeOut',
      }}
      className={`flex flex-col gap-3 rounded-sm border p-4 transition-colors ${isLast ? 'border-gold/30 bg-ink' : 'border-gold/10'} `}
    >
      <div className="flex items-start justify-between">
        <div className="flex flex-col gap-0.5">
          <p className="text-parchment/30 font-mono text-xs tracking-widest">
            WEEK {block.week}
          </p>
          <p className="font-body text-parchment text-base">
            Episodes {block.startEpisode}–{block.endEpisode}
          </p>
        </div>
        <div className="flex flex-col gap-0.5 text-right">
          <p className="text-gold font-mono text-xs">{block.episodes} eps</p>
          <p className="text-parchment/30 font-mono text-xs">
            {block.hoursWatched}h
          </p>
        </div>
      </div>
      <ProgressBar percent={block.cumulativePercent} />
    </motion.div>
  )
}
