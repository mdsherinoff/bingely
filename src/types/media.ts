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