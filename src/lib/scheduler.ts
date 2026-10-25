import {
  AvailabilityConfig,
  WatchPlan,
  WeeklyBlock,
  Milestone,
  WeekSchedule,
  WatchGoal,
} from '@/types/media'
import { weeklyMinutes, windowMinutes } from './scheduleUtils'
import { DAYS } from '@/lib/scheduleUtils'
import { generateQueuePlan, QueueItem } from './queue'

const paceMultiplier: Record<string, number> = {
  casual: 0.6,
  balanced: 0.8,
  binge: 1.0,
  hardcore: 1.2,
}

function getCompletionDate(weeks: number): string {
  const date = new Date()
  date.setDate(date.getDate() + weeks * 7)
  return date.toLocaleDateString('en-US', {
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  })
}

function generateMilestones(
  totalEpisodes: number,
  weeklyBlocks: WeeklyBlock[]
): Milestone[] {
  const checkpoints = [0.25, 0.5, 0.75, 1.0]
  const labels = ['Quarter way', 'Halfway', 'Three quarters', 'Complete']

  return checkpoints.map((pct, i) => {
    const targetEp = Math.max(1, Math.floor(totalEpisodes * pct))
    // Match on cumulative percent so blocks that track minutes rather
    // than whole episodes (list plans) still land on the right week
    const block = weeklyBlocks.find((b) => b.cumulativePercent >= pct * 100)
    return {
      label: labels[i],
      episode: targetEp,
      week: block?.week ?? weeklyBlocks.length,
      percent: Math.round(pct * 100),
    }
  })
}

export function generateWatchPlan(
  config: AvailabilityConfig,
  totalEpisodes: number,
  mediaType: 'movie' | 'tv',
  runtime?: number
): WatchPlan {
  // For movies, the item's actual runtime takes precedence over the
  // per-episode runtime configured for TV pacing
  const episodeRuntime =
    mediaType === 'movie'
      ? runtime || config.episodeRuntime || 90
      : config.episodeRuntime || runtime || 90
  const multiplier = paceMultiplier[config.pace] ?? 1.0
  const totalMinutes = totalEpisodes * episodeRuntime
  const totalHours = Math.round((totalMinutes / 60) * 10) / 10

  const availableWeeklyMins = weeklyMinutes(config.schedule) * multiplier

  // Whole episodes that fit in a week. Plans are counted in whole
  // episodes, so weeks and hours must be too — counting weeks by raw
  // minutes while counting episodes in whole units let the totals
  // drift apart (wrong hours per week, a crammed final week).
  const fullEpisodesPerWeek = Math.floor(availableWeeklyMins / episodeRuntime)
  const episodesPerWeek = Math.max(1, fullEpisodesPerWeek)

  // When not even one episode fits in a week (e.g. a long film on a
  // light schedule), fall back to spreading its minutes across weeks.
  const spansWeeks = fullEpisodesPerWeek < 1 && availableWeeklyMins > 0
  const totalWeeks =
    availableWeeklyMins <= 0
      ? 1
      : spansWeeks
        ? Math.ceil(totalMinutes / availableWeeklyMins)
        : Math.ceil(totalEpisodes / episodesPerWeek)

  const weeklyBlocks: WeeklyBlock[] = []
  let remainingMinutes = totalMinutes
  let episodesCounted = 0

  for (let week = 1; week <= totalWeeks; week++) {
    if (spansWeeks) {
      const minutesThisWeek = Math.min(remainingMinutes, availableWeeklyMins)
      remainingMinutes -= minutesThisWeek
      const isLast = remainingMinutes <= 0
      weeklyBlocks.push({
        week,
        episodes: isLast ? totalEpisodes - episodesCounted : 0,
        startEpisode: episodesCounted + 1,
        endEpisode: isLast ? totalEpisodes : episodesCounted + 1,
        hoursWatched: Math.round((minutesThisWeek / 60) * 10) / 10,
        cumulativePercent: Math.min(
          100,
          Math.round(((totalMinutes - remainingMinutes) / totalMinutes) * 100)
        ),
      })
      if (isLast) {
        episodesCounted = totalEpisodes
        break
      }
      continue
    }

    const episodesThisWeek = Math.min(
      episodesPerWeek,
      totalEpisodes - episodesCounted
    )
    const startEpisode = episodesCounted + 1
    const endEpisode = episodesCounted + episodesThisWeek

    weeklyBlocks.push({
      week,
      episodes: episodesThisWeek,
      startEpisode,
      endEpisode,
      hoursWatched:
        Math.round(((episodesThisWeek * episodeRuntime) / 60) * 10) / 10,
      cumulativePercent: Math.min(
        100,
        Math.round((endEpisode / totalEpisodes) * 100)
      ),
    })

    episodesCounted = endEpisode
    if (episodesCounted >= totalEpisodes) break
  }

  const milestones = generateMilestones(totalEpisodes, weeklyBlocks)

  return {
    totalEpisodes,
    totalWeeks,
    totalHours,
    episodesPerWeek,
    completionDate: getCompletionDate(totalWeeks),
    weeklyBlocks,
    milestones,
    pace: config.pace,
    mediaType,
    runtime: episodeRuntime,
  }
}

