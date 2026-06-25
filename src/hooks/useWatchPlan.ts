'use client'

import { useState, useEffect } from 'react'
import { AvailabilityConfig, WatchPlan, MediaType } from '@/types/media'

export function useWatchPlan(
  config: AvailabilityConfig | null,
  totalEpisodes: number,
  mediaType: MediaType,
  runtime?: number
) {
  const [plan, setPlan] = useState<WatchPlan | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!config || !totalEpisodes) return

    async function generate() {
      setLoading(true)
      setError(null)
      try {
        const res = await fetch('/api/plan', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ config, totalEpisodes, mediaType, runtime }),
        })
        if (!res.ok) throw new Error('Failed to generate plan')
        const data = await res.json()
        setPlan(data)
      } catch {
        setError('Failed to generate watch plan')
      } finally {
        setLoading(false)
      }
    }

    generate()
  }, [config, totalEpisodes, mediaType, runtime])

  return { plan, loading, error }
}
