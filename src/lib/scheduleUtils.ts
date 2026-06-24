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
  return Math.max(0, eh * 60 + em - (sh * 60 + sm))
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
  return Math.floor(weeklyMinutes(schedule) / episodeRuntime)
}
