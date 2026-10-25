import {
  AvailabilityConfig,
  Milestone,
  PaceMode,
  WatchPlan,
  WeeklyBlock,
} from '@/types/media'
import { DAYS, windowMinutes } from './scheduleUtils'

// One title in a custom list, in the order the viewer wants to watch.
// Series carry their episode count so they're booked in whole episodes;
// `runtime` is always the whole show (every episode), as stored.
export interface QueueItem {
  title: string
  runtime: number
  mediaType: string
  episodes?: number
  // 1-based; skip what's already been watched
  startEpisode?: number
}

export interface QueueSession {
  date: Date // local midnight of the day the session starts
  startMinute: number // minutes after midnight
  endMinute: number // may exceed 1440 when it runs past midnight
  itemIndex: number
  // Series: the episodes watched in this sitting
  fromEpisode?: number
  toEpisode?: number
  // Films (and series without episode data): which minutes of the title
  minuteFrom: number
  minuteTo: number
  part: number // 1-based part of this title; films longer than a sitting split
  completesItem: boolean
}

export interface QueueItemSummary {
  index: number
  startDate: Date | null
  finishDate: Date | null
  sessions: number
}

export interface QueuePlan {
  sessions: QueueSession[]
  items: QueueItemSummary[]
  totalMinutes: number
  totalHours: number
  finishDate: Date | null
  completionDate: string
  totalWeeks: number
  // False when the free time given can't fit the whole list in the
  // planning horizon
  complete: boolean
}

// How much of each free window a pace fills. Hardcore runs a little past
// the end of a window, matching the pace picker's description.
const paceShare: Record<PaceMode, number> = {
  casual: 0.6,
  balanced: 0.8,
  binge: 1.0,
  hardcore: 1.2,
}

// Don't start a film in the last few minutes of an evening
const MIN_FILM_SITTING = 30
const HORIZON_DAYS = 365 * 10

function toMinutes(time: string): number {
  const [h, m] = time.split(':').map(Number)
  return h * 60 + m
}

function clampStart(item: QueueItem): number {
  const total = item.episodes ?? 0
  const s = Math.floor(item.startEpisode ?? 1)
  return total > 0 && s >= 1 && s <= total ? s : 1
}

// Minutes still to watch, after skipping episodes already seen
export function remainingRuntime(item: QueueItem): number {
  if (item.mediaType !== 'tv' || !item.episodes || item.episodes <= 0)
    return item.runtime
  const per = item.runtime / item.episodes
  return Math.round(per * (item.episodes - clampStart(item) + 1))
}

export function formatPlanDate(d: Date): string {
  return d.toLocaleDateString('en-US', {
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  })
}

