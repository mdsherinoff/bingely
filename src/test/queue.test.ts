import { describe, it, expect } from 'vitest'
import {
  generateQueuePlan,
  queueToWatchPlan,
  remainingRuntime,
  QueueItem,
} from '@/lib/queue'
import { buildListPreview } from '@/lib/scheduler'
import { queueEvents } from '@/lib/ics'
import { toSharedItem, fromSharedItem } from '@/lib/listItems'
import { DAYS } from '@/lib/scheduleUtils'
import { AvailabilityConfig, PaceMode } from '@/types/media'

// Free 19:00–22:00 every evening
function everyEvening(pace: PaceMode = 'binge'): AvailabilityConfig {
  return {
    schedule: Object.fromEntries(
      DAYS.map((d) => [
        d,
        { enabled: true, windows: [{ start: '19:00', end: '22:00' }] },
      ])
    ),
    pace,
    episodeRuntime: 45,
  }
}

// Monday 26 October 2026, 9 AM
const monday = new Date(2026, 9, 26, 9, 0)

const film = (title: string, runtime: number): QueueItem => ({
  title,
  runtime,
  mediaType: 'movie',
})
const series = (title: string, episodes: number, per: number): QueueItem => ({
  title,
  runtime: episodes * per,
  mediaType: 'tv',
  episodes,
})

describe('generateQueuePlan — list order', () => {
  it('watches a mixed list strictly in the order given', () => {
    const items = [
      series('Show A', 6, 60),
      film('Film B', 120),
      series('Show C', 3, 30),
    ]
    const plan = generateQueuePlan(everyEvening(), items, monday)
    const order = plan.sessions.map((s) => s.itemIndex)
    // Never goes back to an earlier title
    expect(order).toEqual([...order].sort((a, b) => a - b))
    expect(plan.complete).toBe(true)
    // Show A: 3 episodes a night for two nights, then the film, then C
    expect(plan.sessions[0]).toMatchObject({
      itemIndex: 0,
      fromEpisode: 1,
      toEpisode: 3,
      startMinute: 19 * 60,
      endMinute: 22 * 60,
    })
    expect(plan.items[1].startDate).toEqual(new Date(2026, 9, 28))
  })

  it('never double-books the same evening', () => {
    const items = [film('A', 100), series('B', 10, 25), film('C', 95)]
    const plan = generateQueuePlan(everyEvening(), items, monday)
    const byDay = new Map<number, { start: number; end: number }[]>()
    for (const s of plan.sessions) {
      const list = byDay.get(s.date.getTime()) ?? []
      for (const other of list)
        expect(s.startMinute >= other.end || s.endMinute <= other.start).toBe(
          true
        )
      list.push({ start: s.startMinute, end: s.endMinute })
      byDay.set(s.date.getTime(), list)
    }
  })

  it('shares an evening between titles when they fit', () => {
    const plan = generateQueuePlan(
      everyEvening(),
      [film('Short', 80), series('Show', 4, 25)],
      monday
    )
    expect(plan.sessions[1]).toMatchObject({
      itemIndex: 1,
      startMinute: 19 * 60 + 80,
      fromEpisode: 1,
      toEpisode: 4,
    })
  })

  it('holds a film for the next evening rather than splitting it', () => {
    const plan = generateQueuePlan(
      everyEvening(),
      [film('First', 100), film('Second', 150)],
      monday
    )
    expect(plan.sessions).toHaveLength(2)
    expect(plan.sessions[1].date).toEqual(new Date(2026, 9, 27))
    expect(plan.sessions[1].startMinute).toBe(19 * 60)
  })

  it('splits a film longer than any evening into parts', () => {
    const plan = generateQueuePlan(everyEvening(), [film('Epic', 240)], monday)
    expect(
      plan.sessions.map((s) => [s.part, s.minuteFrom, s.minuteTo])
    ).toEqual([
      [1, 1, 180],
      [2, 181, 240],
    ])
    expect(plan.sessions[1].completesItem).toBe(true)
  })

  it('books series in whole episodes', () => {
    const plan = generateQueuePlan(
      everyEvening(),
      [series('Show', 10, 50)],
      monday
    )
    // 180 free minutes fit three 50-minute episodes, not 3.6
    expect(plan.sessions[0]).toMatchObject({ fromEpisode: 1, toEpisode: 3 })
    expect(plan.sessions[0].endMinute - plan.sessions[0].startMinute).toBe(150)
  })

  it('starts a series partway through when asked', () => {
    const item = { ...series('Show', 10, 30), startEpisode: 8 }
    expect(remainingRuntime(item)).toBe(90)
    const plan = generateQueuePlan(everyEvening(), [item], monday)
    expect(plan.sessions).toHaveLength(1)
    expect(plan.sessions[0]).toMatchObject({ fromEpisode: 8, toEpisode: 10 })
  })

  it('applies pace to series lists', () => {
    const items = [series('Show', 40, 30)]
    const casual = generateQueuePlan(everyEvening('casual'), items, monday)
    const binge = generateQueuePlan(everyEvening('binge'), items, monday)
    expect(casual.sessions.length).toBeGreaterThan(binge.sessions.length)
  })

  it("skips today's evening once it's over", () => {
    const late = new Date(2026, 9, 26, 23, 0)
    const plan = generateQueuePlan(everyEvening(), [film('A', 90)], late)
    expect(plan.sessions[0].date).toEqual(new Date(2026, 9, 27))
  })

  it('reports an incomplete plan when there is no free time', () => {
    const config = everyEvening()
    for (const d of DAYS) config.schedule[d].enabled = false
    const plan = generateQueuePlan(config, [film('A', 90)], monday)
    expect(plan.complete).toBe(false)
    expect(plan.completionDate).toBe('Unknown')
  })
})

