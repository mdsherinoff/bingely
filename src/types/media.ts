export type MediaType = 'movie' | 'tv'

export interface MediaItem {
  id: number
  title: string
  posterPath: string | null
  releaseYear: string
  mediaType: MediaType
  voteAverage: number
  episodeCount?: number
  seasonCount?: number
  runtime?: number
}
