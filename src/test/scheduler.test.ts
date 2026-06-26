import { describe, it, expect } from 'vitest'
import {
  generateWatchPlan,
  generateFinishBeforePlan,
  generateVacationPlan,
} from '@/lib/scheduler'
import { defaultSchedule } from '@/lib/scheduleUtils'
import { AvailabilityConfig } from '@/types/media'

function makeConfig(
  overrides?: Partial<AvailabilityConfig>
): AvailabilityConfig {
  const schedule = defaultSchedule()
  schedule['Monday'] = {
    enabled: true,
    windows: [{ start: '19:00', end: '22:00' }],
  }
  schedule['Wednesday'] = {
    enabled: true,
    windows: [{ start: '19:00', end: '22:00' }],
  }
  schedule['Saturday'] = {
    enabled: true,
    windows: [{ start: '14:00', end: '20:00' }],
  }
  schedule['Sunday'] = {
    enabled: true,
    windows: [{ start: '14:00', end: '20:00' }],
  }

  return {
    schedule,
    pace: 'balanced',
    episodeRuntime: 24,
    ...overrides,
  }
}

describe('generateWatchPlan — TV', () => {
  it('generates a plan with correct total episodes', () => {
    const plan = generateWatchPlan(makeConfig(), 62, 'tv')
    expect(plan.totalEpisodes).toBe(62)
  })

  it('generates weekly blocks that cover all episodes', () => {
    const plan = generateWatchPlan(makeConfig(), 62, 'tv')
    const lastBlock = plan.weeklyBlocks[plan.weeklyBlocks.length - 1]
    expect(lastBlock.endEpisode).toBe(62)
  })

  it('last block has 100% cumulative percent', () => {
    const plan = generateWatchPlan(makeConfig(), 62, 'tv')
    const lastBlock = plan.weeklyBlocks[plan.weeklyBlocks.length - 1]
    expect(lastBlock.cumulativePercent).toBe(100)
  })

  it('episodes per week is positive', () => {
    const plan = generateWatchPlan(makeConfig(), 62, 'tv')
    expect(plan.episodesPerWeek).toBeGreaterThan(0)
  })

  it('total hours is calculated correctly', () => {
    const plan = generateWatchPlan(makeConfig(), 62, 'tv')
    const expectedHours = Math.round(((62 * 24) / 60) * 10) / 10
    expect(plan.totalHours).toBe(expectedHours)
  })

  it('generates exactly 4 milestones', () => {
    const plan = generateWatchPlan(makeConfig(), 100, 'tv')
    expect(plan.milestones).toHaveLength(4)
  })

  it('milestones are at 25 50 75 100 percent', () => {
    const plan = generateWatchPlan(makeConfig(), 100, 'tv')
    expect(plan.milestones.map((m) => m.percent)).toEqual([25, 50, 75, 100])
  })

  it('hardcore pace generates more episodes per week than casual', () => {
    const casual = generateWatchPlan(makeConfig({ pace: 'casual' }), 100, 'tv')
    const hardcore = generateWatchPlan(
      makeConfig({ pace: 'hardcore' }),
      100,
      'tv'
    )
    expect(hardcore.episodesPerWeek).toBeGreaterThan(casual.episodesPerWeek)
  })

  it('longer episode runtime means fewer episodes per week', () => {
    const short = generateWatchPlan(
      makeConfig({ episodeRuntime: 24 }),
      100,
      'tv'
    )
    const long = generateWatchPlan(
      makeConfig({ episodeRuntime: 47 }),
      100,
      'tv'
    )
    expect(short.episodesPerWeek).toBeGreaterThan(long.episodesPerWeek)
  })

  it('weekly blocks start episodes are sequential', () => {
    const plan = generateWatchPlan(makeConfig(), 62, 'tv')
    plan.weeklyBlocks.forEach((block, i) => {
      if (i === 0) {
        expect(block.startEpisode).toBe(1)
      } else {
        expect(block.startEpisode).toBe(plan.weeklyBlocks[i - 1].endEpisode + 1)
      }
    })
  })
})

describe('generateWatchPlan — Movie', () => {
  it('generates a single block for movies', () => {
    const plan = generateWatchPlan(makeConfig(), 1, 'movie', 148)
    expect(plan.weeklyBlocks).toHaveLength(1)
  })

  it('total weeks is 1 for movies', () => {
    const plan = generateWatchPlan(makeConfig(), 1, 'movie', 148)
    expect(plan.totalWeeks).toBe(1)
  })

  it('calculates movie runtime correctly', () => {
    const plan = generateWatchPlan(makeConfig(), 1, 'movie', 120)
    expect(plan.totalHours).toBe(2)
  })
})

describe('generateFinishBeforePlan', () => {
  it('generates a plan that finishes by the target date', () => {
    const future = new Date()
    future.setDate(future.getDate() + 30)
    const plan = generateFinishBeforePlan(
      future.toISOString().split('T')[0],
      62,
      24,
      'tv'
    )
    expect(plan.totalEpisodes).toBe(62)
    expect(plan.totalWeeks).toBeGreaterThan(0)
  })

  it('requires more episodes per week for tighter deadlines', () => {
    const nearFuture = new Date()
    nearFuture.setDate(nearFuture.getDate() + 14)
    const farFuture = new Date()
    farFuture.setDate(farFuture.getDate() + 60)

    const tight = generateFinishBeforePlan(
      nearFuture.toISOString().split('T')[0],
      62,
      24,
      'tv'
    )
    const relaxed = generateFinishBeforePlan(
      farFuture.toISOString().split('T')[0],
      62,
      24,
      'tv'
    )
    expect(tight.episodesPerWeek).toBeGreaterThanOrEqual(
      relaxed.episodesPerWeek
    )
  })
})

describe('generateVacationPlan', () => {
  it('generates a plan within vacation dates', () => {
    const start = new Date()
    start.setDate(start.getDate() + 1)
    const end = new Date()
    end.setDate(end.getDate() + 8)

    const plan = generateVacationPlan(
      start.toISOString().split('T')[0],
      end.toISOString().split('T')[0],
      4,
      100,
      24,
      'tv'
    )
    expect(plan.totalWeeks).toBeGreaterThan(0)
    expect(plan.episodesPerWeek).toBeGreaterThan(0)
  })

  it('more hours per day means more episodes', () => {
    const start = new Date()
    start.setDate(start.getDate() + 1)
    const end = new Date()
    end.setDate(end.getDate() + 8)

    const light = generateVacationPlan(
      start.toISOString().split('T')[0],
      end.toISOString().split('T')[0],
      2,
      100,
      24,
      'tv'
    )
    const heavy = generateVacationPlan(
      start.toISOString().split('T')[0],
      end.toISOString().split('T')[0],
      8,
      100,
      24,
      'tv'
    )
    expect(heavy.totalEpisodes).toBeGreaterThan(light.totalEpisodes)
  })
})
