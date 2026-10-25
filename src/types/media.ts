export type MediaType = 'movie' | 'tv'

export interface MediaItem {
  id: number
  title: string
  posterPath: string | null
  backdropPath: string | null
  releaseYear: string
  mediaType: MediaType
  voteAverage: number
  overview: string
  genres: string[]
  // Movies
  runtime?: number
  // TV
  episodeCount?: number
  seasonCount?: number
  seasons?: Season[]
  status?: string
  episodeRuntime?: number // minutes per episode
}

export interface Season {
  id: number
  seasonNumber: number
  episodeCount: number
  name: string
  airDate: string | null
}

export type PaceMode = 'casual' | 'balanced' | 'binge' | 'hardcore'

export interface TimeWindow {
  start: string // "19:00"
  end: string // "22:00"
}

export interface DaySchedule {
  enabled: boolean
  windows: TimeWindow[]
}

export type WeekSchedule = Record<string, DaySchedule>

export interface AvailabilityConfig {
  schedule: WeekSchedule
  pace: PaceMode
  episodeRuntime: number
  // First episode still to watch (series only). Plans pick up from here
  // instead of always starting at episode 1.
  startEpisode?: number
  // "Watch together": both people's free time, kept so the planner can
  // restore them on edit. `schedule` holds only the slots they share.
  together?: { mine: WeekSchedule; theirs: WeekSchedule }
}

export interface WeeklyBlock {
  week: number
  episodes: number
  startEpisode: number
  endEpisode: number
  hoursWatched: number
  cumulativePercent: number
}

export interface Milestone {
  label: string
  episode: number
  week: number
  percent: number
}

export interface WatchPlan {
  totalEpisodes: number
  totalWeeks: number
  totalHours: number
  episodesPerWeek: number
  completionDate: string
  weeklyBlocks: WeeklyBlock[]
  milestones: Milestone[]
  pace: PaceMode
  mediaType: MediaType
  runtime?: number
  // Set when the plan picks up partway through a show
  startEpisode?: number
}

export interface FilmChallenge {
  id: string
  title: string
  description: string
  category: 'director' | 'franchise' | 'genre' | 'studio'
  icon: string
  totalRuntime: number
  itemCount: number
  items: ChallengeItem[]
}

export interface ChallengeItem {
  title: string
  year: string
  runtime: number
  tmdbId: number
  mediaType: MediaType
}

export type GoalMode = 'standard' | 'finish-before' | 'vacation' | 'new-season'

export interface FinishBeforeGoal {
  mode: 'finish-before'
  targetDate: string // ISO date string
}

export interface VacationGoal {
  mode: 'vacation'
  startDate: string
  endDate: string
  hoursPerDay: number
}

export interface NewSeasonGoal {
  mode: 'new-season'
  seasonName: string
  targetDate: string
  currentEpisode: number
}

export type WatchGoal =
  | { mode: 'standard' }
  | FinishBeforeGoal
  | VacationGoal
  | NewSeasonGoal

export interface CustomList {
  id: string
  title: string
  items: CustomListItem[]
  createdAt: string
  updatedAt?: string
}

export interface CustomListItem {
  tmdbId: number
  title: string
  mediaType: MediaType
  posterPath: string | null
  // Whole title: a series' runtime covers every episode
  runtime: number
  releaseYear: string
  // Series only: total episodes and episodes per regular season, so the
  // plan books whole episodes and labels them "S2 E3"
  episodes?: number
  seasons?: number[]
  // Series only, 1-based: skip episodes already watched
  startEpisode?: number
}

// A list item as carried in a shared link — compact keys, everything
// beyond title/runtime/type optional so older links still decode
export interface SharedListItem {
  title: string
  runtime: number
  mediaType: MediaType
  id?: number
  poster?: string | null
  year?: string
  episodes?: number
  seasons?: number[]
  startEpisode?: number
}