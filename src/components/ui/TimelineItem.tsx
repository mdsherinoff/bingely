interface TimelineItemProps {
  week: number
  episodes: number
  label: string
  isComplete?: boolean
  isCurrent?: boolean
}

export default function TimelineItem({
  week,
  episodes,
  label,
  isComplete = false,
  isCurrent = false,
}: TimelineItemProps) {
  return (
    <div className="flex items-start gap-4">
      {/* Spine */}
      <div className="flex flex-col items-center">
        <div
          className={`mt-1 h-3 w-3 flex-shrink-0 rounded-full border ${
            isComplete
              ? 'bg-cinema-white border-cinema-white'
              : isCurrent
                ? 'bg-cinema-silver border-cinema-silver'
                : 'border-cinema-border bg-transparent'
          } `}
        />
        <div className="bg-parchment/10 mt-1 w-px flex-1" />
      </div>
      {/* Content */}
      <div className="pb-6">
        <p className="text-parchment/40 mb-1 font-mono text-xs tracking-widest">
          WEEK {week}
        </p>
        <p className="font-body text-parchment text-base">{label}</p>
        <p className="text-gold/70 mt-1 font-mono text-xs">
          {episodes} episodes
        </p>
      </div>
    </div>
  )
}
