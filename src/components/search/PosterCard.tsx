import { MediaItem } from '@/types/media'
import { Badge } from '@/components/ui'
import Link from 'next/link'

interface PosterCardProps {
  item: MediaItem
}

export default function PosterCard({ item }: PosterCardProps) {
  const meta =
    item.mediaType === 'tv'
      ? `${item.episodeCount} eps · ${item.seasonCount} seasons`
      : `${item.runtime} min`

  return (
    <Link href={`/plan/${item.id}`} className="group flex flex-col gap-3">
      {/* Poster */}
      <div className="bg-ink border-gold/10 group-hover:border-gold/40 relative aspect-[2/3] overflow-hidden rounded-sm border transition-colors">
        {item.posterPath ? (
          <img
            src={item.posterPath}
            alt={item.title}
            className="h-full w-full object-cover"
          />
        ) : (
          /* Placeholder when no poster */
          <div className="flex h-full w-full flex-col items-center justify-center gap-2 p-4">
            <span className="text-gold/20 font-mono text-3xl">◎</span>
            <p className="font-display text-parchment/30 text-center text-lg leading-tight">
              {item.title}
            </p>
          </div>
        )}

        {/* Hover overlay */}
        <div className="bg-espresso/80 absolute inset-0 flex items-center justify-center opacity-0 transition-opacity group-hover:opacity-100">
          <p className="text-gold font-mono text-xs tracking-widest">
            PLAN THIS →
          </p>
        </div>

        {/* Rating pill */}
        <div className="bg-espresso/90 border-gold/20 absolute top-2 right-2 rounded-sm border px-2 py-0.5">
          <span className="text-gold font-mono text-xs">
            {item.voteAverage.toFixed(1)}
          </span>
        </div>
      </div>

      {/* Info */}
      <div className="flex flex-col gap-1.5">
        <p className="font-body text-parchment group-hover:text-gold text-base leading-tight transition-colors">
          {item.title}
        </p>
        <div className="flex flex-wrap items-center gap-2">
          <Badge variant={item.mediaType === 'tv' ? 'rose' : 'gold'}>
            {item.mediaType === 'tv' ? 'Series' : 'Film'}
          </Badge>
          <span className="text-parchment/30 font-mono text-xs">
            {item.releaseYear}
          </span>
        </div>
        <p className="text-parchment/30 font-mono text-xs">{meta}</p>
      </div>
    </Link>
  )
}
