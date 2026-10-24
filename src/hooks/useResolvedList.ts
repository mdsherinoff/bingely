'use client'

import { useMemo } from 'react'
import { useSearchParams } from 'next/navigation'
import { useCustomLists } from './useCustomLists'
import { CustomList } from '@/types/media'
import { decodeState } from '@/lib/urlState'

interface SharedListItem {
  title: string
  runtime: number
  mediaType: 'movie' | 'tv'
}

// Custom lists only ever live in the creator's localStorage. A shared
// link carries the title + items in its own query params, so anyone
// opening it — including on a device that's never seen this list —
// can still resolve a working list instead of hitting "not found".
export function useResolvedList(id: string) {
  const { getList, ready } = useCustomLists()
  const searchParams = useSearchParams()

  const rawItems = searchParams.get('items')
  const rawTitle = searchParams.get('title')

  const list: CustomList | null = useMemo(() => {
    const stored = getList(id)
    if (stored) return stored

    // searchParams.get() has already decoded this; decoding again would
    // throw on a title like "100% Scary"
    const sharedTitle = rawTitle || null
    const sharedItems = rawItems
      ? decodeState<SharedListItem[]>(rawItems)
      : null
    if (!sharedTitle || !sharedItems) return null

    return {
      id,
      title: sharedTitle,
      createdAt: new Date().toISOString(),
      items: sharedItems.map((item, i) => ({
        tmdbId: -1 - i,
        title: item.title,
        mediaType: item.mediaType,
        posterPath: null,
        runtime: item.runtime,
        releaseYear: '',
      })),
    }
  }, [id, rawTitle, rawItems, getList])

  return { list, ready }
}
