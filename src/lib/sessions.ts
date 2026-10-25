import { AvailabilityConfig, WeeklyBlock } from '@/types/media'
import { DAYS, windowMinutes } from './scheduleUtils'

export interface SeriesSession {
  date: Date // local midnight of the day the session starts
  startMinute: number // minutes after midnight
  endMinute: number // may exceed 1440 when it runs past midnight
  startEpisode: number
  endEpisode: number
  episodes: number
}

function toMinutes(time: string): number {
  const [h, m] = time.split(':').map(Number)
  return h * 60 + m
}

// Lay a series plan onto real, dated viewing sessions. Plan weeks are
// rolling 7-day spans starting today (the same basis as the plan's
// completion date), so nothing is scheduled on a day that's already
// gone. Each week's episode count comes from the plan itself — pace
// included — so this never disagrees with the week-by-week breakdown.
export function scheduleSeriesSessions(
  config: AvailabilityConfig,
  blocks: WeeklyBlock[],
  runtime: number,
  from: Date = new Date()
): SeriesSession[] {
  const day0 = new Date(from)
  day0.setHours(0, 0, 0, 0)
  const sessions: SeriesSession[] = []
  if (runtime <= 0) return sessions

  blocks.forEach((block, weekIndex) => {
    if (block.episodes <= 0) return
    let toPlace = block.episodes
    let nextEpisode = block.startEpisode
    const weekSessions: SeriesSession[] = []

    for (let d = 0; d < 7 && toPlace > 0; d++) {
      const date = new Date(day0)
      date.setDate(day0.getDate() + weekIndex * 7 + d)
      const dayName = DAYS[date.getDay() === 0 ? 6 : date.getDay() - 1]
      const day = config.schedule[dayName]
      if (!day?.enabled) continue

      const windows = [...day.windows].sort(
        (a, b) => toMinutes(a.start) - toMinutes(b.start)
      )
      for (const w of windows) {
        if (toPlace <= 0) break
        const fits = Math.floor(windowMinutes(w) / runtime)
        const count = Math.min(fits, toPlace)
        if (count <= 0) continue
        const startMinute = toMinutes(w.start)
        weekSessions.push({
          date,
          startMinute,
          endMinute: startMinute + count * runtime,
          startEpisode: nextEpisode,
          endEpisode: nextEpisode + count - 1,
          episodes: count,
        })
        nextEpisode += count
        toPlace -= count
      }
    }

    // A faster-than-your-free-time pace (hardcore), or windows shorter
    // than one episode, can leave episodes over. Spread them across the
    // week's sessions, running each a little past its window.
    if (toPlace > 0) {
      if (weekSessions.length === 0) {
        // No window fits a whole episode: use the week's first free slot
        for (let d = 0; d < 7; d++) {
          const date = new Date(day0)
          date.setDate(day0.getDate() + weekIndex * 7 + d)
          const dayName = DAYS[date.getDay() === 0 ? 6 : date.getDay() - 1]
          const first = config.schedule[dayName]?.enabled
            ? config.schedule[dayName].windows[0]
            : undefined
          if (!first) continue
          const startMinute = toMinutes(first.start)
          weekSessions.push({
            date,
            startMinute,
            endMinute: startMinute,
            startEpisode: nextEpisode,
            endEpisode: nextEpisode - 1,
            episodes: 0,
          })
          break
        }
      }
      let i = 0
      while (toPlace > 0 && weekSessions.length > 0) {
        weekSessions[i % weekSessions.length].episodes++
        toPlace--
        i++
      }
      // Renumber episodes and end times after the extras were added
      let ep = block.startEpisode
      for (const s of weekSessions) {
        s.startEpisode = ep
        s.endEpisode = ep + s.episodes - 1
        s.endMinute = s.startMinute + s.episodes * runtime
        ep += s.episodes
      }
    }

    sessions.push(...weekSessions.filter((s) => s.episodes > 0))
  })

  return sessions
}

export function formatClock(minute: number): string {
  const m = ((minute % 1440) + 1440) % 1440
  const h = Math.floor(m / 60)
  const mm = m % 60
  const period = h >= 12 ? 'PM' : 'AM'
  const hour = h % 12 || 12
  return `${hour}${mm > 0 ? `:${String(mm).padStart(2, '0')}` : ''} ${period}`
}
