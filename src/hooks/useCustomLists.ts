'use client'

import { useState, useEffect, useCallback } from 'react'
import { CustomList, CustomListItem } from '@/types/media'

const STORAGE_KEY = 'bingely_custom_lists'

function generateId(): string {
  return Math.random().toString(36).slice(2, 9)
}

export function useCustomLists() {
  const [lists, setLists] = useState<CustomList[]>([])

  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY)
      if (stored) setLists(JSON.parse(stored))
    } catch {}
  }, [])

  const save = useCallback((updated: CustomList[]) => {
    setLists(updated)
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updated))
    } catch {}
  }, [])

  const createList = useCallback(
    (title: string, items: CustomListItem[]): CustomList => {
      const list: CustomList = {
        id: generateId(),
        title,
        items,
        createdAt: new Date().toISOString(),
      }
      save([...lists, list])
      return list
    },
    [lists, save]
  )

  const getList = useCallback(
    (id: string): CustomList | undefined => {
      return lists.find((l) => l.id === id)
    },
    [lists]
  )

  const deleteList = useCallback(
    (id: string) => {
      save(lists.filter((l) => l.id !== id))
    },
    [lists, save]
  )

  return { lists, createList, getList, deleteList }
}
