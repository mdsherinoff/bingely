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