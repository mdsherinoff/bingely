import { Milestone, Season } from '@/types/media'
import { episodeLabel } from '@/lib/episodes'
import { Badge } from '@/components/ui'

interface MilestoneCardProps {
  milestone: Milestone
  isLast?: boolean
  // List plans count whole titles by watch time, so an episode number
  // means nothing there
  showEpisode?: boolean
  seasons?: Season[]
}

export default function MilestoneCard({
  milestone,
  isLast = false,
  showEpisode = true,
  seasons,
}: MilestoneCardProps) {
  return (
    <div className="flex items-start gap-4">
      {/* Spine */}
      <div className="flex flex-shrink-0 flex-col items-center">
        <div
          className={`mt-1 h-3 w-3 rounded-full border ${
            isLast ? 'bg-gold border-gold' : 'border-gold/40 bg-transparent'
          } `}
        />
        {!isLast && (
          <div className="bg-gold/10 mt-1 min-h-[2rem] w-px flex-1" />
        )}
      </div>

      {/* Content */}
      <div className="flex flex-col gap-1.5 pb-6">
        <div className="flex items-center gap-2">
          <p className="text-parchment font-sans text-base">
            {milestone.label}
          </p>
          <Badge variant={isLast ? 'gold' : 'muted'}>
            {milestone.percent}%
          </Badge>
        </div>
        <p className="text-parchment-faint font-mono text-xs">
          Week {milestone.week}
          {showEpisode && ` · ${episodeLabel(milestone.episode, seasons)}`}
        </p>
      </div>
    </div>
  )
}
