import { WeekSchedule, PaceMode, MediaType } from '@/types/media'
import { weeklyMinutes, dailyMinutes, DAYS } from './scheduleUtils'

export interface Suggestion {
  type: 'pace' | 'schedule' | 'info'
  level: 'tip' | 'warning' | 'success'
  title: string
  body: string
}

export function generateSuggestions(
  schedule: WeekSchedule,
  pace: PaceMode,
  episodeRuntime: number,
  totalEpisodes: number,
  mediaType: MediaType
): Suggestion[] {
  const suggestions: Suggestion[] = []

  // Movies don't need schedule suggestions
  if (mediaType === 'movie') return suggestions

  const totalWeeklyMins = weeklyMinutes(schedule)
  const totalWeeklyHours = Math.round((totalWeeklyMins / 60) * 10) / 10
  const episodesPerWeek = Math.floor(totalWeeklyMins / episodeRuntime)
  const weeksToFinish =
    episodesPerWeek > 0 ? Math.ceil(totalEpisodes / episodesPerWeek) : null

  const activeDays = DAYS.filter((d) => schedule[d]?.enabled)
  const busyDays = DAYS.filter((d) => {
    const mins = dailyMinutes(schedule, d)
    return mins >= 180
  })
  const lightDays = activeDays.filter((d) => {
    const mins = dailyMinutes(schedule, d)
    return mins > 0 && mins < 60
  })

  // No days selected
  if (activeDays.length === 0) {
    suggestions.push({
      type: 'schedule',
      level: 'warning',
      title: 'No days selected',
      body: 'Select at least one day to generate a watch plan.',
    })
    return suggestions
  }

  // No days selected — only relevant for TV
  if (activeDays.length === 0 && mediaType === 'tv') {
    suggestions.push({
      type: 'schedule',
      level: 'warning',
      title: 'No days selected',
      body: 'Select at least one day to generate a watch plan.',
    })
    return suggestions
  }

  // Very little time
  if (totalWeeklyHours < 2 && mediaType === 'tv') {
    suggestions.push({
      type: 'schedule',
      level: 'warning',
      title: 'Very limited time',
      body: `You have ${totalWeeklyHours}h/week. Consider adding more days or extending your time windows.`,
    })
  }

  // Light days warning
  if (lightDays.length > 0) {
    suggestions.push({
      type: 'schedule',
      level: 'tip',
      title: 'Short sessions detected',
      body: `${lightDays.join(', ')} ${lightDays.length === 1 ? 'has' : 'have'} less than 1 hour scheduled. You might not finish a full episode — consider extending those windows.`,
    })
  }

  // Pace recommendations
  if (pace === 'hardcore' && totalWeeklyHours > 20) {
    suggestions.push({
      type: 'pace',
      level: 'warning',
      title: 'Hardcore pace is intense',
      body: `At ${totalWeeklyHours}h/week on hardcore, this will dominate your schedule. Make sure that's intentional.`,
    })
  }

  if (pace === 'casual' && totalWeeklyHours < 5) {
    suggestions.push({
      type: 'pace',
      level: 'tip',
      title: 'Casual + limited time',
      body: 'With a casual pace and limited hours, completion will take a long time. Consider balanced pace to make more progress.',
    })
  }

  // Optimal pace suggestion
  if (weeksToFinish && weeksToFinish <= 4 && pace !== 'binge') {
    suggestions.push({
      type: 'pace',
      level: 'success',
      title: 'You could finish fast',
      body: `With your current schedule you're ${weeksToFinish} weeks away on binge pace. Switch to binge if you want to power through.`,
    })
  }

  // Best viewing days
  if (busyDays.length > 0) {
    suggestions.push({
      type: 'schedule',
      level: 'tip',
      title: `Best days: ${busyDays.slice(0, 2).join(' & ')}`,
      body: `You have the most time on ${busyDays.slice(0, 2).join(' and ')}. These are your power viewing days.`,
    })
  }

  // Weekend only
  const onlyWeekends =
    activeDays.length > 0 &&
    activeDays.every((d) => ['Saturday', 'Sunday'].includes(d))
  if (onlyWeekends) {
    suggestions.push({
      type: 'schedule',
      level: 'tip',
      title: 'Weekend warrior',
      body: "You're only watching on weekends. Adding even one weekday session would significantly speed up your plan.",
    })
  }

  // Long series encouragement
  if (totalEpisodes >= 500) {
    suggestions.push({
      type: 'info',
      level: 'tip',
      title: 'Long journey ahead',
      body: 'For long series like this, consistency beats intensity. A steady balanced pace is more sustainable than binge watching.',
    })
  }

  // Great schedule
  if (
    suggestions.length === 0 ||
    suggestions.every((s) => s.level !== 'warning')
  ) {
    suggestions.push({
      type: 'schedule',
      level: 'success',
      title: 'Solid schedule',
      body: `${totalWeeklyHours}h/week across ${activeDays.length} days. You're set up well for a consistent viewing habit.`,
    })
  }

  return suggestions
}
