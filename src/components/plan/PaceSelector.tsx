'use client'

import { PaceMode } from '@/types/media'

interface PaceSelectorProps {
  value: PaceMode
  onChange: (pace: PaceMode) => void
}

const paces: {
  mode: PaceMode
  label: string
  desc: string
  multiplier: string
}[] = [
  {
    mode: 'casual',
    label: 'Casual',
    desc: 'Relaxed viewing, no pressure',
    multiplier: '×0.6',
  },
  {
    mode: 'balanced',
    label: 'Balanced',
    desc: 'Steady pace, life friendly',
    multiplier: '×0.8',
  },
  {
    mode: 'binge',
    label: 'Binge',
    desc: 'All available time used',
    multiplier: '×1.0',
  },
  {
    mode: 'hardcore',
    label: 'Hardcore',
    desc: 'Maximum episodes possible',
    multiplier: '×1.2',
  },
]

export default function PaceSelector({ value, onChange }: PaceSelectorProps) {
  return (
    <div
      role="radiogroup"
      aria-label="Viewing pace"
      className="flex flex-col gap-3"
    >
      {paces.map((p) => (
        <button
          key={p.mode}
          onClick={() => onChange(p.mode)}
          role="radio"
          aria-checked={value === p.mode}
          className={`flex items-center justify-between rounded-sm border p-4 text-left transition-colors ${
            value === p.mode
              ? 'border-gold/50 bg-ink'
              : 'border-gold/10 hover:border-gold/20'
          } `}
        >
          <div className="flex flex-col gap-0.5">
            <span
              className={`font-mono text-base ${value === p.mode ? 'text-parchment' : 'text-parchment/50'}`}
            >
              {p.label}
            </span>
            <span className="text-parchment/30 font-mono text-xs">
              {p.desc}
            </span>
          </div>
          <span
            className={`font-mono text-sm ${value === p.mode ? 'text-gold' : 'text-parchment/20'}`}
          >
            {p.multiplier}
          </span>
        </button>
      ))}
    </div>
  )
}
