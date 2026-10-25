import { describe, it, expect } from 'vitest'
import { planStatus, expectedThrough, TrackedPlan } from '@/hooks/useTrackedPlans'

// Started on Oct 1, five episodes a week from episode 1
const base: TrackedPlan = {
  id: 'tv-1',
  title: 'Show',
  posterPath: null,
  href: '/plan/1/results',
  totalEpisodes: 20,
  startEpisode: 1,
  watchedThrough: 0,
  startedAt: new Date(2026, 9, 1).toISOString(),
  completionDate: 'October 29, 2026',
  weekEnds: [5, 10, 15, 20],
}
const day = (d: number) => new Date(2026, 9, d, 12)

describe('expectedThrough', () => {
  it('expects nothing during week 1, then each finished week', () => {
    expect(expectedThrough(base, day(3))).toBe(0)
    expect(expectedThrough(base, day(9))).toBe(5)
    expect(expectedThrough(base, day(16))).toBe(10)
    expect(expectedThrough(base, day(30))).toBe(20)
  })
})

describe('planStatus', () => {
  it('is not started in week 1 with nothing watched', () => {
    expect(planStatus(base, day(3)).kind).toBe('not-started')
  })

  it('is on track within the current week’s range', () => {
    expect(planStatus({ ...base, watchedThrough: 3 }, day(3)).kind).toBe('on-track')
    expect(planStatus({ ...base, watchedThrough: 7 }, day(9)).kind).toBe('on-track')
  })

  it('reports how far behind', () => {
    expect(planStatus({ ...base, watchedThrough: 2 }, day(16))).toEqual({
      kind: 'behind',
      by: 8,
    })
  })

  it('reports ahead only past this week’s target', () => {
    expect(planStatus({ ...base, watchedThrough: 12 }, day(9))).toEqual({
      kind: 'ahead',
      by: 2,
    })
  })

  it('is done when the last episode is watched', () => {
    expect(planStatus({ ...base, watchedThrough: 20 }, day(3)).kind).toBe('done')
  })
})

describe('planStatus after a re-plan', () => {
  it('is on track at the start of a plan that picks up partway', () => {
    const replanned = { ...base, startEpisode: 6, watchedThrough: 5, weekEnds: [10, 15, 20] }
    expect(planStatus(replanned, day(3)).kind).toBe('on-track')
  })
})
