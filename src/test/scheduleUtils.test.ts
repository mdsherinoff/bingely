import { describe, it, expect } from 'vitest'
import {
  windowMinutes,
  dailyMinutes,
  weeklyMinutes,
  weeklyEpisodes,
  defaultSchedule,
} from '@/lib/scheduleUtils'

describe('windowMinutes', () => {
  it('calculates minutes between two times', () => {
    expect(windowMinutes({ start: '19:00', end: '22:00' })).toBe(180)
  })

  it('returns 0 for same start and end', () => {
    expect(windowMinutes({ start: '19:00', end: '19:00' })).toBe(0)
  })

  it('returns 0 when end is before start', () => {
    expect(windowMinutes({ start: '22:00', end: '19:00' })).toBe(0)
  })

  it('handles 90 minute windows', () => {
    expect(windowMinutes({ start: '20:00', end: '21:30' })).toBe(90)
  })
})

describe('dailyMinutes', () => {
  it('returns 0 for disabled days', () => {
    const schedule = defaultSchedule()
    expect(dailyMinutes(schedule, 'Monday')).toBe(0)
  })

  it('returns correct minutes for enabled days', () => {
    const schedule = defaultSchedule()
    schedule['Monday'] = {
      enabled: true,
      windows: [{ start: '19:00', end: '22:00' }],
    }
    expect(dailyMinutes(schedule, 'Monday')).toBe(180)
  })
})

describe('weeklyMinutes', () => {
  it('returns 0 for empty schedule', () => {
    const schedule = defaultSchedule()
    Object.keys(schedule).forEach((day) => {
      schedule[day].enabled = false
    })
    expect(weeklyMinutes(schedule)).toBe(0)
  })

  it('sums minutes across all enabled days', () => {
    const schedule = defaultSchedule()
    schedule['Monday'] = {
      enabled: true,
      windows: [{ start: '19:00', end: '22:00' }],
    }
    schedule['Saturday'] = {
      enabled: true,
      windows: [{ start: '14:00', end: '20:00' }],
    }
    schedule['Sunday'] = {
      enabled: false,
      windows: [{ start: '14:00', end: '20:00' }],
    }
    expect(weeklyMinutes(schedule)).toBe(180 + 360)
  })
})

describe('weeklyEpisodes', () => {
  it('calculates episodes based on available time', () => {
    const schedule = defaultSchedule()
    // Disable all days first
    Object.keys(schedule).forEach((d) => {
      schedule[d].enabled = false
    })
    // Enable only Monday with 3 hours
    schedule['Monday'] = {
      enabled: true,
      windows: [{ start: '19:00', end: '22:00' }],
    }
    // 180 mins / 24 mins per episode = 7 episodes
    expect(weeklyEpisodes(schedule, 24)).toBe(7)
  })

  it('returns 0 when no days enabled', () => {
    const schedule = defaultSchedule()
    Object.keys(schedule).forEach((d) => {
      schedule[d].enabled = false
    })
    expect(weeklyEpisodes(schedule, 24)).toBe(0)
  })

  it('handles longer episode runtimes', () => {
    const schedule = defaultSchedule()
    // Disable all days first
    Object.keys(schedule).forEach((d) => {
      schedule[d].enabled = false
    })
    // Enable only Saturday with 6 hours
    schedule['Saturday'] = {
      enabled: true,
      windows: [{ start: '14:00', end: '20:00' }],
    }
    // 360 mins / 47 mins per episode = 7 episodes
    expect(weeklyEpisodes(schedule, 47)).toBe(7)
  })
})
