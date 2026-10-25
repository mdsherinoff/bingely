import 'server-only'
import type { Metadata } from 'next'
import { AvailabilityConfig, WatchGoal } from '@/types/media'
import { decodeState } from './urlState'
import {
  buildListPreview,
  buildTitlePlan,
  generateMoviePlan,
} from './scheduler'
import { getMovieDetails, getTVDetails } from '@/services/tmdb'
import { getChallengeById } from './challenges'

type SearchParams = Promise<Record<string, string | string[] | undefined>>

function param(sp: Record<string, string | string[] | undefined>, key: string) {
  const v = sp[key]
  return typeof v === 'string' ? v : undefined
}

// Shared shape for a plan's link preview: title, finish date, a short
// summary line and (when there is one) the poster
function previewMetadata(opts: {
  title: string
  date?: string
  line?: string
  poster?: string | null
}): Metadata {
  const image = new URLSearchParams({ title: opts.title })
  if (opts.date) image.set('date', opts.date)
  if (opts.line) image.set('line', opts.line)
  if (opts.poster) image.set('poster', opts.poster)
  const pageTitle = opts.date
    ? `${opts.title} — done ${opts.date}`
    : `${opts.title} watch plan`
  const description = [opts.line, 'Planned with Bingely']
    .filter(Boolean)
    .join(' · ')
  const images = [{ url: `/api/og?${image}`, width: 1200, height: 630 }]
  return {
    title: pageTitle,
    description,
    openGraph: { title: pageTitle, description, images },
    twitter: {
      card: 'summary_large_image',
      title: pageTitle,
      description,
      images,
    },
  }
}

const fallback: Metadata = { title: 'Watch plan' }

export async function titlePlanMetadata(
  id: string,
  searchParams: SearchParams
): Promise<Metadata> {
  try {
    const sp = await searchParams
    const type = param(sp, 'type') === 'movie' ? 'movie' : 'tv'
    const rawConfig = param(sp, 'config')
    const config = rawConfig ? decodeState<AvailabilityConfig>(rawConfig) : null
    const rawGoal = param(sp, 'goal')
    const goal: WatchGoal = (rawGoal
      ? decodeState<WatchGoal>(rawGoal)
      : null) ?? { mode: 'standard' }
    const media =
      type === 'movie'
        ? await getMovieDetails(Number(id))
        : await getTVDetails(Number(id))
    if (!config)
      return previewMetadata({ title: media.title, poster: media.posterPath })

    if (type === 'movie') {
      const plan = generateMoviePlan(config, media.runtime ?? 120)
      return previewMetadata({
        title: media.title,
        date: plan.totalSessions ? plan.completionDate : undefined,
        line:
          plan.totalSessions === 1
            ? 'In one sitting'
            : `${plan.totalSessions} sessions`,
        poster: media.posterPath,
      })
    }
    const plan = buildTitlePlan(
      config,
      goal,
      media.episodeCount ?? 1,
      'tv',
      media.runtime ?? undefined
    )
    const left = plan.startEpisode
      ? plan.totalEpisodes - plan.startEpisode + 1
      : plan.totalEpisodes
    return previewMetadata({
      title: media.title,
      date: plan.completionDate,
      line: `${left} episode${left === 1 ? '' : 's'}${plan.startEpisode ? ' to go' : ''} · ${plan.episodesPerWeek} a week${config.together ? ' · planned for two' : ''}`,
      poster: media.posterPath,
    })
  } catch {
    return fallback
  }
}

export async function listPlanMetadata(
  searchParams: SearchParams
): Promise<Metadata> {
  try {
    const sp = await searchParams
    const title = param(sp, 'title') ?? 'Custom list'
    const rawConfig = param(sp, 'config')
    const rawItems = param(sp, 'items')
    const config = rawConfig ? decodeState<AvailabilityConfig>(rawConfig) : null
    const items = rawItems
      ? decodeState<{ title: string; runtime: number; mediaType: string }[]>(
          rawItems
        )
      : null
    if (!config || !items) return previewMetadata({ title })
    const preview = buildListPreview(config, items)
    return previewMetadata({
      title,
      date: preview?.completionDate,
      line: `${items.length} title${items.length === 1 ? '' : 's'}${preview?.summary ? ` · ${preview.summary}` : ''}`,
    })
  } catch {
    return fallback
  }
}

export async function challengePlanMetadata(
  id: string,
  searchParams: SearchParams
): Promise<Metadata> {
  try {
    const challenge = getChallengeById(id)
    if (!challenge) return fallback
    const sp = await searchParams
    const rawConfig = param(sp, 'config')
    const config = rawConfig ? decodeState<AvailabilityConfig>(rawConfig) : null
    const preview = config ? buildListPreview(config, challenge.items) : null
    return previewMetadata({
      title: challenge.title,
      date: preview?.completionDate,
      line: `${challenge.itemCount} films${preview?.summary ? ` · ${preview.summary}` : ''}`,
    })
  } catch {
    return fallback
  }
}
