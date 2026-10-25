'use client'

import { useState } from 'react'
import Link from 'next/link'
import ShareButton from './ShareButton'
import { CalendarEvent, downloadIcs } from '@/lib/ics'

interface PlanActionBarProps {
  editHref: string
  title: string
  // Built on click: viewing sessions to export as a calendar file
  calendarEvents?: () => CalendarEvent[]
  calendarLabel?: string
}

// What people want the moment a plan appears — tweak it, send it, or
// put it in their calendar — kept at the top rather than at the end of
// a long page
export default function PlanActionBar({
  editHref,
  title,
  calendarEvents,
  calendarLabel = 'Add to calendar',
}: PlanActionBarProps) {
  const [exported, setExported] = useState<number | null>(null)

  const handleCalendar = () => {
    if (!calendarEvents) return
    const events = calendarEvents()
    if (events.length === 0) return
    downloadIcs(events, title)
    setExported(events.length)
    setTimeout(() => setExported(null), 6000)
  }

  return (
    <div className="flex flex-col gap-2">
      <div className="flex flex-wrap items-center gap-3">
        <Link
          href={editHref}
          className="border-line-strong text-parchment hover:border-gold/60 inline-flex min-h-[44px] items-center gap-2 rounded-sm border px-5 font-sans text-sm transition-colors"
        >
          <span aria-hidden>✎</span> Edit this plan
        </Link>
        <ShareButton title={title} className="px-5" />
        {calendarEvents && (
          <button
            type="button"
            onClick={handleCalendar}
            className="border-line-strong text-parchment hover:border-gold/60 inline-flex min-h-[44px] items-center gap-2 rounded-sm border px-5 font-sans text-sm transition-colors"
          >
            <span aria-hidden>▦</span> {calendarLabel}
          </button>
        )}
      </div>
      {exported !== null && (
        <p role="status" className="text-parchment-dim font-sans text-xs">
          Downloaded {exported} viewing session{exported === 1 ? '' : 's'}. Open
          the file to add them to Google, Apple or Outlook calendar.
        </p>
      )}
    </div>
  )
}
