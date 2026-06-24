export default function SearchPage() {
  return (
    <main className="bg-espresso min-h-screen">
      {/* Sticky header with search bar */}
      <header className="bg-espresso/90 border-gold/10 sticky top-0 z-50 border-b px-6 py-4 backdrop-blur" />

      {/* Poster grid */}
      <section className="px-6 py-10">
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5" />
      </section>
    </main>
  )
}
