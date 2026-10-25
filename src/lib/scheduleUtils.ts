import { WeekSchedule, TimeWindow } from '@/types/media'

export const DAYS = [
  'Monday',
  'Tuesday',
  'Wednesday',
  'Thursday',
  'Friday',
  'Saturday',
  'Sunday',
]

export function defaultSchedule(): WeekSchedule {
  return Object.fromEntries(
    DAYS.map((day) => [
      day,
      {
        enabled: ['Saturday', 'Sunday'].includes(day),
        windows: [{ start: '19:00', end: '22:00' }],
      },
    ])
  )
}

export function windowMinutes(window: TimeWindow): number {
  const [sh, sm] = window.start.split(':').map(Number)
  const [eh, em] = window.end.split(':').map(Number)
  const start = sh * 60 + sm
  const end = eh * 60 + em
  if ([start, end].some(Number.isNaN)) return 0
  // An end before the start means the window runs past midnight
  // (e.g. 22:00 → 01:00 is three hours, not zero)
  return end >= start ? end - start : 24 * 60 - start + end
}

export function dailyMinutes(schedule: WeekSchedule, day: string): number {
  const d = schedule[day]
  if (!d?.enabled) return 0
  return d.windows.reduce((acc, w) => acc + windowMinutes(w), 0)
}

export function weeklyMinutes(schedule: WeekSchedule): number {
  return DAYS.reduce((acc, day) => acc + dailyMinutes(schedule, day), 0)
}

export function weeklyEpisodes(
  schedule: WeekSchedule,
  episodeRuntime: number
): number {
  if (episodeRuntime <= 0) return 0
  return Math.floor(weeklyMinutes(schedule) / episodeRuntime)
}

function toInterval(w: TimeWindow): [number, number] {
  const [sh, sm] = w.start.split(':').map(Number)
  const [eh, em] = w.end.split(':').map(Number)
  const s = sh * 60 + sm
  let e = eh * 60 + em
  if (e < s) e += 24 * 60 // runs past midnight
  return [s, e]
}

function toTime(minute: number): string {
  const m = ((minute % 1440) + 1440) % 1440
  return `${String(Math.floor(m / 60)).padStart(2, '0')}:${String(m % 60).padStart(2, '0')}`
}

// "Watch together": only the time both people are free. A day is on
// when the two overlap at all; windows that cross midnight are handled
// by also comparing against the other person's next-morning hours.
export function intersectSchedules(a: WeekSchedule, b: WeekSchedule): WeekSchedule {
  return Object.fromEntries(
    DAYS.map((day) => {
      const da = a[day]
      const db = b[day]
      const windows: TimeWindow[] = []
      if (da?.enabled && db?.enabled) {
        for (const wa of da.windows) {
          for (const wb of db.windows) {
            const [as, ae] = toInterval(wa)
            for (const shift of [0, 1440, -1440]) {
              const [bs0, be0] = toInterval(wb)
              const bs = bs0 + shift
              const be = be0 + shift
              const s = Math.max(as, bs)
              const e = Math.min(ae, be)
              if (e - s > 0) windows.push({ start: toTime(s), end: toTime(e) })
            }
          }
        }
      }
      const unique = windows.filter(
        (w, i) => windows.findIndex((x) => x.start === w.start && x.end === w.end) === i
      )
      return [
        day,
        unique.length > 0
          ? { enabled: true, windows: unique }
          : { enabled: false, windows: [{ start: '19:00', end: '22:00' }] },
      ]
    })
  )
}
