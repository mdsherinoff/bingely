'use client'

import { useState } from 'react'

type FeedbackType = 'bug' | 'suggestion' | 'praise'

export default function FeedbackWidget() {
  const [open, setOpen] = useState(false)
  const [type, setType] = useState<FeedbackType>('suggestion')
  const [message, setMessage] = useState('')
  const [submitted, setSubmitted] = useState(false)

  const handleSubmit = () => {
    if (!message.trim()) return
    // Store in localStorage for now — Day 30 we'll wire this properly
    const feedback = JSON.parse(
      localStorage.getItem('bingely_feedback') || '[]'
    )
    feedback.push({
      type,
      message,
      url: window.location.href,
      timestamp: new Date().toISOString(),
    })
    localStorage.setItem('bingely_feedback', JSON.stringify(feedback))
    setSubmitted(true)
    setTimeout(() => {
      setOpen(false)
      setSubmitted(false)
      setMessage('')
    }, 2000)
  }

  const types: { value: FeedbackType; label: string; icon: string }[] = [
    { value: 'bug', label: 'Bug', icon: '△' },
    { value: 'suggestion', label: 'Idea', icon: '◎' },
    { value: 'praise', label: 'Love it', icon: '★' },
  ]

  return (
    <>
      {/* Trigger button */}
      {/* Compact round icon on phones so it doesn't sit on top of page
          buttons; the full label returns on wider screens */}
      <button
        onClick={() => setOpen(!open)}
        aria-label="Give feedback"
        aria-expanded={open}
        className="bg-ink border-line-strong hover:border-gold/50 text-parchment-dim hover:text-parchment fixed right-4 bottom-4 z-40 flex h-10 w-10 items-center justify-center rounded-full border font-mono text-sm transition-all md:right-6 md:bottom-6 md:h-auto md:w-auto md:rounded-sm md:px-4 md:py-2 md:text-xs md:tracking-widest"
      >
        <span aria-hidden className="md:hidden">
          ✎
        </span>
        <span className="hidden md:inline">FEEDBACK</span>
      </button>

      {/* Panel */}
      {open && (
        <div className="bg-ink border-line-strong fixed right-4 bottom-16 z-50 flex w-[min(18rem,calc(100vw-2rem))] flex-col gap-4 rounded-sm border p-5 shadow-xl md:right-6">
          {submitted ? (
            <div className="flex flex-col items-center gap-2 py-4">
              <span className="text-gold font-mono text-xl">✓</span>
              <p className="text-parchment font-mono text-sm">
                Thanks for the feedback!
              </p>
            </div>
          ) : (
            <>
              <div className="flex items-center justify-between">
                <p className="text-parchment-dim font-mono text-xs tracking-widest">
                  FEEDBACK
                </p>
                <button
                  onClick={() => setOpen(false)}
                  aria-label="Close feedback"
                  className="text-parchment-faint hover:text-parchment-dim font-mono text-xs transition-colors"
                >
                  ✕
                </button>
              </div>

              {/* Type selector */}
              <div className="flex gap-2">
                {types.map((t) => (
                  <button
                    key={t.value}
                    onClick={() => setType(t.value)}
                    className={`flex flex-1 flex-col items-center gap-1 rounded-sm border py-2 text-xs transition-colors ${
                      type === t.value
                        ? 'border-gold/40 bg-espresso text-parchment'
                        : 'border-line text-parchment-faint hover:border-line-strong'
                    } `}
                  >
                    <span className="font-mono">{t.icon}</span>
                    <span className="font-mono tracking-widest">{t.label}</span>
                  </button>
                ))}
              </div>

              {/* Message */}
              <textarea
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder={
                  type === 'bug'
                    ? 'What went wrong?'
                    : type === 'suggestion'
                      ? 'What would make this better?'
                      : 'What did you love?'
                }
                rows={3}
                className="bg-espresso border-line-strong text-parchment placeholder:text-parchment-faint focus:border-gold/40 resize-none rounded-sm border px-3 py-2 font-mono text-sm focus:outline-none"
              />

              <button
                onClick={handleSubmit}
                disabled={!message.trim()}
                className="bg-gold text-espresso hover:bg-gold-muted rounded-sm py-2 font-mono text-sm font-semibold transition-colors disabled:cursor-not-allowed disabled:opacity-40"
              >
                Send
              </button>

              <p className="text-parchment-faint text-center font-mono text-xs">
                Page:{' '}
                {typeof window !== 'undefined' ? window.location.pathname : ''}
              </p>
            </>
          )}
        </div>
      )}
    </>
  )
}
