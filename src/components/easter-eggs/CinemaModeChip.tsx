'use client'

import { useEffect, useState } from 'react'

const STORAGE_KEY = 'bingely_cinema_mode'
const CLASS = 'cinema-classic'

// Classic (black & white) mode is unlocked by an easter egg and then
// sticks across visits. Without a visible way out, people assumed the
// site had lost its colour — so show an exit whenever it's on.
export default function CinemaModeChip() {
  const [on, setOn] = useState(false)

  useEffect(() => {
    const root = document.documentElement
    try {
      if (localStorage.getItem(STORAGE_KEY) === 'true') root.classList.add(CLASS)
    } catch {}
    setOn(root.classList.contains(CLASS))

    // Stay in sync when the easter egg switches the mode on elsewhere
    const observer = new MutationObserver(() =>
      setOn(root.classList.contains(CLASS))
    )
    observer.observe(root, { attributes: true, attributeFilter: ['class'] })
    return () => observer.disconnect()
  }, [])

  if (!on) return null

  const exit = () => {
    document.documentElement.classList.remove(CLASS)
    try {
      localStorage.setItem(STORAGE_KEY, 'false')
    } catch {}
  }

  return (
    <button
      onClick={exit}
      className="bg-ink border-line-strong text-parchment hover:border-gold/60 fixed top-20 left-1/2 z-50 -translate-x-1/2 rounded-full border px-4 py-2 font-sans text-xs shadow-lg transition-colors"
    >
      Classic mode is on · Back to colour
    </button>
  )
}
