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

function StatChip({ children }: { children: React.ReactNode }) {
  return (
    <span className="border-gold/30 bg-gold/10 text-parchment rounded-full border px-3 py-1 font-mono text-xs tracking-wide tabular-nums">
      {children}
    </span>
  )
}

export default function CompletionCard({ plan, title }: CompletionCardProps) {
  if (plan.mediaType === 'movie') {
    const multiSession = plan.totalWeeks > 1

    return (
      <div className="border-line bg-ink flex flex-col gap-3 rounded-sm border p-6">
        <p className="text-parchment-dim font-mono text-xs tracking-widest">
          {multiSession ? "YOU'LL FINISH" : "TONIGHT'S PLAN"}
        </p>
        <p className="font-display text-gold text-4xl leading-tight">{title}</p>
        <p className="text-parchment-dim font-sans text-sm">
          {plan.totalHours}h ·{' '}
          {multiSession ? `across ${plan.totalWeeks} weeks` : 'one sitting'}
        </p>
        <div className="bg-line my-1 h-px" />
        <p className="text-parchment-dim font-sans text-sm">
          {multiSession
            ? `You have limited time — finishing ${plan.completionDate}.`
            : "Grab the popcorn. You're watching tonight."}
        </p>
      </div>
    )
  }

  return (
    <div className="border-line bg-ink flex flex-col gap-5 rounded-sm border p-6">
      <div className="flex flex-col gap-1">
        <p className="text-parchment-dim font-mono text-xs tracking-widest">
          YOU&apos;LL FINISH ON
        </p>
        <p className="font-display text-gold text-4xl leading-tight font-bold sm:text-5xl">
          {plan.completionDate}
        </p>
      </div>

      <div className="flex flex-wrap gap-2">
        <StatChip>
          {plan.totalHours}h {plan.startEpisode ? 'left' : 'total'}
        </StatChip>
        <StatChip>{plan.episodesPerWeek} eps / week</StatChip>
        <StatChip>
          {plan.totalWeeks} week{plan.totalWeeks === 1 ? '' : 's'}
        </StatChip>
        <StatChip>
          {plan.startEpisode
            ? `${plan.totalEpisodes - plan.startEpisode + 1} episodes left`
            : `${plan.totalEpisodes} episodes`}
        </StatChip>
      </div>

      <div className="bg-line h-px" />

      <p className="text-parchment-dim font-sans text-sm">
        {paceMessages[plan.pace]}
      </p>
    </div>
  )
}
