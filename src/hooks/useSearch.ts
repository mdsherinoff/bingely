'use client'

import { useState, useEffect, useCallback } from 'react'
import { MediaItem } from '@/types/media'

export function useSearch(initialQuery: string = '') {
  const [query, setQuery] = useState(initialQuery)
  const [results, setResults] = useState<MediaItem[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const fetchTrending = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const res = await fetch('/api/trending')
      if (!res.ok) throw new Error('Failed')
      const data = await res.json()
      setResults(data)
    } catch {
      setError('Failed to load trending')
    } finally {
      setLoading(false)
    }
  }, [])

  const search = useCallback(
    async (q: string) => {
      if (!q.trim()) {
        fetchTrending()
        return
      }
      setLoading(true)
      setError(null)
      try {
        const res = await fetch(`/api/search?q=${encodeURIComponent(q)}`)
        if (!res.ok) throw new Error('Failed')
        const data = await res.json()
        setResults(data)
      } catch {
        setError('Search failed')
      } finally {
        setLoading(false)
      }
    },
    [fetchTrending]
  )

  useEffect(() => {
    if (initialQuery) {
      search(initialQuery)
    } else {
      fetchTrending()
    }
  }, [initialQuery, search, fetchTrending])

  return { query, setQuery, results, loading, error, search }
}
