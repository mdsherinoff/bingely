'use client'

import { useState } from 'react'
import { GoalMode, WatchGoal, NewSeasonGoal } from '@/types/media'
import NewSeasonForm from './NewSeasonForm'

interface GoalModeSelectorProps {
  value: WatchGoal
  onChange: (goal: WatchGoal) => void
  totalEpisodes?: number
}

const modes: { mode: GoalMode; label: string; desc: string; icon: string }[] = [
  {
    mode: 'standard',
    label: 'Standard',
    desc: 'Pick a pace and watch consistently',
    icon: '◎',
  },
  {
    mode: 'finish-before',
    label: 'Finish Before',
    desc: 'Must finish by a specific date',
    icon: '◈',
  },
  {
    mode: 'vacation',
    label: 'Vacation Mode',
    desc: 'Concentrated viewing over a trip',
    icon: '◉',
  },
  {
    mode: 'new-season',
    label: 'New Season Prep',
    desc: 'Catch up before the next season drops',
    icon: '◆',
  },
]

export default function GoalModeSelector({
  value,
  onChange,
  totalEpisodes,
}: GoalModeSelectorProps) {
  const today = new Date().toISOString().split('T')[0]

  const [localDate, setLocalDate] = useState('')
  const [vacStart, setVacStart] = useState('')
  const [vacEnd, setVacEnd] = useState('')
  const [hoursPerDay, setHoursPerDay] = useState(4)
  const [newSeasonData, setNewSeasonData] = useState<{
    seasonName: string
    targetDate: string
    currentEpisode: number
  }>({
    seasonName: '',
    targetDate: today,
    currentEpisode: 1,
  })

  const handleModeChange = (mode: GoalMode) => {
    if (mode === 'standard') {
      onChange({ mode: 'standard' })
    } else if (mode === 'finish-before') {
      onChange({ mode: 'finish-before', targetDate: localDate || today })
    } else if (mode === 'vacation') {
      onChange({
        mode: 'vacation',
        startDate: vacStart || today,
        endDate: vacEnd || today,
        hoursPerDay,
      })
    } else if (mode === 'new-season') {
      onChange({
        mode: 'new-season',
        seasonName: newSeasonData.seasonName,
        targetDate: newSeasonData.targetDate,
        currentEpisode: newSeasonData.currentEpisode,
      })
    }
  }

  const updateFinishBefore = (date: string) => {
    setLocalDate(date)
    onChange({ mode: 'finish-before', targetDate: date })
  }

  const updateVacation = (start: string, end: string, hours: number) => {
    onChange({
      mode: 'vacation',
      startDate: start,
      endDate: end,
      hoursPerDay: hours,
    })
  }

  return (
    <div className="flex flex-col gap-3">
      {/* Mode pills */}
      <div className="flex flex-wrap gap-2">
        {modes.map((m) => (
          <button
            key={m.mode}
            onClick={() => handleModeChange(m.mode)}
            className={`flex items-center gap-2 rounded-sm border px-4 py-2 text-sm transition-colors ${
              value.mode === m.mode
                ? 'border-gold/50 bg-ink text-parchment'
                : 'border-gold/10 text-parchment/40 hover:border-gold/20 hover:text-parchment/60'
            } `}
          >
            <span className="font-mono text-xs">{m.icon}</span>
            <span className="font-body">{m.label}</span>
          </button>
        ))}
      </div>

      {/* Mode description */}
      <p className="text-parchment/30 font-mono text-xs">
        {modes.find((m) => m.mode === value.mode)?.desc}
      </p>

      {/* Finish Before inputs */}
      {value.mode === 'finish-before' && (
        <div className="border-gold/10 bg-ink flex flex-col gap-2 rounded-sm border p-4">
          <label className="text-parchment/40 font-mono text-xs tracking-widest uppercase">
            Must finish by
          </label>
          <input
            type="date"
            min={today}
            value={localDate}
            onChange={(e) => updateFinishBefore(e.target.value)}
            className="bg-espresso border-gold/20 text-parchment focus:border-gold/50 w-fit rounded-sm border px-3 py-2 font-mono text-sm focus:outline-none"
          />
        </div>
      )}

      {/* Vacation inputs */}
      {value.mode === 'vacation' && (
        <div className="border-gold/10 bg-ink flex flex-col gap-3 rounded-sm border p-4">
          <div className="grid grid-cols-2 gap-3">
            <div className="flex flex-col gap-1.5">
              <label className="text-parchment/40 font-mono text-xs tracking-widest uppercase">
                Start date
              </label>
              <input
                type="date"
                min={today}
                value={vacStart}
                onChange={(e) => {
                  setVacStart(e.target.value)
                  updateVacation(e.target.value, vacEnd, hoursPerDay)
                }}
                className="bg-espresso border-gold/20 text-parchment focus:border-gold/50 rounded-sm border px-3 py-2 font-mono text-xs focus:outline-none"
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="text-parchment/40 font-mono text-xs tracking-widest uppercase">
                End date
              </label>
              <input
                type="date"
                min={vacStart || today}
                value={vacEnd}
                onChange={(e) => {
                  setVacEnd(e.target.value)
                  updateVacation(vacStart, e.target.value, hoursPerDay)
                }}
                className="bg-espresso border-gold/20 text-parchment focus:border-gold/50 rounded-sm border px-3 py-2 font-mono text-xs focus:outline-none"
              />
            </div>
          </div>
          <div className="flex flex-col gap-1.5">
            <label className="text-parchment/40 font-mono text-xs tracking-widest uppercase">
              Hours per day
            </label>
            <div className="flex items-center gap-4">
              <input
                type="range"
                min={1}
                max={16}
                value={hoursPerDay}
                onChange={(e) => {
                  const h = Number(e.target.value)
                  setHoursPerDay(h)
                  updateVacation(vacStart, vacEnd, h)
                }}
                className="accent-gold flex-1"
              />
              <span className="text-parchment w-12 font-mono text-sm">
                {hoursPerDay}h/day
              </span>
            </div>
          </div>
        </div>
      )}

      {/* New Season inputs */}
      {value.mode === 'new-season' && (
        <NewSeasonForm
          value={value as NewSeasonGoal}
          totalEpisodes={totalEpisodes ?? 100}
          onChange={(updated) => {
            setNewSeasonData({
              seasonName: updated.seasonName,
              targetDate: updated.targetDate,
              currentEpisode: updated.currentEpisode,
            })
            onChange(updated)
          }}
        />
      )}
    </div>
  )
}
