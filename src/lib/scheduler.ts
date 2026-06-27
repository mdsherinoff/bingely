import {
  AvailabilityConfig,
  WatchPlan,
  WeeklyBlock,
  Milestone,
  WeekSchedule,
  PaceMode,
} from '@/types/media'
import { weeklyMinutes, windowMinutes } from './scheduleUtils'
import { DAYS } from '@/lib/scheduleUtils'

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

export function generateListMoviePlan(
  config: AvailabilityConfig,
  items: { title: string; runtime: number }[]
): MoviePlan {
  const sessions: MovieSession[] = []
  let sessionNumber = 1

  const today = new Date()
  today.setHours(0, 0, 0, 0)

  // Build available slots
  const slots: {
    date: Date
    dayName: string
    start: string
    end: string
    availableMins: number
  }[] = []

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
    if (slots.length >= 200) break
  }

  // Assign each item across slots
  let slotIndex = 0
  let slotMinsRemaining = slots[0]?.availableMins ?? 0

  for (const item of items) {
    let itemMinsRemaining = item.runtime
    let minuteStart = 1

    while (itemMinsRemaining > 0 && slotIndex < slots.length) {
      const slot = slots[slotIndex]
      const watchMins = Math.min(slotMinsRemaining, itemMinsRemaining)
      const minuteEnd = minuteStart + watchMins - 1

      sessions.push({
        sessionNumber,
        date: slot.date,
        dayName: slot.dayName,
        start: slot.start,
        end: slot.end,
        minuteStart,
        minuteEnd,
        durationMins: watchMins,
        isComplete: itemMinsRemaining - watchMins <= 0,
      })

      itemMinsRemaining -= watchMins
      slotMinsRemaining -= watchMins
      minuteStart = minuteEnd + 1
      sessionNumber++

      if (slotMinsRemaining <= 0) {
        slotIndex++
        slotMinsRemaining = slots[slotIndex]?.availableMins ?? 0
      }
    }
  }

  const lastSession = sessions[sessions.length - 1]
  const totalRuntime = items.reduce((acc, i) => acc + i.runtime, 0)

  return {
    title: '',
    totalRuntime,
    totalSessions: sessions.length,
    sessions,
    completionDate: lastSession
      ? lastSession.date.toLocaleDateString('en-US', {
          weekday: 'long',
          month: 'long',
          day: 'numeric',
        })
      : 'Unknown',
  }
}
