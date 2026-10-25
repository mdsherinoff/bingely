'use client'

import { useEffect, useRef, useState } from 'react'

type FeedbackType = 'bug' | 'suggestion' | 'praise'

// Feedback opens the visitor's email app with a pre-filled message.
// No server or third-party form involved, and it's clear where it goes.
const FEEDBACK_EMAIL = 'mohammedsherinofficial@gmail.com'

const TYPES: {
  value: FeedbackType
  label: string
  icon: string
  subject: string
}[] = [
  { value: 'bug', label: 'Bug', icon: '△', subject: 'Bug report' },
  { value: 'suggestion', label: 'Idea', icon: '◎', subject: 'Idea' },
  { value: 'praise', label: 'Love it', icon: '★', subject: 'Love it' },
]

export default function FeedbackWidget() {
  const [open, setOpen] = useState(false)
  const [type, setType] = useState<FeedbackType>('suggestion')
  const [message, setMessage] = useState('')
  const [sent, setSent] = useState(false)
  const [copied, setCopied] = useState(false)
  const [page, setPage] = useState('')
  const textarea = useRef<HTMLTextAreaElement>(null)
  const trigger = useRef<HTMLButtonElement>(null)

  useEffect(() => {
    if (!open) return
    setPage(window.location.pathname)
    textarea.current?.focus()
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setOpen(false)
        trigger.current?.focus()
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [open])

  const handleSend = () => {
    if (!message.trim()) return
    const subject = `[Bingely] ${TYPES.find((t) => t.value === type)?.subject ?? 'Feedback'}`
    const body = `${message.trim()}\n\n—\nPage: ${window.location.href}`
    const link = document.createElement('a')
    link.href = `mailto:${FEEDBACK_EMAIL}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`
    link.click()
    setSent(true)
  }

  const copyAddress = async () => {
    try {
      await navigator.clipboard.writeText(FEEDBACK_EMAIL)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch {}
  }

  const close = () => {
    setOpen(false)
    setSent(false)
    trigger.current?.focus()
  }

  return (
    <>
      {/* Compact round icon on phones so it doesn't sit on top of page
          buttons; the full label returns on wider screens */}
      <button
        ref={trigger}
        onClick={() => (open ? close() : setOpen(true))}
        aria-label="Give feedback"
        aria-expanded={open}
        className="bg-ink border-line-strong hover:border-gold/50 text-parchment-dim hover:text-parchment fixed right-4 bottom-4 z-40 flex h-10 w-10 items-center justify-center rounded-full border font-mono text-sm transition-all md:right-6 md:bottom-6 md:h-auto md:w-auto md:rounded-sm md:px-4 md:py-2 md:text-xs md:tracking-widest"
      >
        <span aria-hidden className="md:hidden">
          ✎
        </span>
        <span className="hidden md:inline">FEEDBACK</span>
      </button>

      {open && (
        <div
          role="dialog"
          aria-label="Send feedback"
          className="bg-ink border-line-strong fixed right-4 bottom-16 z-50 flex w-[min(19rem,calc(100vw-2rem))] flex-col gap-4 rounded-sm border p-5 shadow-xl md:right-6"
        >
          <div className="flex items-center justify-between">
            <p className="text-parchment-dim font-mono text-xs tracking-widest">
              FEEDBACK
            </p>
            <button
              onClick={close}
              aria-label="Close feedback"
              className="text-parchment-faint hover:text-parchment-dim min-h-[32px] min-w-[32px] font-mono text-xs transition-colors"
            >
              ✕
            </button>
          </div>

          {sent ? (
            <div className="flex flex-col gap-3">
              <p className="text-parchment font-sans text-sm">
                Your email app should have opened with the message ready to
                send.
              </p>
              <p className="text-parchment-dim font-sans text-xs">
                Nothing happened? Email it to{' '}
                <span className="text-parchment break-all">
                  {FEEDBACK_EMAIL}
                </span>
              </p>
              <div className="flex gap-2">
                <button
                  onClick={copyAddress}
                  className="border-line-strong text-parchment hover:border-gold/60 min-h-[40px] flex-1 rounded-sm border font-sans text-sm transition-colors"
                >
                  {copied ? '✓ Copied' : 'Copy address'}
                </button>
                <button
                  onClick={() => {
                    setSent(false)
                    setMessage('')
                  }}
                  className="text-parchment-dim hover:text-parchment min-h-[40px] px-3 font-sans text-sm transition-colors"
                >
                  Write another
                </button>
              </div>
            </div>
          ) : (
            <>
              <div
                role="radiogroup"
                aria-label="Kind of feedback"
                className="flex gap-2"
              >
                {TYPES.map((t) => (
                  <button
                    key={t.value}
                    role="radio"
                    aria-checked={type === t.value}
                    onClick={() => setType(t.value)}
                    className={`flex flex-1 flex-col items-center gap-1 rounded-sm border py-2 text-xs transition-colors ${
                      type === t.value
                        ? 'border-gold/50 bg-espresso text-parchment'
                        : 'border-line text-parchment-dim hover:border-line-strong'
                    }`}
                  >
                    <span aria-hidden className="font-mono">
                      {t.icon}
                    </span>
                    <span className="font-sans">{t.label}</span>
                  </button>
                ))}
              </div>

              <label className="flex flex-col gap-1.5">
                <span className="sr-only">Your message</span>
                <textarea
                  ref={textarea}
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder={
                    type === 'bug'
                      ? 'What went wrong?'
                      : type === 'suggestion'
                        ? 'What would make this better?'
                        : 'What did you love?'
                  }
                  rows={4}
                  className="bg-espresso border-line-strong text-parchment placeholder:text-parchment-faint focus:border-gold/60 resize-none rounded-sm border px-3 py-2 font-sans text-sm focus:outline-none"
                />
              </label>

              <button
                onClick={handleSend}
                disabled={!message.trim()}
                className="bg-gold text-espresso min-h-[44px] rounded-sm font-sans text-sm font-semibold transition-colors hover:bg-[#ecb95c] disabled:cursor-not-allowed disabled:opacity-40"
              >
                Send by email
              </button>

              <p className="text-parchment-faint text-center font-sans text-xs">
                Opens your email app · includes this page
                {page ? ` (${page})` : ''}
              </p>
            </>
          )}
        </div>
      )}
    </>
  )
}
