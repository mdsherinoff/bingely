import Header from '@/components/layout/Header'

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className={`...`}>
      <body className="bg-espresso text-parchment font-body">
        <Header />
        {children}
      </body>
    </html>
  )
}
