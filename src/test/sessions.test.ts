import { describe, it, expect } from 'vitest'
import { scheduleSeriesSessions, formatClock } from '@/lib/sessions'
import { buildTitlePlan } from '@/lib/scheduler'
import { defaultSchedule } from '@/lib/scheduleUtils'
import { AvailabilityConfig, PaceMode } from '@/types/media'

// A Wednesday, so the first week has both past days (Mon/Tue) and
// future ones
const WEDNESDAY = new Date(2026, 9, 21, 12, 0)

function config(pace: PaceMode = 'balanced'): AvailabilityConfig {
  const schedule = defaultSchedule()
  for (const d of Object.keys(schedule)) schedule[d].enabled = false
  schedule['Monday'] = { enabled: true, windows: [{ start: '20:00', end: '22:00' }] }
  schedule['Saturday'] = { enabled: true, windows: [{ start: '19:00', end: '22:00' }] }
  schedule['Sunday'] = { enabled: true, windows: [{ start: '19:00', end: '22:00' }] }
  return { schedule, pace, episodeRuntime: 45 }
}

function sessionsFor(pace: PaceMode, total = 40) {
  const c = config(pace)
  const plan = buildTitlePlan(c, { mode: 'standard' }, total, 'tv')
  return { plan, sessions: scheduleSeriesSessions(c, plan.weeklyBlocks, 45, WEDNESDAY) }
}

describe('scheduleSeriesSessions', () => {
  it('places every planned episode exactly once, in order', () => {
    for (const pace of ['casual', 'balanced', 'binge', 'hardcore'] as PaceMode[]) {
      const { sessions } = sessionsFor(pace)
      const eps = sessions.flatMap((s) =>
        Array.from({ length: s.episodes }, (_, i) => s.startEpisode + i)
      )
      expect(eps).toEqual(Array.from({ length: 40 }, (_, i) => i + 1))
    }
  })

  it('matches each plan week’s episode count', () => {
    const { plan, sessions } = sessionsFor('hardcore')
    const day0 = new Date(WEDNESDAY)
    day0.setHours(0, 0, 0, 0)
    plan.weeklyBlocks.forEach((b, w) => {
      const inWeek = sessions.filter((s) => {
        const offset = Math.round((s.date.getTime() - day0.getTime()) / 86400000)
        return offset >= w * 7 && offset < w * 7 + 7
      })
      expect(inWeek.reduce((a, s) => a + s.episodes, 0)).toBe(b.episodes)
    })
  })

  it('never schedules a day before today', () => {
    const { sessions } = sessionsFor('balanced')
    const today = new Date(WEDNESDAY)
    today.setHours(0, 0, 0, 0)
    for (const s of sessions) {
      expect(s.date.getTime()).toBeGreaterThanOrEqual(today.getTime())
    }
  })

  it('formats clock times, wrapping past midnight', () => {
    expect(formatClock(19 * 60)).toBe('7 PM')
    expect(formatClock(21 * 60 + 15)).toBe('9:15 PM')
    expect(formatClock(24 * 60 + 30)).toBe('12:30 AM')
  })
})
