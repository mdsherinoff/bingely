import { describe, it, expect } from 'vitest'
import { buildIcs, filmEvents, seriesEvents } from '@/lib/ics'
import { MovieSession } from '@/lib/scheduler'

const sat = new Date(2026, 9, 24)

describe('buildIcs', () => {
  it('produces a valid calendar with CRLF lines and escaped text', () => {
    const ics = buildIcs(
      [
        {
          uid: 'a@bingely',
          start: new Date(2026, 9, 24, 19, 0),
          end: new Date(2026, 9, 24, 21, 48),
          title: 'Tom & Jerry, the movie; part 1',
        },
      ],
      'Test'
    )
    expect(ics.startsWith('BEGIN:VCALENDAR\r\n')).toBe(true)
    expect(ics.trimEnd().endsWith('END:VCALENDAR')).toBe(true)
    expect(ics).toContain('DTSTART:20261024T190000')
    expect(ics).toContain('DTEND:20261024T214800')
    expect(ics).toContain('SUMMARY:Tom & Jerry\\, the movie\\; part 1')
    expect(ics.split('\r\n').every((l) => new TextEncoder().encode(l).length <= 75)).toBe(true)
  })

  it('folds long lines', () => {
    const long = 'x'.repeat(200)
    const ics = buildIcs(
      [{ uid: 'b', start: sat, end: sat, title: long }],
      'Test'
    )
    expect(ics).toContain('\r\n x')
  })
})

describe('seriesEvents', () => {
  it('runs past midnight onto the next day', () => {
    const [e] = seriesEvents(
      [
        {
          date: sat,
          startMinute: 23 * 60,
          endMinute: 24 * 60 + 52,
          startEpisode: 1,
          endEpisode: 2,
          episodes: 2,
        },
      ],
      'Show'
    )
    expect(e.end.getDate()).toBe(25)
    expect(e.end.getHours()).toBe(0)
    expect(e.end.getMinutes()).toBe(52)
    expect(e.title).toBe('Show · Episodes 1–2')
  })
})

describe('filmEvents', () => {
  const session = (over: Partial<MovieSession>): MovieSession => ({
    sessionNumber: 1,
    date: sat,
    dayName: 'Saturday',
    start: '19:00',
    end: '22:00',
    minuteStart: 1,
    minuteEnd: 120,
    durationMins: 120,
    isComplete: true,
    ...over,
  })

  it('lays films sharing a slot end to end', () => {
    const events = filmEvents(
      [
        session({ durationMins: 120 }),
        session({ sessionNumber: 2, durationMins: 60, minuteEnd: 60, isComplete: false }),
      ],
      ['First', 'Second']
    )
    expect(events[0].title).toBe('First')
    expect(events[1].start.getHours()).toBe(21)
    expect(events[1].title).toBe('Second (part 1)')
  })
})
