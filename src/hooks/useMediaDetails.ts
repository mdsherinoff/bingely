'use client'

import { useState, useEffect } from 'react'
import { MediaItem, MediaType } from '@/types/media'

export function useMediaDetails(id: number, type: MediaType) {
  const [media, setMedia] = useState<MediaItem | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function fetch_() {
      setLoading(true)
      setError(null)
      try {
        const res = await fetch(`/api/media/${id}?type=${type}`)
        if (!res.ok) throw new Error('Failed to fetch')
        const data = await res.json()
        setMedia(data)
      } catch {
        setError('Failed to load media details')
      } finally {
        setLoading(false)
      }
    }

    fetch_()
  }, [id, type])

  return { media, loading, error }
}
