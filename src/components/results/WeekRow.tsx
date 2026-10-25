'use client'

import { motion } from 'framer-motion'
import { WeeklyBlock, Season } from '@/types/media'
import { episodeRangeLabel } from '@/lib/episodes'
import ProgressBar from './ProgressBar'

interface WeekRowProps {
  block: WeeklyBlock
  totalEpisodes: number
  index?: number
  // For list plans each "episode" is a whole title, and one long series
  // can span many weeks; pass the titles so rows say what's watched
  // instead of "Episodes 1–1 · 0 eps"
  titles?: string[]
  // Series season breakdown, to label weeks "S2 E3–E7"
  seasons?: Season[]
  // Set while the viewer follows this plan, to tick weeks off
  watched?: boolean
  onToggleWatched?: () => void
}

function listLabel(block: WeeklyBlock, titles: string[]): string {
  const current = titles[block.startEpisode - 1] ?? ''
  if (block.episodes === 0) return `Keep watching ${current}`
  const finished = titles.slice(block.startEpisode - 1, block.endEpisode)
  if (finished.length <= 2) return `Finish ${finished.join(' & ')}`
  return `Finish ${finished[0]} + ${finished.length - 1} more`
}

export default function WeekRow({
  block,
  totalEpisodes,
  index = 0,
  titles,
  seasons,
  watched = false,
  onToggleWatched,
}: WeekRowProps) {
  // The week the plan actually completes — not merely the week that
  // touches the last item, which for a list can be every week
  const isLast =
    block.cumulativePercent >= 100 && block.endEpisode >= totalEpisodes

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
      } ${watched ? 'opacity-60' : ''}`}
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
        <span className="text-parchment-dim font-mono text-[9px] tracking-[0.2em]">
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
            {titles
              ? listLabel(block, titles)
              : episodeRangeLabel(block.startEpisode, block.endEpisode, seasons)}
          </p>
          <p className="text-parchment-faint font-mono text-[11px] tracking-wide tabular-nums">
            {titles
              ? block.episodes === 0
                ? `IN PROGRESS · ${block.hoursWatched}H`
                : `${block.episodes} FINISHED · ${block.hoursWatched}H`
              : `${block.episodes} EP${block.episodes === 1 ? '' : 'S'} · ${block.hoursWatched}H`}
          </p>
        </div>
        {onToggleWatched ? (
          <button
            type="button"
            onClick={onToggleWatched}
            aria-pressed={watched}
            aria-label={`Week ${block.week} watched`}
            className={`flex h-10 flex-shrink-0 items-center gap-2 rounded-sm border px-3 font-sans text-xs transition-colors ${
              watched
                ? 'border-gold bg-gold text-espresso font-semibold'
                : 'border-line-strong text-parchment-dim hover:border-gold/60 hover:text-parchment'
            }`}
          >
            {watched ? '✓ Watched' : 'Mark watched'}
          </button>
        ) : (
          <div className="w-24 flex-shrink-0 sm:w-32">
            <ProgressBar percent={block.cumulativePercent} showLabel={false} />
            <p className="text-gold mt-1.5 text-right font-mono text-xs tabular-nums">
              {block.cumulativePercent}%
            </p>
          </div>
        )}
      </div>
    </motion.div>
  )
}
