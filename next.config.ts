import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
  images: {
    // Posters, backdrops and streaming-service logos all come from TMDB
    remotePatterns: [new URL('https://image.tmdb.org/t/p/**')],
  },
}

export default nextConfig
