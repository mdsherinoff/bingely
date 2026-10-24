'use client'

import { PaceMode } from '@/types/media'

interface PaceSelectorProps {
  value: PaceMode
  onChange: (pace: PaceMode) => void
  // What each pace means for the plan being built (e.g. "4 eps / wk").
  // Shown instead of the abstract share of free time when provided.
  estimates?: Partial<Record<PaceMode, string>>
}

const paces: {
  mode: PaceMode
  label: string
  desc: string
  share: string
}[] = [
  {
    mode: 'casual',
    label: 'Casual',
    desc: 'Relaxed viewing, no pressure',
    share: 'Uses 60% of your free time',
  },
  {
    mode: 'balanced',
    label: 'Balanced',
    desc: 'Steady pace, life friendly',
    share: 'Uses 80% of your free time',
  },
  {
    mode: 'binge',
    label: 'Binge',
    desc: 'All available time used',
    share: 'Uses all your free time',
  },
  {
    mode: 'hardcore',
    label: 'Hardcore',
    desc: 'Squeezes in extra episodes',
    share: 'Runs 20% past your free time',
  },
]

export default function PaceSelector({
  value,
  onChange,
  estimates,
}: PaceSelectorProps) {
  return (
    <div
      role="radiogroup"
      aria-label="Viewing pace"
      className="grid grid-cols-2 gap-3"
    >
      {paces.map((p) => {
        const selected = value === p.mode
        const estimate = estimates?.[p.mode]
        return (
          <button
            key={p.mode}
            onClick={() => onChange(p.mode)}
            role="radio"
            aria-checked={selected}
            className={`flex flex-col gap-1 rounded-sm border p-4 text-left transition-colors ${
              selected
                ? 'border-gold/60 bg-ink'
                : 'border-line hover:border-line-strong'
            }`}
          >
            <span
              className={`font-sans text-base font-medium ${selected ? 'text-parchment' : 'text-parchment-dim'}`}
            >
              {p.label}
            </span>
            <span className="text-parchment-faint font-sans text-xs leading-snug">
              {p.desc}
            </span>
            <span
              className={`mt-1 font-mono text-xs tabular-nums ${selected ? 'text-gold' : 'text-parchment-faint'}`}
            >
              {estimate ?? p.share}
            </span>
          </button>
        )
      })}
    </div>
  )
}
