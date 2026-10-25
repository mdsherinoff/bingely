import type { Metadata } from 'next'
import { Playfair_Display, Space_Mono, Sora } from 'next/font/google'
import './globals.css'
import Header from '@/components/layout/Header'
import SkipLink from '@/components/layout/SkipLink'
import MotionProvider from '@/components/layout/MotionProvider'
import FeedbackWidget from '@/components/feedback/FeedbackWidget'
import CinemaModeChip from '@/components/easter-eggs/CinemaModeChip'
import { Analytics } from '@vercel/analytics/next'

const playfair = Playfair_Display({
  subsets: ['latin'],
  variable: '--font-playfair',
})

// Absolute base for preview-card URLs. Set NEXT_PUBLIC_SITE_URL for a
// custom domain; on Vercel the production domain is detected
const siteUrl =
  process.env.NEXT_PUBLIC_SITE_URL ??
  (process.env.VERCEL_PROJECT_PRODUCTION_URL
    ? `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`
    : 'http://localhost:3000')

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  openGraph: { siteName: 'Bingely', type: 'website' },
  title: {
    default: 'Bingely — Your Personal Cinema Planner',
    template: '%s · Bingely',
  },
  description:
    'Plan your binge. Bingely turns any film, series, or watchlist into a realistic viewing schedule built around your free time.',
}

const spaceMono = Space_Mono({
  weight: ['400', '700'],
  subsets: ['latin'],
  variable: '--font-space-mono',
})

const sora = Sora({
  subsets: ['latin'],
  variable: '--font-sora',
})

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html
      lang="en"
      className={`${playfair.variable} ${spaceMono.variable} ${sora.variable}`}
    >
      <body
        className={`${playfair.variable} ${spaceMono.variable} ${sora.variable} bg-espresso text-parchment font-sans`}
      >
        <MotionProvider>
          <SkipLink />
          <Header />
          {children}
          <FeedbackWidget />
          <CinemaModeChip />
        </MotionProvider>
        <Analytics />
      </body>
    </html>
  )
}
