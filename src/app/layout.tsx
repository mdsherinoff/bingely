import type { Metadata } from 'next'
import { Playfair_Display, Space_Mono, Sora } from 'next/font/google'
import './globals.css'
import Header from '@/components/layout/Header'
import SkipLink from '@/components/layout/SkipLink'
import FeedbackWidget from '@/components/feedback/FeedbackWidget'
import CinemaModeChip from '@/components/easter-eggs/CinemaModeChip'
import { Analytics } from '@vercel/analytics/next'

const playfair = Playfair_Display({
  subsets: ['latin'],
  variable: '--font-playfair',
})

export const metadata: Metadata = {
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
        <SkipLink />
        <Header />
        {children}
        <FeedbackWidget />
        <CinemaModeChip />
        <Analytics />
      </body>
    </html>
  )
}
