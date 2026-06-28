'use client'

import { useState, useEffect, useCallback } from 'react'

const STORAGE_KEY = 'bingely_cinema_mode'

export function useCinemaMode() {
  const [classic, setClassic] = useState(false)

  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY)
      if (stored === 'true') {
        setClassic(true)
        document.documentElement.classList.add('cinema-classic')
      }
    } catch {}
  }, [])

  const toggle = useCallback(() => {
    setClassic((prev) => {
      const next = !prev
      try {
        localStorage.setItem(STORAGE_KEY, String(next))
      } catch {}
      if (next) {
        document.documentElement.classList.add('cinema-classic')
      } else {
        document.documentElement.classList.remove('cinema-classic')
      }
      return next
    })
  }, [])

  const enable = useCallback(() => {
    setClassic(true)
    try {
      localStorage.setItem(STORAGE_KEY, 'true')
    } catch {}
    document.documentElement.classList.add('cinema-classic')
  }, [])

  return { classic, toggle, enable }
}