export function generateFinishBeforePlan(
  targetDate: string,
  totalEpisodes: number,
  episodeRuntime: number,
  mediaType: 'movie' | 'tv',
  runtime?: number
): WatchPlan {
  const now = new Date()
  const target = new Date(targetDate)
  const daysUntil = Math.max(
    1,
    Math.floor((target.getTime() - now.getTime()) / (1000 * 60 * 60 * 24))
  )
  const weeksUntil = Math.max(1, Math.floor(daysUntil / 7))

  if (mediaType === 'movie') {
    return generateWatchPlan(
      { schedule: {}, pace: 'balanced', episodeRuntime: runtime || 120 },
      1,
      'movie',
      runtime
    )
  }

  const episodesPerWeek = Math.ceil(totalEpisodes / weeksUntil)
  const totalMinutes = totalEpisodes * episodeRuntime
  const totalHours = Math.round((totalMinutes / 60) * 10) / 10

  const weeklyBlocks: WeeklyBlock[] = []
  let remaining = totalEpisodes

  for (let week = 1; week <= weeksUntil; week++) {
    const eps = Math.min(episodesPerWeek, remaining)
    const start = (week - 1) * episodesPerWeek + 1
    const end = start + eps - 1
    const pct = Math.min(100, Math.round((end / totalEpisodes) * 100))
    weeklyBlocks.push({
      week,
      episodes: eps,
      startEpisode: start,
      endEpisode: end,
      hoursWatched: Math.round(((eps * episodeRuntime) / 60) * 10) / 10,
      cumulativePercent: pct,
    })
    remaining -= eps
    if (remaining <= 0) break
  }

  return {
    totalEpisodes,
    totalWeeks: weeksUntil,
    totalHours,
    episodesPerWeek,
    completionDate: target.toLocaleDateString('en-US', {
      month: 'long',
      day: 'numeric',
      year: 'numeric',
    }),
    weeklyBlocks,
    milestones: generateMilestones(totalEpisodes, weeklyBlocks),
    pace: 'balanced',
    mediaType,
  }
}

export function generateVacationPlan(
  startDate: string,
  endDate: string,
  hoursPerDay: number,
  totalEpisodes: number,
  episodeRuntime: number,
  mediaType: 'movie' | 'tv'
): WatchPlan {
  const start = new Date(startDate)
  const end = new Date(endDate)
  const days = Math.max(
    1,
    Math.floor((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)) + 1
  )
  const minutesTotal = days * hoursPerDay * 60
  const episodesTotal = Math.floor(minutesTotal / episodeRuntime)
  const canFinish = episodesTotal >= totalEpisodes

  const effectiveEpisodes = Math.min(episodesTotal, totalEpisodes)
  const weeks = Math.ceil(days / 7)
  const episodesPerWeek = Math.ceil(effectiveEpisodes / weeks)
  const totalHours =
    Math.round(((effectiveEpisodes * episodeRuntime) / 60) * 10) / 10

  const weeklyBlocks: WeeklyBlock[] = []
  let remaining = effectiveEpisodes

  for (let week = 1; week <= weeks; week++) {
    const eps = Math.min(episodesPerWeek, remaining)
    const s = (week - 1) * episodesPerWeek + 1
    const e = s + eps - 1
    const pct = Math.min(100, Math.round((e / totalEpisodes) * 100))
    weeklyBlocks.push({
      week,
      episodes: eps,
      startEpisode: s,
      endEpisode: e,
      hoursWatched: Math.round(((eps * episodeRuntime) / 60) * 10) / 10,
      cumulativePercent: pct,
    })
    remaining -= eps
    if (remaining <= 0) break
  }

  const completionLabel = canFinish
    ? end.toLocaleDateString('en-US', {
        month: 'long',
        day: 'numeric',
        year: 'numeric',
      })
    : `${effectiveEpisodes} of ${totalEpisodes}\nby vacation end`

  return {
    totalEpisodes: effectiveEpisodes,
    totalWeeks: weeks,
    totalHours,
    episodesPerWeek,
    completionDate: completionLabel,
    weeklyBlocks,
    milestones: generateMilestones(totalEpisodes, weeklyBlocks),
    pace: 'binge',
    mediaType,
  }
}

