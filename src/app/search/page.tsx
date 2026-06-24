export default function SearchPage() {
  return (
    <main className="min-h-screen bg-espresso">
      {/* Sticky header with search bar */}
      <header className="sticky top-0 z-50 bg-espresso/90 backdrop-blur border-b border-gold/10 px-6 py-4" />

      {/* Poster grid */}
      <section className="px-6 py-10">
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4" />
      </section>
    </main>
  );
}
