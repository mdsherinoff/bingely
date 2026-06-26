import { Playfair_Display, Crimson_Text, Space_Mono } from 'next/font/google'
import './globals.css'
import Header from '@/components/layout/Header'

const playfair = Playfair_Display({
  subsets: ['latin'],
  variable: '--font-playfair',
})

const crimson = Crimson_Text({
  weight: ['400', '600'],
  subsets: ['latin'],
  variable: '--font-crimson',
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
    <html
      lang="en"
      className={`${playfair.variable} ${crimson.variable} ${spaceMono.variable}`}
    >
      <body className="bg-espresso text-parchment font-body">
        <Header />
        {children}
      </body>
    </html>
  )
}
