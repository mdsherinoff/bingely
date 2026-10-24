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