describe('queueToWatchPlan', () => {
  it('counts every title once and ends at 100%', () => {
    const items = [film('A', 100), series('B', 12, 40), film('C', 90)]
    const queue = generateQueuePlan(everyEvening(), items, monday)
    const plan = queueToWatchPlan(queue, items, 'binge', monday)
    expect(plan.weeklyBlocks.reduce((a, b) => a + b.episodes, 0)).toBe(3)
    expect(plan.weeklyBlocks.at(-1)?.cumulativePercent).toBe(100)
    expect(plan.totalWeeks).toBe(queue.totalWeeks)
  })
})

describe('list previews and calendar', () => {
  it('preview matches the queue plan', () => {
    const items = [film('A', 100), series('B', 6, 45)]
    const preview = buildListPreview(everyEvening(), items)
    const plan = generateQueuePlan(everyEvening(), items)
    expect(preview?.completionDate).toBe(plan.completionDate)
  })

  it('exports one event per sitting with episode labels', () => {
    const items = [film('Epic', 240), series('Show', 3, 30)]
    const plan = generateQueuePlan(everyEvening(), items, monday)
    const events = queueEvents(plan.sessions, items)
    expect(events).toHaveLength(plan.sessions.length)
    expect(events[0].title).toBe('Epic (part 1)')
    expect(events.at(-1)?.title).toBe('Show · Episodes 1–3')
  })
})

describe('shared list items', () => {
  it('round-trips through a link with episode data and poster', () => {
    const item = {
      tmdbId: 1396,
      title: 'Breaking Bad',
      mediaType: 'tv' as const,
      posterPath: 'https://image.tmdb.org/t/p/w500/x.jpg',
      runtime: 62 * 47,
      releaseYear: '2008',
      episodes: 62,
      seasons: [7, 13, 13, 13, 16],
      startEpisode: 21,
    }
    expect(fromSharedItem(toSharedItem(item), 0)).toEqual(item)
  })

  it('still reads links made before ids were carried', () => {
    const item = fromSharedItem(
      { title: 'Old', runtime: 90, mediaType: 'movie' },
      2
    )
    expect(item.tmdbId).toBe(-3)
    expect(item.posterPath).toBeNull()
  })
})