export interface PlanFeasibility {
  feasible: boolean
  requiredHoursPerDay: number
  availableHoursPerDay: number
  recommendation: string
}

export function checkFeasibility(
  targetDate: string,
  totalEpisodes: number,
  episodeRuntime: number,
  schedule: WeekSchedule
): PlanFeasibility {
  const now = new Date()
  const target = new Date(targetDate)
  const daysUntil = Math.max(
    1,
    Math.floor((target.getTime() - now.getTime()) / (1000 * 60 * 60 * 24))
  )

  const totalMinutesNeeded = totalEpisodes * episodeRuntime
  const requiredMinutesPerDay = totalMinutesNeeded / daysUntil
  const requiredHoursPerDay = Math.round((requiredMinutesPerDay / 60) * 10) / 10

  const avgDailyMinutes = weeklyMinutes(schedule) / 7
  const availableHoursPerDay = Math.round((avgDailyMinutes / 60) * 10) / 10

  const feasible = requiredHoursPerDay <= availableHoursPerDay

  let recommendation: string
  if (feasible) {
    recommendation = `You have enough time. You need ${requiredHoursPerDay}h/day and have ${availableHoursPerDay}h/day available.`
  } else if (requiredHoursPerDay <= availableHoursPerDay * 1.5) {
    recommendation = `Tight but possible. Add ${Math.ceil(requiredHoursPerDay - availableHoursPerDay)}h/day to your schedule to hit this deadline.`
  } else {
    recommendation = `This deadline is very ambitious. You'd need ${requiredHoursPerDay}h/day — consider extending your deadline.`
  }

  return {
    feasible,
    requiredHoursPerDay,
    availableHoursPerDay,
    recommendation,
  }
}

export interface MovieSession {
  sessionNumber: number
  date: Date
  dayName: string
  start: string
  end: string
  minuteStart: number
  minuteEnd: number
  durationMins: number
  isComplete: boolean
}

export interface MoviePlan {
  title: string
  totalRuntime: number
  totalSessions: number
  sessions: MovieSession[]
  completionDate: string
}

export function generateMoviePlan(
  config: AvailabilityConfig,
  totalRuntime: number
): MoviePlan {
  const sessions: MovieSession[] = []
  let minutesRemaining = totalRuntime
  let sessionNumber = 1
  let minutesCovered = 0

  // Build a list of upcoming day+window slots starting from today
  const today = new Date()
  today.setHours(0, 0, 0, 0)

  const slots: {
    date: Date
    dayName: string
    start: string
    end: string
    availableMins: number
  }[] = []

  // Generate slots for up to 52 weeks ahead
  for (let dayOffset = 0; dayOffset < 365; dayOffset++) {
    const date = new Date(today)
    date.setDate(today.getDate() + dayOffset)
    const dayName = DAYS[date.getDay() === 0 ? 6 : date.getDay() - 1]
    const daySchedule = config.schedule[dayName]

    if (!daySchedule?.enabled) continue

    for (const window of daySchedule.windows) {
      const mins = windowMinutes(window)
      if (mins <= 0) continue
      slots.push({
        date: new Date(date),
        dayName,
        start: window.start,
        end: window.end,
        availableMins: mins,
      })
    }

    if (slots.length >= 100) break
  }

  // Assign movie minutes to slots
  for (const slot of slots) {
    if (minutesRemaining <= 0) break

    const watchMins = Math.min(slot.availableMins, minutesRemaining)
    const minuteStart = minutesCovered + 1
    const minuteEnd = minutesCovered + watchMins

    sessions.push({
      sessionNumber,
      date: slot.date,
      dayName: slot.dayName,
      start: slot.start,
      end: slot.end,
      minuteStart,
      minuteEnd,
      durationMins: watchMins,
      isComplete: minuteEnd >= totalRuntime,
    })

    minutesCovered += watchMins
    minutesRemaining -= watchMins
    sessionNumber++
  }

  const lastSession = sessions[sessions.length - 1]
  const completionDate = lastSession
    ? lastSession.date.toLocaleDateString('en-US', {
        weekday: 'long',
        month: 'long',
        day: 'numeric',
      })
    : 'Unknown'

  return {
    title: '',
    totalRuntime,
    totalSessions: sessions.length,
    sessions,
    completionDate,
  }
}

