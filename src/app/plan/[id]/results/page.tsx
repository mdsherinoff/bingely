export default function ResultsPage() {
  return (
    <main className="bg-espresso min-h-screen px-6 py-12">
      {/* Summary cards row — completion date, total runtime, episodes/week */}
      <section className="mx-auto mb-12 grid max-w-5xl grid-cols-3 gap-6" />

      {/* Timeline — vertical, milestone-based */}
      <section className="mx-auto grid max-w-5xl gap-10 md:grid-cols-3">
        {/* Left — week-by-week breakdown */}
        <div className="md:col-span-2" />
        {/* Right — milestones + export */}
        <div />
      </section>
    </main>
  )
}
