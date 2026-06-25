import { WatchPlan } from '@/types/media'

interface CompletionCardProps {
  plan: WatchPlan
  title: string
}

const paceMessages: Record<string, string> = {
  casual: 'Taking it easy — enjoy every episode.',
  balanced: 'A steady pace that fits real life.',
  binge: 'Full send. No days off.',
  hardcore: 'Respect. Sleep is optional.',
}

export default function CompletionCard({ plan, title }: CompletionCardProps) {
  if (plan.mediaType === 'movie') {
    return (
      <div className="border-gold/20 bg-ink flex flex-col gap-3 rounded-sm border p-6">
        <p className="text-gold/60 font-mono text-xs tracking-widest">
          TONIGHT'S PLAN
        </p>
        <p className="font-display text-parchment text-3xl">{title}</p>
        <p className="font-body text-parchment/50 italic">
          {plan.totalHours}h · one sitting
        </p>
        <div className="bg-gold/10 my-1 h-px" />
        <p className="text-parchment/30 font-mono text-xs">
          Grab the popcorn. You're watching tonight.
        </p>
      </div>
    )
  }

  return (
    <div className="border-gold/20 bg-ink flex flex-col gap-4 rounded-sm border p-6">
      <div className="flex flex-col gap-1">
        <p className="text-gold/60 font-mono text-xs tracking-widest">
          FINISH LINE
        </p>
        <p className="font-display text-parchment text-4xl leading-tight">
          {plan.completionDate}
        </p>
      </div>

      <div className="bg-gold/10 h-px" />

      <div className="grid grid-cols-2 gap-4">
        <div className="flex flex-col gap-0.5">
          <p className="text-parchment/30 font-mono text-xs tracking-widest">
            WEEKS
          </p>
          <p className="font-body text-parchment text-2xl">{plan.totalWeeks}</p>
        </div>
        <div className="flex flex-col gap-0.5">
          <p className="text-parchment/30 font-mono text-xs tracking-widest">
            HOURS
          </p>
          <p className="font-body text-parchment text-2xl">{plan.totalHours}</p>
        </div>
        <div className="flex flex-col gap-0.5">
          <p className="text-parchment/30 font-mono text-xs tracking-widest">
            EPS / WEEK
          </p>
          <p className="font-body text-parchment text-2xl">
            {plan.episodesPerWeek}
          </p>
        </div>
        <div className="flex flex-col gap-0.5">
          <p className="text-parchment/30 font-mono text-xs tracking-widest">
            TOTAL EPS
          </p>
          <p className="font-body text-parchment text-2xl">
            {plan.totalEpisodes}
          </p>
        </div>
      </div>

      <div className="bg-gold/10 h-px" />

      <p className="font-body text-parchment/40 text-sm italic">
        {paceMessages[plan.pace]}
      </p>
    </div>
  )
}