// The single source of truth for a one-title plan. The results page
// and the planner's live preview both call this, so the estimate a
// user sees before generating always matches the plan they get.
export function buildTitlePlan(
  config: AvailabilityConfig,
  goal: WatchGoal,
  totalEpisodes: number,
  mediaType: 'movie' | 'tv',
  runtime?: number
): WatchPlan {
  if (mediaType === 'movie') {
    return generateWatchPlan(config, totalEpisodes, mediaType, runtime)
  }

  // Where the viewer actually is. New-season prep has always asked for
  // this; every other mode now honours config.startEpisode too.
  const start = clampEpisode(
    goal.mode === 'new-season' ? goal.currentEpisode : config.startEpisode,
    totalEpisodes
  )
  const remaining = totalEpisodes - start + 1

  let plan: WatchPlan
  switch (goal.mode) {
    case 'finish-before':
      plan = generateFinishBeforePlan(
        goal.targetDate,
        remaining,
        config.episodeRuntime,
        mediaType,
        runtime
      )
      break
    case 'vacation':
      plan = generateVacationPlan(
        goal.startDate,
        goal.endDate,
        goal.hoursPerDay,
        remaining,
        config.episodeRuntime,
        mediaType
      )
      break
    case 'new-season':
      plan = generateFinishBeforePlan(
        goal.targetDate,
        remaining,
        config.episodeRuntime,
        mediaType
      )
      break
    default:
      plan = generateWatchPlan(config, remaining, mediaType, runtime)
  }

  return start > 1 ? offsetPlan(plan, start, totalEpisodes) : plan
}

function clampEpisode(value: number | undefined, total: number): number {
  if (!value || !Number.isFinite(value)) return 1
  return Math.min(Math.max(1, Math.floor(value)), Math.max(1, total))
}

// Plans are generated for the episodes left; shift their numbering back
// onto the whole show so week 1 reads "S2 E4", not "Episode 1", and
// progress reflects how far through the show the viewer will be.
function offsetPlan(plan: WatchPlan, start: number, total: number): WatchPlan {
  const shift = start - 1
  return {
    ...plan,
    totalEpisodes: total,
    startEpisode: start,
    weeklyBlocks: plan.weeklyBlocks.map((b) => ({
      ...b,
      startEpisode: b.startEpisode + shift,
      endEpisode: b.endEpisode + shift,
      cumulativePercent: Math.min(
        100,
        Math.round(((b.endEpisode + shift) / total) * 100)
      ),
    })),
    milestones: plan.milestones.map((m) => ({
      ...m,
      episode: m.episode + shift,
    })),
  }
}

export type ListKind = 'movies' | 'tv' | 'mixed'

export function listKind(items: { mediaType: string }[]): ListKind {
  if (items.length > 0 && items.every((i) => i.mediaType === 'movie'))
    return 'movies'
  if (items.every((i) => i.mediaType === 'tv')) return 'tv'
  return 'mixed'
}

export interface ListPreview {
  completionDate: string
  // e.g. "9 sittings · ~4 weeks"
  summary: string
}

// Exactly the schedule the list/challenge results page shows, so the
// planner preview and shared-link cards always match it
export function buildListPreview(
  config: AvailabilityConfig,
  items: QueueItem[]
): ListPreview | null {
  if (items.length === 0 || weeklyMinutes(config.schedule) <= 0) return null
  const plan = generateQueuePlan(config, items)
  if (!plan.complete) return null
  const sittings = plan.sessions.length
  return {
    completionDate: plan.completionDate,
    summary: `${sittings} sitting${sittings === 1 ? '' : 's'} · ~${plan.totalWeeks} week${plan.totalWeeks === 1 ? '' : 's'}`,
  }
}
