export default function LandingPage() {
  return (
    <main className="relative min-h-screen bg-espresso">
      {/* Quote marquee ticker */}
      <div className="h-10 bg-ink border-b border-gold/20" />

      {/* Hero — full viewport, centered search */}
      <section className="grain relative flex flex-col items-center justify-center min-h-screen gap-8 px-4">
        <div className="text-center">
          <h1 className="font-display text-8xl text-parchment tracking-tight">
            Bingely
          </h1>
          <p className="font-body italic text-parchment/60 text-xl mt-3">
            Stop wondering when you'll finish. Start watching with a plan.
          </p>
        </div>
        {/* Search bar */}
        <div className="w-full max-w-2xl" />
      </section>

      {/* Feature strip — 3 columns */}
      <section className="bg-ink border-t border-gold/10 py-20 px-4" />

      {/* Example plan preview */}
      <section className="py-20 px-4" />

      {/* Footer */}
      <footer className="border-t border-gold/10 py-10 px-4" />
    </main>
  );
}
