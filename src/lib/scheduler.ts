import {
  AvailabilityConfig,
  WatchPlan,
  WeeklyBlock,
  Milestone,
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
  // Movies — simple single session plan
  if (mediaType === 'movie') {
    return {
      totalEpisodes: 1,
      totalWeeks: 1,
      totalHours: Math.round(((runtime || 120) / 60) * 10) / 10,
      episodesPerWeek: 1,
      completionDate: getCompletionDate(1),
      weeklyBlocks: [
        {
          week: 1,
          episodes: 1,
          startEpisode: 1,
          endEpisode: 1,
          hoursWatched: Math.round(((runtime || 120) / 60) * 10) / 10,
          cumulativePercent: 100,
        },
      ],
      milestones: [{ label: 'Complete', episode: 1, week: 1, percent: 100 }],
      pace: config.pace,
      mediaType,
      runtime,
    }
  }

  // TV — week by week breakdown
  const rawEpsPerWeek = weeklyEpisodes(config.schedule, config.episodeRuntime)
  const multiplier = paceMultiplier[config.pace] ?? 1.0
  const episodesPerWeek = Math.max(1, Math.floor(rawEpsPerWeek * multiplier))
  const totalWeeks = Math.ceil(totalEpisodes / episodesPerWeek)
  const totalMinutes = totalEpisodes * config.episodeRuntime
  const totalHours = Math.round((totalMinutes / 60) * 10) / 10
  const weeklyHours =
    Math.round(((weeklyMinutes(config.schedule) * multiplier) / 60) * 10) / 10

  const weeklyBlocks: WeeklyBlock[] = []
  let episodesRemaining = totalEpisodes

  for (let week = 1; week <= totalWeeks; week++) {
    const episodesThisWeek = Math.min(episodesPerWeek, episodesRemaining)
    const startEpisode = (week - 1) * episodesPerWeek + 1
    const endEpisode = startEpisode + episodesThisWeek - 1
    const cumulativeEpisodes = endEpisode
    const cumulativePercent = Math.round(
      (cumulativeEpisodes / totalEpisodes) * 100
    )

    weeklyBlocks.push({
      week,
      episodes: episodesThisWeek,
      startEpisode,
      endEpisode,
      hoursWatched: weeklyHours,
      cumulativePercent: Math.min(100, cumulativePercent),
    })

    episodesRemaining -= episodesThisWeek
    if (episodesRemaining <= 0) break
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
  }
}
