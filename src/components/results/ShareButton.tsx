'use client'

import { useEffect, useRef, useState } from 'react'
import { Button } from '@/components/ui'

interface ShareButtonProps {
  title?: string
  className?: string
}

type Status = 'idle' | 'copied' | 'failed'

// Prefer a short /s/… link (hard to cut off when pasted around); fall
// back to the full URL if short links aren't set up or the call fails
async function fetchShortUrl(): Promise<string | null> {
  try {
    const res = await fetch('/api/share', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        path: window.location.pathname + window.location.search,
      }),
    })
    if (!res.ok) return null
    const { url } = await res.json()
    return typeof url === 'string' ? url : null
  } catch {
    return null
  }
}

export default function ShareButton({
  title,
  className = 'w-full',
}: ShareButtonProps) {
  const [status, setStatus] = useState<Status>('idle')
  // Fetched up front: browsers only allow the share sheet and clipboard
  // directly in response to a tap, so the link must be ready by then
  const shortUrl = useRef<Promise<string | null> | null>(null)
  const resolved = useRef<string | null>(null)

  useEffect(() => {
    const pending = fetchShortUrl()
    shortUrl.current = pending
    pending.then((url) => {
      resolved.current = url
    })
  }, [])

  const flash = (next: Status) => {
    setStatus(next)
    setTimeout(() => setStatus('idle'), 2500)
  }

  const handleShare = async () => {
    const long = window.location.href
    const url = resolved.current ?? long

    // Phones get the native share sheet (Messages, WhatsApp, …);
    // desktops get a plain copy, which is what people expect there
    const isTouch = window.matchMedia('(pointer: coarse)').matches
    if (isTouch && navigator.share) {
      try {
        await navigator.share({
          title: title ? `${title} — watch plan` : 'My watch plan',
          url,
        })
        return
      } catch (err) {
        // Dismissing the sheet isn't a failure; anything else falls
        // through to copying
        if (err instanceof DOMException && err.name === 'AbortError') return
      }
    }

    try {
      if (!resolved.current && shortUrl.current && 'ClipboardItem' in window) {
        // Still fetching: hand the clipboard a promise so the write stays
        // tied to this tap (required by Safari)
        const text = shortUrl.current.then(
          (u) => new Blob([u ?? long], { type: 'text/plain' })
        )
        await navigator.clipboard.write([new ClipboardItem({ 'text/plain': text })])
      } else {
        await navigator.clipboard.writeText(url)
      }
      flash('copied')
    } catch {
      flash('failed')
    }
  }

  const label =
    status === 'copied'
      ? '✓ Link copied'
      : status === 'failed'
        ? 'Copy the address bar instead'
        : 'Share plan'

  return (
    <Button variant="secondary" onClick={handleShare} className={className}>
      <span aria-live="polite">{label}</span>
    </Button>
  )
}
