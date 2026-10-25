import { Season } from '@/types/media'

interface Position {
  season: number
  episode: number
}

// Absolute episode number (1-based, across the whole show) → season and
// episode within that season. Specials (season 0) are excluded, matching
// how TMDB counts number_of_episodes. Returns null past the known
// seasons, so callers can fall back to the plain number.
export function episodePosition(
  absolute: number,
  seasons: Season[] | undefined
): Position | null {
  if (!seasons?.length || absolute < 1) return null
  const ordered = seasons
    .filter((s) => s.seasonNumber > 0 && s.episodeCount > 0)
    .sort((a, b) => a.seasonNumber - b.seasonNumber)
  let remaining = absolute
  for (const s of ordered) {
    if (remaining <= s.episodeCount)
      return { season: s.seasonNumber, episode: remaining }
    remaining -= s.episodeCount
  }
  return null
}

// "S2 E3", or "Episode 47" when season data doesn't cover it
export function episodeLabel(absolute: number, seasons?: Season[]): string {
  const p = episodePosition(absolute, seasons)
  return p ? `S${p.season} E${p.episode}` : `Episode ${absolute}`
}

// "S1 E1–E5", "S1 E7 – S2 E3", or "Episodes 21–25" without season data
export function episodeRangeLabel(
  start: number,
  end: number,
  seasons?: Season[]
): string {
  if (start === end) return episodeLabel(start, seasons)
  const a = episodePosition(start, seasons)
  const b = episodePosition(end, seasons)
  if (!a || !b) return `Episodes ${start}–${end}`
  if (a.season === b.season) return `S${a.season} E${a.episode}–E${b.episode}`
  return `S${a.season} E${a.episode} – S${b.season} E${b.episode}`
}