// Books every title into real, dated free time strictly in list order —
// films and series share the same evenings, so nothing is double-booked
// and a series never jumps ahead of the film before it.
//
// Series are booked in whole episodes; consecutive episodes in one
// window become one sitting. A film that won't fit the rest of an
// evening waits for the next one, unless it's longer than any one
// sitting, in which case it's split across sittings.
export function generateQueuePlan(
  config: AvailabilityConfig,
  items: QueueItem[],
  from: Date = new Date()
): QueuePlan {
  const day0 = new Date(from)
  day0.setHours(0, 0, 0, 0)
  const nowMinute = from.getHours() * 60 + from.getMinutes()

  // Pace only applies once series are involved; a films-only list just
  // uses the free time as given (the planner hides pace for it)
  const share = items.some((i) => i.mediaType === 'tv')
    ? (paceShare[config.pace] ?? 1)
    : 1

  const sessions: QueueSession[] = []
  const totalMinutes = items.reduce((a, i) => a + remainingRuntime(i), 0)

  // Where we are in the list
  let itemIndex = 0
  let episode = items[0] ? clampStart(items[0]) : 1
  let minuteDone = 0 // minutes of the current film already watched
  let part = 1

  const advance = () => {
    itemIndex++
    minuteDone = 0
    part = 1
    episode = items[itemIndex] ? clampStart(items[itemIndex]) : 1
  }
  // Skip anything with nothing to watch
  const skipEmpty = () => {
    while (itemIndex < items.length && remainingRuntime(items[itemIndex]) <= 0)
      advance()
  }
  skipEmpty()

  for (let d = 0; d < HORIZON_DAYS && itemIndex < items.length; d++) {
    const date = new Date(day0)
    date.setDate(day0.getDate() + d)
    const dayName = DAYS[date.getDay() === 0 ? 6 : date.getDay() - 1]
    const day = config.schedule[dayName]
    if (!day?.enabled) continue

    const windows = [...day.windows]
      .map((w) => ({ start: toMinutes(w.start), length: windowMinutes(w) }))
      .filter((w) => w.length > 0 && !Number.isNaN(w.start))
      .sort((a, b) => a.start - b.start)

    for (const w of windows) {
      if (itemIndex >= items.length) break
      // Today's windows that are already over can't be used
      if (d === 0 && w.start + w.length <= nowMinute) continue

      const capacity = Math.max(1, Math.round(w.length * share))
      let used = 0

      while (itemIndex < items.length) {
        const item = items[itemIndex]
        const remaining = capacity - used
        const isSeries = item.mediaType === 'tv' && (item.episodes ?? 0) > 0

        if (isSeries) {
          const per = item.runtime / item.episodes!
          const left = item.episodes! - episode + 1
          let count = Math.min(left, Math.floor(remaining / per))
          // A window shorter than one episode still gets one episode
          if (count === 0 && used === 0) count = 1
          if (count === 0) break

          const start = w.start + used
          used += Math.round(count * per)
          sessions.push({
            date,
            startMinute: start,
            endMinute: w.start + used,
            itemIndex,
            fromEpisode: episode,
            toEpisode: episode + count - 1,
            minuteFrom: 0,
            minuteTo: 0,
            part: part++,
            completesItem: count === left,
          })
          if (count === left) advance()
          else {
            episode += count
            break // window is full
          }
        } else {
          const left = item.runtime - minuteDone
          let watch: number
          if (left <= remaining) watch = left
          else if (
            used > 0 &&
            (left <= capacity || remaining < MIN_FILM_SITTING)
          )
            break // start it fresh next time
          else watch = remaining

          const start = w.start + used
          used += watch
          sessions.push({
            date,
            startMinute: start,
            endMinute: start + watch,
            itemIndex,
            minuteFrom: minuteDone + 1,
            minuteTo: minuteDone + watch,
            part: part++,
            completesItem: watch === left,
          })
          if (watch === left) advance()
          else {
            minuteDone += watch
            break
          }
        }
        skipEmpty()
        if (used >= capacity) break
      }
    }
  }

  const summaries: QueueItemSummary[] = items.map((_, index) => {
    const own = sessions.filter((s) => s.itemIndex === index)
    const done = own.find((s) => s.completesItem)
    return {
      index,
      startDate: own[0]?.date ?? null,
      finishDate: done?.date ?? null,
      sessions: own.length,
    }
  })

  const complete = itemIndex >= items.length
  const last = sessions[sessions.length - 1]
  const finishDate = complete && last ? last.date : null
  const totalWeeks = finishDate
    ? Math.max(
        1,
        Math.floor((finishDate.getTime() - day0.getTime()) / (7 * 86400000)) + 1
      )
    : 0

  return {
    sessions,
    items: summaries,
    totalMinutes,
    totalHours: Math.round((totalMinutes / 60) * 10) / 10,
    finishDate,
    completionDate: finishDate ? formatPlanDate(finishDate) : 'Unknown',
    totalWeeks,
    complete,
  }
}

export function sessionMinutes(s: QueueSession): number {
  return s.endMinute - s.startMinute
}

// A week-by-week view of the same plan, for the PDF export and progress
// stats: each block counts titles finished in that rolling week (from
// today), so it never disagrees with the dated sessions.
export function queueToWatchPlan(
  queue: QueuePlan,
  items: QueueItem[],
  pace: PaceMode,
  from: Date = new Date()
): WatchPlan {
  const day0 = new Date(from)
  day0.setHours(0, 0, 0, 0)
  const weeks = Math.max(1, queue.totalWeeks)
  const blocks: WeeklyBlock[] = []
  let finished = 0
  let watched = 0

  for (let w = 0; w < weeks; w++) {
    const startT = day0.getTime() + w * 7 * 86400000
    const endT = startT + 7 * 86400000
    const inWeek = queue.sessions.filter(
      (s) => s.date.getTime() >= startT && s.date.getTime() < endT
    )
    const mins = inWeek.reduce((a, s) => a + sessionMinutes(s), 0)
    const done = inWeek.filter((s) => s.completesItem).length
    watched += mins
    const startEpisode = Math.min(finished + 1, items.length)
    blocks.push({
      week: w + 1,
      episodes: done,
      startEpisode,
      endEpisode: Math.min(
        Math.max(finished + done, startEpisode),
        items.length
      ),
      hoursWatched: Math.round((mins / 60) * 10) / 10,
      cumulativePercent: queue.totalMinutes
        ? Math.min(100, Math.round((watched / queue.totalMinutes) * 100))
        : 100,
    })
    finished += done
  }
  if (blocks.length) blocks[blocks.length - 1].cumulativePercent = 100

  const milestones: Milestone[] = [0.25, 0.5, 0.75, 1].map((pct, i) => ({
    label: ['Quarter way', 'Halfway', 'Three quarters', 'Complete'][i],
    episode: Math.max(1, Math.floor(items.length * pct)),
    week:
      blocks.find((b) => b.cumulativePercent >= pct * 100)?.week ??
      blocks.length,
    percent: Math.round(pct * 100),
  }))

  return {
    totalEpisodes: items.length,
    totalWeeks: blocks.length,
    totalHours: queue.totalHours,
    episodesPerWeek: Math.max(1, Math.round(items.length / blocks.length)),
    completionDate: queue.completionDate,
    weeklyBlocks: blocks,
    milestones,
    pace,
    mediaType: 'movie',
  }
}
