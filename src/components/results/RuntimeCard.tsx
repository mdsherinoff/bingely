import { WatchPlan } from '@/types/media'

interface RuntimeCardProps {
  plan: WatchPlan
}

function formatHours(hours: number): string {
  const h = Math.floor(hours)
  const m = Math.round((hours - h) * 60)
  if (m === 0) return `${h}h`
  return `${h}h ${m}m`
}

function humanizeDuration(weeks: number): string {
  if (weeks < 4) return `${weeks} weeks`
  const months = Math.floor(weeks / 4.33)
  const remWeeks = Math.round(weeks - months * 4.33)
  if (months === 0) return `${remWeeks} weeks`
  if (remWeeks === 0) return `${months} month${months > 1 ? 's' : ''}`
  return `${months} month${months > 1 ? 's' : ''}, ${remWeeks} week${remWeeks > 1 ? 's' : ''}`
}

export default function RuntimeCard({ plan }: RuntimeCardProps) {
  if (plan.mediaType === 'movie') return null

  const daysOfWatching = Math.round((plan.totalHours / 24) * 10) / 10
  const duration = humanizeDuration(plan.totalWeeks)

  return (
    <div className="border-gold/10 flex flex-col gap-4 rounded-sm border p-5">
      <p className="text-parchment/30 font-mono text-xs tracking-widest">
        IN PERSPECTIVE
      </p>
      <div className="flex flex-col gap-3">
        <div className="flex items-baseline justify-between">
          <p className="font-body text-parchment/60 text-sm">
            Total watch time
          </p>
          <p className="text-parchment font-mono text-sm">
            {formatHours(plan.totalHours)}
          </p>
        </div>
        <div className="flex items-baseline justify-between">
          <p className="font-body text-parchment/60 text-sm">That's</p>
          <p className="text-parchment font-mono text-sm">
            {daysOfWatching} full days
          </p>
        </div>
        <div className="flex items-baseline justify-between">
          <p className="font-body text-parchment/60 text-sm">
            Journey duration
          </p>
          <p className="text-parchment font-mono text-sm">{duration}</p>
        </div>
      </div>
    </div>
  )
}
