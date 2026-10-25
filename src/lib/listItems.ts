import { CustomListItem, Season, SharedListItem } from '@/types/media'
import { QueueItem, remainingRuntime } from './queue'

// What a shared link carries for each title: enough to rebuild the list,
// posters and episode numbering included, on a device that's never seen it
export function toSharedItem(item: CustomListItem): SharedListItem {
  return {
    title: item.title,
    runtime: item.runtime,
    mediaType: item.mediaType,
    ...(item.tmdbId > 0 ? { id: item.tmdbId } : {}),
    ...(item.posterPath ? { poster: item.posterPath } : {}),
    ...(item.releaseYear ? { year: item.releaseYear } : {}),
    ...(item.episodes ? { episodes: item.episodes } : {}),
    ...(item.seasons?.length ? { seasons: item.seasons } : {}),
    ...(item.startEpisode && item.startEpisode > 1
      ? { startEpisode: item.startEpisode }
      : {}),
  }
}

export function fromSharedItem(
  item: SharedListItem,
  index: number
): CustomListItem {
  return {
    // Links made before ids were carried get a stand-in that can't clash
    // with a real TMDB id
    tmdbId: item.id ?? -1 - index,
    title: item.title,
    mediaType: item.mediaType,
    posterPath: item.poster ?? null,
    runtime: item.runtime,
    releaseYear: item.year ?? '',
    ...(item.episodes ? { episodes: item.episodes } : {}),
    ...(item.seasons?.length ? { seasons: item.seasons } : {}),
    ...(item.startEpisode ? { startEpisode: item.startEpisode } : {}),
  }
}

export function toQueueItem(item: SharedListItem | CustomListItem): QueueItem {
  return {
    title: item.title,
    runtime: item.runtime,
    mediaType: item.mediaType,
    episodes: item.episodes,
    startEpisode: item.startEpisode,
  }
}

// Episode counts per season → the Season shape the label helpers take
export function seasonsFromCounts(counts?: number[]): Season[] | undefined {
  if (!counts?.length) return undefined
  return counts.map((episodeCount, i) => ({
    id: i + 1,
    seasonNumber: i + 1,
    episodeCount,
    name: `Season ${i + 1}`,
    airDate: null,
  }))
}

// Minutes left to watch of a list item, after any skipped episodes
export function itemRuntime(item: SharedListItem | CustomListItem): number {
  return remainingRuntime(toQueueItem(item))
}

// Series store their whole-show runtime, so show hours rather than a
// four-digit minute count
export function formatRuntime(mins: number): string {
  if (mins < 120) return `${mins}m`
  const h = Math.floor(mins / 60)
  const m = mins % 60
  return m === 0 ? `${h}h` : `${h}h ${m}m`
}
