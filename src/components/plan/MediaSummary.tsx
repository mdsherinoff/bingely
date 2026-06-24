import { MediaItem } from '@/types/media'
import { Badge } from '@/components/ui'

interface MediaSummaryProps {
  media: MediaItem
}

export default function MediaSummary({ media }: MediaSummaryProps) {
  const runtime =
    media.mediaType === 'movie'
      ? `${media.runtime} min`
      : `${media.episodeCount} episodes · ${media.episodeRuntime} min each`

  const totalHours =
    media.mediaType === 'movie'
      ? Math.round(((media.runtime || 0) / 60) * 10) / 10
      : Math.round(
          ((media.episodeCount || 0) * (media.episodeRuntime || 24)) / 60
        )

  return (
    <div className="flex items-start gap-6">
      {/* Poster */}
      <div className="bg-ink border-gold/10 aspect-[2/3] w-24 flex-shrink-0 overflow-hidden rounded-sm border">
        {media.posterPath ? (
          <img
            src={media.posterPath}
            alt={media.title}
            className="h-full w-full object-cover"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center">
            <span className="text-gold/20 font-mono text-2xl">◎</span>
          </div>
        )}
      </div>

      {/* Info */}
      <div className="flex flex-col gap-3">
        <div>
          <h1 className="font-display text-parchment text-4xl leading-tight">
            {media.title}
          </h1>
          <p className="text-parchment/30 mt-1 font-mono text-xs">
            {media.releaseYear}
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Badge variant={media.mediaType === 'tv' ? 'rose' : 'gold'}>
            {media.mediaType === 'tv' ? 'Series' : 'Film'}
          </Badge>
          {media.genres.slice(0, 3).map((g) => (
            <Badge key={g} variant="muted">
              {g}
            </Badge>
          ))}
        </div>
        <p className="text-parchment/40 font-mono text-xs">{runtime}</p>
        <p className="text-gold/70 font-mono text-xs">
          {totalHours} hours total
        </p>
      </div>
    </div>
  )
}
