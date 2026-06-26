import { describe, it, expect } from 'vitest'
import { generateSuggestions } from '@/lib/suggestions'
import { defaultSchedule } from '@/lib/scheduleUtils'
import { WeekSchedule } from '@/types/media'

function makeSchedule(
  days: string[],
  start = '19:00',
  end = '22:00'
): WeekSchedule {
  const schedule = defaultSchedule()
  Object.keys(schedule).forEach((d) => {
    schedule[d].enabled = false
  })
  days.forEach((day) => {
    schedule[day] = { enabled: true, windows: [{ start, end }] }
  })
  return schedule
}

describe('generateSuggestions', () => {
  it('warns when no days are selected', () => {
    const schedule = makeSchedule([])
    const suggestions = generateSuggestions(schedule, 'balanced', 24, 62, 'tv')
    expect(
      suggestions.some(
        (s) => s.level === 'warning' && s.title === 'No days selected'
      )
    ).toBe(true)
  })

  it('warns for very limited time', () => {
    const schedule = makeSchedule(['Monday'], '20:00', '21:00')
    const suggestions = generateSuggestions(schedule, 'balanced', 24, 62, 'tv')
    expect(suggestions.some((s) => s.title === 'Very limited time')).toBe(true)
  })

  it('detects weekend only schedule', () => {
    const schedule = makeSchedule(['Saturday', 'Sunday'])
    const suggestions = generateSuggestions(schedule, 'balanced', 24, 62, 'tv')
    expect(suggestions.some((s) => s.title === 'Weekend warrior')).toBe(true)
  })

  it('encourages consistency for long series', () => {
    const schedule = makeSchedule(['Monday', 'Wednesday', 'Saturday', 'Sunday'])
    const suggestions = generateSuggestions(schedule, 'balanced', 24, 600, 'tv')
    expect(suggestions.some((s) => s.title === 'Long journey ahead')).toBe(true)
  })

  it('detects short sessions', () => {
    const schedule = makeSchedule(['Monday'], '20:00', '20:30')
    const suggestions = generateSuggestions(schedule, 'balanced', 24, 62, 'tv')
    expect(suggestions.some((s) => s.title === 'Short sessions detected')).toBe(
      true
    )
  })

  it('returns success for a solid schedule', () => {
    const schedule = makeSchedule(
      ['Monday', 'Tuesday', 'Wednesday', 'Saturday', 'Sunday'],
      '19:00',
      '22:00'
    )
    const suggestions = generateSuggestions(schedule, 'balanced', 24, 62, 'tv')
    expect(suggestions.some((s) => s.level === 'success')).toBe(true)
  })

  it('gives no movie suggestions for movie type', () => {
    const schedule = makeSchedule([])
    const suggestions = generateSuggestions(
      schedule,
      'balanced',
      120,
      1,
      'movie'
    )
    expect(suggestions.every((s) => s.title !== 'No days selected')).toBe(true)
  })
})
