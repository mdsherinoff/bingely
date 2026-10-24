'use client'

import { useState } from 'react'
import { Button } from '@/components/ui'

interface ShareButtonProps {
  title?: string
  className?: string
}

type Status = 'idle' | 'copied' | 'failed'

export default function ShareButton({
  title,
  className = 'w-full',
}: ShareButtonProps) {
  const [status, setStatus] = useState<Status>('idle')

  const flash = (next: Status) => {
    setStatus(next)
    setTimeout(() => setStatus('idle'), 2500)
  }

  const handleShare = async () => {
    const url = window.location.href
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
      await navigator.clipboard.writeText(url)
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
