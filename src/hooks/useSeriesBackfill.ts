'use client'

import { useEffect, useState } from 'react'
import { CustomListItem } from '@/types/media'
import { withSeriesDetails } from '@/lib/listItems'

// Items as given, with episode data looked up for any series saved (or
// shared) before lists carried it, so their sittings name episodes
export function useSeriesBackfill(
  items: CustomListItem[] | null
): CustomListItem[] | null {
  const [filled, setFilled] = useState<{
    from: CustomListItem[]
    items: CustomListItem[]
  } | null>(null)

  useEffect(() => {
    if (!items) return
    const controller = new AbortController()
    withSeriesDetails(items, controller.signal).then((next) => {
      if (next && !controller.signal.aborted)
        setFilled({ from: items, items: next })
    })
    return () => controller.abort()
  }, [items])

  return filled?.from === items ? filled.items : items
}
