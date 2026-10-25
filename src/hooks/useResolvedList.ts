'use client'

import { useMemo } from 'react'
import { useSearchParams } from 'next/navigation'
import { useCustomLists } from './useCustomLists'
import { CustomList, SharedListItem } from '@/types/media'
import { decodeState } from '@/lib/urlState'
import { fromSharedItem } from '@/lib/listItems'

// Custom lists only ever live in the creator's localStorage. A shared
// link carries the title + items in its own query params, so anyone
// opening it — including on a device that's never seen this list —
// can still resolve a working list instead of hitting "not found".
// `saved` says whether it's in this device's library (and so editable
// in place) or rebuilt from the link.
export function useResolvedList(id: string) {
  const { getList, ready } = useCustomLists()
  const searchParams = useSearchParams()

  const rawItems = searchParams.get('items')
  const rawTitle = searchParams.get('title')

  const resolved = useMemo((): { list: CustomList | null; saved: boolean } => {
    const stored = getList(id)
    if (stored) return { list: stored, saved: true }

    // searchParams.get() has already decoded this; decoding again would
    // throw on a title like "100% Scary"
    const sharedTitle = rawTitle || null
    const sharedItems = rawItems
      ? decodeState<SharedListItem[]>(rawItems)
      : null
    if (!sharedTitle || !sharedItems) return { list: null, saved: false }

    return {
      list: {
        id,
        title: sharedTitle,
        createdAt: new Date().toISOString(),
        items: sharedItems.map(fromSharedItem),
      },
      saved: false,
    }
  }, [id, rawTitle, rawItems, getList])

  return { ...resolved, ready }
}
