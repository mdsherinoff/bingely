import { WeeklyBlock } from '@/types/media'
import ProgressBar from './ProgressBar'

interface WeekRowProps {
  block: WeeklyBlock
  totalEpisodes: number
}

export default function WeekRow({ block, totalEpisodes }: WeekRowProps) {
  const isLast = block.endEpisode >= totalEpisodes

  return (
    <div
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
    </div>
  )
}
