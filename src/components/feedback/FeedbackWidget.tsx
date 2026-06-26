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
      <button
        onClick={() => setOpen(!open)}
        aria-label="Give feedback"
        className="bg-ink border-gold/20 hover:border-gold/50 text-parchment/60 hover:text-parchment fixed right-6 bottom-6 z-40 rounded-sm border px-4 py-2 font-mono text-xs tracking-widest transition-all"
      >
        FEEDBACK
      </button>

      {/* Panel */}
      {open && (
        <div className="bg-ink border-gold/20 fixed right-6 bottom-16 z-50 flex w-72 flex-col gap-4 rounded-sm border p-5 shadow-xl">
          {submitted ? (
            <div className="flex flex-col items-center gap-2 py-4">
              <span className="text-gold font-mono text-xl">✓</span>
              <p className="font-body text-parchment text-sm">
                Thanks for the feedback!
              </p>
            </div>
          ) : (
            <>
              <div className="flex items-center justify-between">
                <p className="text-parchment/40 font-mono text-xs tracking-widest">
                  FEEDBACK
                </p>
                <button
                  onClick={() => setOpen(false)}
                  aria-label="Close feedback"
                  className="text-parchment/20 hover:text-parchment/50 font-mono text-xs transition-colors"
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
                        : 'border-gold/10 text-parchment/30 hover:border-gold/20'
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
                className="bg-espresso border-gold/20 text-parchment font-body placeholder:text-parchment/20 focus:border-gold/40 resize-none rounded-sm border px-3 py-2 text-sm focus:outline-none"
              />

              <button
                onClick={handleSubmit}
                disabled={!message.trim()}
                className="bg-gold text-espresso font-body hover:bg-gold-muted rounded-sm py-2 text-sm font-semibold transition-colors disabled:cursor-not-allowed disabled:opacity-40"
              >
                Send
              </button>

              <p className="text-parchment/20 text-center font-mono text-xs">
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
