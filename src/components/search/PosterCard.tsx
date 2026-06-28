'use client'

import { motion } from 'framer-motion'
import { MediaItem } from '@/types/media'
import { Badge } from '@/components/ui'
import Link from 'next/link'

interface PosterCardProps {
  item: MediaItem
  index?: number
}

export default function PosterCard({ item, index = 0 }: PosterCardProps) {

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: index * 0.05, ease: 'easeOut' }}
    >
      <Link
        href={`/plan/${item.id}?type=${item.mediaType}`}
        className="group flex flex-col gap-3"
      >
        <div className="bg-ink border-gold/10 group-hover:border-gold/40 relative aspect-[2/3] overflow-hidden rounded-sm border transition-colors">
          {item.posterPath ? (
            <img
              src={item.posterPath}
              alt={item.title}
              className="poster-color h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
            />
          ) : (
            <div className="flex h-full w-full flex-col items-center justify-center gap-2 p-4">
              <span className="text-gold/20 font-mono text-3xl">◎</span>
              <p className="font-display text-parchment/30 text-center text-lg leading-tight">
                {item.title}
              </p>
            </div>
          )}

          <div className="bg-espresso/80 absolute inset-0 flex items-center justify-center opacity-0 transition-opacity duration-300 group-hover:opacity-100">
            <p className="text-gold font-mono text-xs tracking-widest">
              PLAN THIS →
            </p>
          </div>

          <div className="bg-espresso/90 border-gold/20 absolute top-2 right-2 rounded-sm border px-2 py-0.5">
            <span className="text-gold font-mono text-xs">
              {item.voteAverage.toFixed(1)}
            </span>
          </div>
        </div>

        <div className="flex flex-col gap-1.5">
          <p className="font-body text-parchment group-hover:text-gold text-base leading-tight transition-colors duration-200">
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
        </div>
      </Link>
    </motion.div>
  )
}
