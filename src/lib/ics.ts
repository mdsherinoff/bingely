import { Season } from '@/types/media'
import { SeriesSession } from './sessions'
import { MovieSession } from './scheduler'
import { episodeRangeLabel } from './episodes'

export interface CalendarEvent {
  uid: string
  start: Date
  end: Date
  title: string
  description?: string
}

const pad = (n: number) => String(n).padStart(2, '0')

// Floating local time (no "Z"): an evening slot stays 7 PM wherever the
// calendar is opened, which is what a viewing schedule means
function icsDate(d: Date): string {
  return `${d.getFullYear()}${pad(d.getMonth() + 1)}${pad(d.getDate())}T${pad(d.getHours())}${pad(d.getMinutes())}00`
}

function icsStamp(d: Date): string {
  return `${d.getUTCFullYear()}${pad(d.getUTCMonth() + 1)}${pad(d.getUTCDate())}T${pad(d.getUTCHours())}${pad(d.getUTCMinutes())}${pad(d.getUTCSeconds())}Z`
}

function escapeText(s: string): string {
  return s
    .replace(/\\/g, '\\\\')
    .replace(/\n/g, '\\n')
    .replace(/,/g, '\\,')
    .replace(/;/g, '\\;')
}

// RFC 5545: lines longer than 75 octets continue on the next line,
// which starts with a space
function fold(line: string): string {
  const bytes = new TextEncoder().encode(line)
  if (bytes.length <= 75) return line
  const parts: string[] = []
  let current = ''
  for (const ch of line) {
    if (new TextEncoder().encode(current + ch).length > (parts.length ? 74 : 75)) {
      parts.push(current)
      current = ch
    } else {
      current += ch
    }
  }
  parts.push(current)
  return parts.join('\r\n ')
}

export function buildIcs(events: CalendarEvent[], calendarName: string): string {
  const now = icsStamp(new Date())
  const lines = [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//Bingely//Watch Plan//EN',
    'CALSCALE:GREGORIAN',
    `X-WR-CALNAME:${escapeText(calendarName)}`,
  ]
  for (const e of events) {
    lines.push(
      'BEGIN:VEVENT',
      `UID:${e.uid}`,
      `DTSTAMP:${now}`,
      `DTSTART:${icsDate(e.start)}`,
      `DTEND:${icsDate(e.end)}`,
      `SUMMARY:${escapeText(e.title)}`
    )
    if (e.description) lines.push(`DESCRIPTION:${escapeText(e.description)}`)
    lines.push('END:VEVENT')
  }
  lines.push('END:VCALENDAR')
  return lines.map(fold).join('\r\n') + '\r\n'
}

function at(date: Date, minute: number): Date {
  const d = new Date(date)
  d.setHours(0, 0, 0, 0)
  d.setMinutes(minute)
  return d
}

function slug(s: string): string {
  return s.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '') || 'plan'
}

export function seriesEvents(
  sessions: SeriesSession[],
  title: string,
  seasons?: Season[]
): CalendarEvent[] {
  return sessions.map((s, i) => ({
    uid: `${slug(title)}-${i + 1}-${s.startEpisode}@bingely`,
    start: at(s.date, s.startMinute),
    end: at(s.date, s.endMinute),
    title: `${title} · ${episodeRangeLabel(s.startEpisode, s.endEpisode, seasons)}`,
    description: `${s.episodes} episode${s.episodes === 1 ? '' : 's'} — from your Bingely watch plan`,
  }))
}

function toMinutes(time: string): number {
  const [h, m] = time.split(':').map(Number)
  return h * 60 + m
}

// Film sessions record their time slot, not where in the slot they
// start. When several sessions share a slot (one film ends, the next
// begins), lay them end to end so the events don't overlap.
export function filmEvents(
  sessions: MovieSession[],
  // One title per film in order; sessions move to the next title after
  // each completed film
  titles: string[]
): CalendarEvent[] {
  const events: CalendarEvent[] = []
  let filmIndex = 0
  let partsSoFar = 0
  let slotKey = ''
  let slotOffset = 0

  sessions.forEach((s, i) => {
    const key = `${s.date.toDateString()} ${s.start}`
    slotOffset = key === slotKey ? slotOffset : 0
    slotKey = key

    const startMinute = toMinutes(s.start) + slotOffset
    slotOffset += s.durationMins
    const title = titles[filmIndex] ?? titles[titles.length - 1] ?? 'Film'
    partsSoFar++
    const isSplit = !(partsSoFar === 1 && s.isComplete)

    events.push({
      uid: `${slug(title)}-${i + 1}@bingely`,
      start: at(s.date, startMinute),
      end: at(s.date, startMinute + s.durationMins),
      title: isSplit ? `${title} (part ${partsSoFar})` : title,
      description: isSplit
        ? `Minutes ${s.minuteStart}–${s.minuteEnd} — from your Bingely watch plan`
        : 'From your Bingely watch plan',
    })

    if (s.isComplete) {
      filmIndex++
      partsSoFar = 0
    }
  })
  return events
}

export function downloadIcs(events: CalendarEvent[], title: string) {
  const blob = new Blob([buildIcs(events, `${title} — Bingely`)], {
    type: 'text/calendar;charset=utf-8',
  })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `${slug(title)}-watch-plan.ics`
  document.body.appendChild(a)
  a.click()
  a.remove()
  setTimeout(() => URL.revokeObjectURL(url), 1000)
}
