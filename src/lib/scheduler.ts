import {
  AvailabilityConfig,
  WatchPlan,
  WeeklyBlock,
  Milestone,
  WeekSchedule,
  PaceMode,
} from '@/types/media'
import { weeklyEpisodes, weeklyMinutes } from './scheduleUtils'

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
    const targetEp = Math.floor(totalEpisodes * pct)
    const block = weeklyBlocks.find((b) => b.endEpisode >= targetEp)
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
  const episodeRuntime = config.episodeRuntime || runtime || 90
  const multiplier = paceMultiplier[config.pace] ?? 1.0
  const totalMinutes = totalEpisodes * episodeRuntime
  const totalHours = Math.round((totalMinutes / 60) * 10) / 10

  const availableWeeklyMins = weeklyMinutes(config.schedule) * multiplier
  const availableWeeklyHours = Math.round((availableWeeklyMins / 60) * 10) / 10

  // How many weeks to consume all content
  const totalWeeks =
    availableWeeklyMins > 0 ? Math.ceil(totalMinutes / availableWeeklyMins) : 1

  // For movies and short content, episodesPerWeek means
  // "how many full items fit per week" — but we track by minutes
  const episodesPerWeek = Math.max(
    1,
    Math.floor(availableWeeklyMins / episodeRuntime)
  )

  const weeklyBlocks: WeeklyBlock[] = []
  let remainingMinutes = totalMinutes
  let episodesCounted = 0

  for (let week = 1; week <= totalWeeks; week++) {
    const minutesThisWeek = Math.min(remainingMinutes, availableWeeklyMins)
    // How many full episodes fit this week
    const episodesThisWeek =
      week < totalWeeks
        ? Math.min(episodesPerWeek, totalEpisodes - episodesCounted)
        : totalEpisodes - episodesCounted

    const startEpisode = episodesCounted + 1
    const endEpisode = episodesCounted + Math.max(1, episodesThisWeek)
    const cumulativePercent = Math.min(
      100,
      Math.round((endEpisode / totalEpisodes) * 100)
    )

    weeklyBlocks.push({
      week,
      episodes: Math.max(1, episodesThisWeek),
      startEpisode,
      endEpisode: Math.min(endEpisode, totalEpisodes),
      hoursWatched: Math.round((minutesThisWeek / 60) * 10) / 10,
      cumulativePercent,
    })

    episodesCounted += Math.max(1, episodesThisWeek)
    remainingMinutes -= minutesThisWeek
    if (remainingMinutes <= 0 || episodesCounted >= totalEpisodes) break
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
  mediaType: 'movie' | 'tv',
  runtime?: number
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
    ? end.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })
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

export function generateNewSeasonPlan(
  targetDate: string,
  currentEpisode: number,
  totalEpisodes: number,
  episodeRuntime: number,
  mediaType: 'movie' | 'tv'
): WatchPlan {
  const remainingEpisodes = Math.max(0, totalEpisodes - currentEpisode + 1)
  return generateFinishBeforePlan(
    targetDate,
    remainingEpisodes,
    episodeRuntime,
    mediaType
  )
}

export function generateListPlan(
  config: AvailabilityConfig,
  items: { title: string; runtime: number }[],
  pace: PaceMode
): WatchPlan {
  const multiplier = paceMultiplier[pace] ?? 1.0
  const availableWeeklyMins = weeklyMinutes(config.schedule) * multiplier
  const totalMinutes = items.reduce((acc, i) => acc + i.runtime, 0)
  const totalHours = Math.round((totalMinutes / 60) * 10) / 10
  const totalWeeks =
    availableWeeklyMins > 0 ? Math.ceil(totalMinutes / availableWeeklyMins) : 1

  // Assign items to weeks greedily
  const weeklyBlocks: WeeklyBlock[] = []
  let weekMinsRemaining = availableWeeklyMins
  let currentWeek = 1
  let itemsInCurrentWeek = 0
  let weekStartItem = 1
  let totalItemsDone = 0

  for (let i = 0; i < items.length; i++) {
    const itemMins = items[i].runtime

    if (itemMins > weekMinsRemaining && itemsInCurrentWeek > 0) {
      // Close current week
      weeklyBlocks.push({
        week: currentWeek,
        episodes: itemsInCurrentWeek,
        startEpisode: weekStartItem,
        endEpisode: totalItemsDone,
        hoursWatched:
          Math.round(((availableWeeklyMins - weekMinsRemaining) / 60) * 10) /
          10,
        cumulativePercent: Math.min(
          100,
          Math.round((totalItemsDone / items.length) * 100)
        ),
      })
      currentWeek++
      weekMinsRemaining = availableWeeklyMins
      itemsInCurrentWeek = 0
      weekStartItem = totalItemsDone + 1
    }

    // Item spans multiple weeks if it's longer than a full week
    weekMinsRemaining -= itemMins
    itemsInCurrentWeek++
    totalItemsDone++

    if (weekMinsRemaining <= 0) {
      weeklyBlocks.push({
        week: currentWeek,
        episodes: itemsInCurrentWeek,
        startEpisode: weekStartItem,
        endEpisode: totalItemsDone,
        hoursWatched: Math.round((availableWeeklyMins / 60) * 10) / 10,
        cumulativePercent: Math.min(
          100,
          Math.round((totalItemsDone / items.length) * 100)
        ),
      })
      currentWeek++
      weekMinsRemaining = availableWeeklyMins
      itemsInCurrentWeek = 0
      weekStartItem = totalItemsDone + 1
    }
  }

  // Close final week if anything remains
  if (itemsInCurrentWeek > 0) {
    weeklyBlocks.push({
      week: currentWeek,
      episodes: itemsInCurrentWeek,
      startEpisode: weekStartItem,
      endEpisode: totalItemsDone,
      hoursWatched:
        Math.round(((availableWeeklyMins - weekMinsRemaining) / 60) * 10) / 10,
      cumulativePercent: 100,
    })
  }

  const episodesPerWeek = Math.round(
    items.length / Math.max(1, weeklyBlocks.length)
  )

  return {
    totalEpisodes: items.length,
    totalWeeks: weeklyBlocks.length,
    totalHours,
    episodesPerWeek,
    completionDate: getCompletionDate(weeklyBlocks.length),
    weeklyBlocks,
    milestones: generateMilestones(items.length, weeklyBlocks),
    pace,
    mediaType: 'movie',
  }
}
