'use client'

import { NewSeasonGoal } from '@/types/media'

interface NewSeasonFormProps {
  value: NewSeasonGoal
  totalEpisodes: number
  onChange: (goal: NewSeasonGoal) => void
}

export default function NewSeasonForm({
  value,
  totalEpisodes,
  onChange,
}: NewSeasonFormProps) {
  const today = new Date().toISOString().split('T')[0]

  return (
    <div className="border-gold/10 bg-ink flex flex-col gap-4 rounded-sm border p-4">
      <div className="flex flex-col gap-1.5">
        <label className="text-parchment/40 font-mono text-xs tracking-widest uppercase">
          New season / event name
        </label>
        <input
          type="text"
          placeholder="e.g. One Piece Season 2, Wano Arc..."
          value={value.seasonName}
          onChange={(e) => onChange({ ...value, seasonName: e.target.value })}
          className="bg-espresso border-gold/20 text-parchment font-body placeholder:text-parchment/20 focus:border-gold/50 rounded-sm border px-3 py-2 text-sm focus:outline-none"
        />
      </div>

      <div className="flex flex-col gap-1.5">
        <label className="text-parchment/40 font-mono text-xs tracking-widest uppercase">
          Must be ready by
        </label>
        <input
          type="date"
          min={today}
          value={value.targetDate}
          onChange={(e) => onChange({ ...value, targetDate: e.target.value })}
          className="bg-espresso border-gold/20 text-parchment focus:border-gold/50 w-fit rounded-sm border px-3 py-2 font-mono text-sm focus:outline-none"
        />
      </div>

      <div className="flex flex-col gap-1.5">
        <label className="text-parchment/40 font-mono text-xs tracking-widest uppercase">
          Currently on episode
        </label>
        <div className="flex items-center gap-3">
          <input
            type="number"
            min={1}
            max={totalEpisodes}
            value={value.currentEpisode}
            onChange={(e) =>
              onChange({ ...value, currentEpisode: Number(e.target.value) })
            }
            className="bg-espresso border-gold/20 text-parchment focus:border-gold/50 w-24 rounded-sm border px-3 py-2 font-mono text-sm focus:outline-none"
          />
          <span className="text-parchment/30 font-mono text-xs">
            of {totalEpisodes} episodes
          </span>
        </div>
      </div>

      {value.currentEpisode > 1 && (
        <div className="border-gold/10 border-t pt-3">
          <p className="text-gold/50 font-mono text-xs">
            {totalEpisodes - value.currentEpisode + 1} episodes remaining
          </p>
        </div>
      )}
    </div>
  )
}
