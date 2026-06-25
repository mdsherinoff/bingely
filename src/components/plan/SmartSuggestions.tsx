'use client'

import { useMemo } from 'react'
import { WeekSchedule, PaceMode, MediaType } from '@/types/media'
import { generateSuggestions } from '@/lib/suggestions'
import SuggestionCard from './SuggestionCard'

interface SmartSuggestionsProps {
  schedule: WeekSchedule
  pace: PaceMode
  episodeRuntime: number
  totalEpisodes: number
  mediaType: MediaType
}

export default function SmartSuggestions({
  schedule,
  pace,
  episodeRuntime,
  totalEpisodes,
  mediaType,
}: SmartSuggestionsProps) {
  const suggestions = useMemo(
    () =>
      generateSuggestions(
        schedule,
        pace,
        episodeRuntime,
        totalEpisodes,
        mediaType
      ),
    [schedule, pace, episodeRuntime, totalEpisodes, mediaType]
  )

  if (suggestions.length === 0) return null

  return (
    <div className="flex flex-col gap-3">
      <p className="text-parchment/30 font-mono text-xs tracking-widest">
        SMART SUGGESTIONS
      </p>
      <div className="flex flex-col gap-2">
        {suggestions.map((s, i) => (
          <SuggestionCard key={i} suggestion={s} />
        ))}
      </div>
    </div>
  )
}
