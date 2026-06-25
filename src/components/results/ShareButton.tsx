'use client'

import { useState } from 'react'
import { Button } from '@/components/ui'

export default function ShareButton() {
  const [copied, setCopied] = useState(false)

  const handleCopy = async () => {
    await navigator.clipboard.writeText(window.location.href)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <Button variant="secondary" onClick={handleCopy} className="w-full">
      {copied ? '✓ Link copied' : 'Share plan'}
    </Button>
  )
}
