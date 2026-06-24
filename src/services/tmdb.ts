import { MediaItem } from '@/types/media'

const BASE_URL = process.env.TMDB_BASE_URL
const IMAGE_BASE = process.env.TMDB_IMAGE_BASE_URL
const TOKEN = process.env.TMDB_API_KEY

const headers = {
  Authorization: `Bearer ${TOKEN}`,
  'Content-Type': 'application/json',
}

// Raw TMDB result types
interface TMDBMovieResult {
  id: number
  title: string
  poster_path: string | null
  release_date: string
  vote_average: number
  media_type?: string
}

interface TMDBTVResult {
  id: number
  name: string
  poster_path: string | null
  first_air_date: string
  vote_average: number
  media_type?: string
}

type TMDBResult = TMDBMovieResult | TMDBTVResult

function isTV(result: TMDBResult): result is TMDBTVResult {
  return 'name' in result
}

export function getPosterUrl(path: string, size = 'w500'): string {
  return `${IMAGE_BASE}/${size}${path}`
}

function normalizeResult(result: TMDBResult): MediaItem {
  if (isTV(result)) {
    return {
      id: result.id,
      title: result.name,
      posterPath: result.poster_path ? getPosterUrl(result.poster_path) : null,
      releaseYear: result.first_air_date?.slice(0, 4) || 'Unknown',
      mediaType: 'tv',
      voteAverage: Math.round(result.vote_average * 10) / 10,
    }
  }

  return {
    id: result.id,
    title: result.title,
    posterPath: result.poster_path ? getPosterUrl(result.poster_path) : null,
    releaseYear: result.release_date?.slice(0, 4) || 'Unknown',
    mediaType: 'movie',
    voteAverage: Math.round(result.vote_average * 10) / 10,
  }
}

export async function searchMedia(query: string): Promise<MediaItem[]> {
  const res = await fetch(
    `${BASE_URL}/search/multi?query=${encodeURIComponent(query)}&include_adult=false&page=1`,
    { headers }
  )

  if (!res.ok) throw new Error('TMDB search failed')

  const data = await res.json()

  return data.results
    .filter(
      (r: TMDBResult & { media_type?: string }) =>
        r.media_type === 'movie' || r.media_type === 'tv'
    )
    .map(normalizeResult)
}

export async function getTrending(): Promise<MediaItem[]> {
  const res = await fetch(`${BASE_URL}/trending/all/week`, { headers })

  if (!res.ok) throw new Error('TMDB trending failed')

  const data = await res.json()

  return data.results
    .filter(
      (r: TMDBResult & { media_type?: string }) =>
        r.media_type === 'movie' || r.media_type === 'tv'
    )
    .slice(0, 18)
    .map(normalizeResult)
}

export async function getMovieDetails(id: number): Promise<MediaItem> {
  const res = await fetch(`${BASE_URL}/movie/${id}`, { headers })

  if (!res.ok) throw new Error('Failed to fetch movie details')

  const data = await res.json()

  return {
    id: data.id,
    title: data.title,
    posterPath: data.poster_path ? getPosterUrl(data.poster_path) : null,
    backdropPath: data.backdrop_path
      ? getPosterUrl(data.backdrop_path, 'original')
      : null,
    releaseYear: data.release_date?.slice(0, 4) || 'Unknown',
    mediaType: 'movie',
    voteAverage: Math.round(data.vote_average * 10) / 10,
    overview: data.overview || '',
    genres: data.genres?.map((g: { name: string }) => g.name) || [],
    runtime: data.runtime || null,
  }
}

export async function getTVDetails(id: number): Promise<MediaItem> {
  const res = await fetch(`${BASE_URL}/tv/${id}`, { headers })

  if (!res.ok) throw new Error('Failed to fetch TV details')

  const data = await res.json()
  const rawRuntime = data.episode_run_time

  let episodeRuntime: number
  if (Array.isArray(rawRuntime) && rawRuntime.length > 0) {
    // TMDB returns an array, take the most common value
    episodeRuntime = rawRuntime[0]
  } else {
    // Fallback: assume 24 minutes (anime) or 45 minutes (drama)
    episodeRuntime = 24
  }

  const validSeasons =
    data.seasons?.filter(
      (s: { season_number: number }) => s.season_number > 0
    ) || []

  return {
    id: data.id,
    title: data.name,
    posterPath: data.poster_path ? getPosterUrl(data.poster_path) : null,
    backdropPath: data.backdrop_path
      ? getPosterUrl(data.backdrop_path, 'original')
      : null,
    releaseYear: data.first_air_date?.slice(0, 4) || 'Unknown',
    mediaType: 'tv',
    voteAverage: Math.round(data.vote_average * 10) / 10,
    overview: data.overview || '',
    genres: data.genres?.map((g: { name: string }) => g.name) || [],
    episodeCount: data.number_of_episodes || 0,
    episodeRuntime: episodeRuntime,
    seasonCount: validSeasons.length,
    status: data.status,
    seasons: validSeasons.map(
      (s: {
        id: number
        season_number: number
        episode_count: number
        name: string
        air_date: string | null
      }) => ({
        id: s.id,
        seasonNumber: s.season_number,
        episodeCount: s.episode_count,
        episodeRuntime: episodeRuntime,
        name: s.name,
        airDate: s.air_date,
      })
    ),
  }
}
