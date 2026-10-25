'use client'

import { useState, useEffect, useCallback } from 'react'
import { CustomList, CustomListItem } from '@/types/media'
import { withSeriesDetails } from '@/lib/listItems'

const STORAGE_KEY = 'bingely_custom_lists'

function generateId(): string {
  return Math.random().toString(36).slice(2, 9)
}

function readStored(): CustomList[] {
  try {
    const stored = localStorage.getItem(STORAGE_KEY)
    return stored ? JSON.parse(stored) : []
  } catch {
    return []
  }
}

export function useCustomLists() {
  const [lists, setLists] = useState<CustomList[]>([])
  // False until localStorage has been read, so pages can avoid
  // flashing "not found" during the first client render
  const [ready, setReady] = useState(false)

  useEffect(() => {
    setLists(readStored())
    setReady(true)
  }, [])

  // Every write starts from what's stored now, not this hook's copy:
  // several components hold their own copy, and a stale one would
  // otherwise overwrite another's edits
  const write = useCallback(
    (change: (current: CustomList[]) => CustomList[]) => {
      const updated = change(readStored())
      setLists(updated)
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(updated))
      } catch {}
    },
    []
  )

  // Lists saved before series carried episode counts get them filled in
  // once, so their plans book (and name) whole episodes
  useEffect(() => {
    const controller = new AbortController()
    Promise.all(
      readStored().map(async (l) => ({
        id: l.id,
        items: await withSeriesDetails(l.items, controller.signal),
      }))
    ).then((results) => {
      if (controller.signal.aborted) return
      const fills = results.filter((r) => r.items)
      if (!fills.length) return
      // Only fill series still missing data, so edits made meanwhile stand
      write((current) =>
        current.map((l) => {
          const fill = fills.find((f) => f.id === l.id)?.items
          if (!fill) return l
          return {
            ...l,
            items: l.items.map((item) => {
              if (item.episodes) return item
              const f = fill.find((x) => x.tmdbId === item.tmdbId)
              return f?.episodes
                ? { ...item, episodes: f.episodes, seasons: f.seasons }
                : item
            }),
          }
        })
      )
    })
    return () => controller.abort()
  }, [write])

  const createList = useCallback(
    (title: string, items: CustomListItem[]): CustomList => {
      const list: CustomList = {
        id: generateId(),
        title,
        items,
        createdAt: new Date().toISOString(),
      }
      write((current) => [...current, list])
      return list
    },
    [write]
  )

  const updateList = useCallback(
    (id: string, changes: Partial<Pick<CustomList, 'title' | 'items'>>) => {
      write((current) =>
        current.map((l) =>
          l.id === id
            ? { ...l, ...changes, updatedAt: new Date().toISOString() }
            : l
        )
      )
    },
    [write]
  )

  const getList = useCallback(
    (id: string): CustomList | undefined => {
      return lists.find((l) => l.id === id)
    },
    [lists]
  )

  const deleteList = useCallback(
    (id: string) => {
      write((current) => current.filter((l) => l.id !== id))
    },
    [write]
  )

  return { lists, ready, createList, updateList, getList, deleteList }
}
