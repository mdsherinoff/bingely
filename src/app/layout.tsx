import { Playfair_Display, Space_Mono } from 'next/font/google'
import './globals.css'
import Header from '@/components/layout/Header'
import SkipLink from '@/components/layout/SkipLink'
import FeedbackWidget from '@/components/feedback/FeedbackWidget'
import { Analytics } from '@vercel/analytics/next'

const playfair = Playfair_Display({
  subsets: ['latin'],
  variable: '--font-playfair',
})

const spaceMono = Space_Mono({
  weight: ['400', '700'],
  subsets: ['latin'],
  variable: '--font-space-mono',
})

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className={`${playfair.variable} ${spaceMono.variable}`}>
      <body
        className={`${playfair.variable} ${spaceMono.variable} bg-cinema-black text-cinema-white font-mono`}
      >
        <SkipLink />
        <Header />
        {children}
        <FeedbackWidget />
        <Analytics />
      </body>
    </html>
  )
}
