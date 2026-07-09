import { WeeklyBlock } from '@/types/media'

interface FilmstripTimelineProps {
  blocks: WeeklyBlock[]
  completionDate: string
}

// Sprocket-holed strip where each frame is one week of the plan.
// Frame brightness maps to how many hours that week carries.
export default function FilmstripTimeline({
  blocks,
  completionDate,
}: FilmstripTimelineProps) {
  const maxHours = Math.max(...blocks.map((b) => b.hoursWatched), 0.1)
  const showNumbers = blocks.length <= 14

  const sprocket: React.CSSProperties = {
    backgroundImage:
      'radial-gradient(circle at 7px 50%, #100c09 2.4px, transparent 2.6px)',
    backgroundSize: '14px 6px',
  }

  return (
    <div className="flex flex-col gap-2">
      <div className="flex items-baseline justify-between">
        <span className="text-parchment-faint font-mono text-xs tracking-widest">
          THE REEL · {blocks.length} WEEK{blocks.length === 1 ? '' : 'S'}
        </span>
        <span className="text-gold font-mono text-xs tabular-nums">
          {completionDate}
        </span>
      </div>

      <div className="border-line bg-ink overflow-hidden rounded-sm border">
        <div aria-hidden className="h-1.5" style={sprocket} />
        <div className="flex h-10">
          {blocks.map((block) => (
            <div
              key={block.week}
              title={`Week ${block.week} · Eps ${block.startEpisode}–${block.endEpisode} · ${block.hoursWatched}h`}
              className="border-espresso flex flex-1 items-center justify-center border-r last:border-r-0"
              style={{
                backgroundColor: `rgba(224, 164, 60, ${
                  0.15 + 0.55 * (block.hoursWatched / maxHours)
                })`,
              }}
            >
              {showNumbers && (
                <span className="text-espresso font-mono text-[10px] font-bold tabular-nums">
                  {block.week}
                </span>
              )}
            </div>
          ))}
        </div>
        <div aria-hidden className="h-1.5" style={sprocket} />
      </div>
    </div>
  )
}
