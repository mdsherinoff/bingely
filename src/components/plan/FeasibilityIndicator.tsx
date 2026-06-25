import { PlanFeasibility } from '@/lib/scheduler'

interface FeasibilityIndicatorProps {
  feasibility: PlanFeasibility
}

export default function FeasibilityIndicator({
  feasibility,
}: FeasibilityIndicatorProps) {
  const {
    feasible,
    requiredHoursPerDay,
    availableHoursPerDay,
    recommendation,
  } = feasibility

  const ratio = requiredHoursPerDay / Math.max(availableHoursPerDay, 0.1)
  const fillPercent = Math.min(
    100,
    Math.round(
      (availableHoursPerDay / Math.max(requiredHoursPerDay, 0.1)) * 100
    )
  )

  return (
    <div
      className={`flex flex-col gap-3 rounded-sm border p-4 ${feasible ? 'border-gold/20 bg-ink' : ratio > 1.5 ? 'border-rose/30 bg-rose/5' : 'border-gold/30 bg-ink'} `}
    >
      <div className="flex items-center justify-between">
        <p className="text-parchment/40 font-mono text-xs tracking-widest">
          DEADLINE FEASIBILITY
        </p>
        <span
          className={`font-mono text-xs tracking-widest ${feasible ? 'text-gold' : ratio > 1.5 ? 'text-rose' : 'text-gold/60'} `}
        >
          {feasible ? '✓ ACHIEVABLE' : ratio > 1.5 ? '✗ VERY TOUGH' : '△ TIGHT'}
        </span>
      </div>

      {/* Bar */}
      <div className="flex flex-col gap-1">
        <div className="bg-espresso h-1.5 overflow-hidden rounded-full">
          <div
            className={`h-full rounded-full transition-all duration-500 ${feasible ? 'bg-gold' : 'bg-rose'}`}
            style={{ width: `${fillPercent}%` }}
          />
        </div>
        <div className="flex justify-between">
          <p className="text-parchment/30 font-mono text-xs">
            Need {requiredHoursPerDay}h/day
          </p>
          <p className="text-parchment/30 font-mono text-xs">
            Have {availableHoursPerDay}h/day
          </p>
        </div>
      </div>

      <p className="font-body text-parchment/50 text-sm leading-relaxed">
        {recommendation}
      </p>
    </div>
  )
}
