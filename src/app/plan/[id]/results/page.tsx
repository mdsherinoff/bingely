export default function ResultsPage() {
  return (
    <main className="min-h-screen bg-espresso px-6 py-12">
      {/* Summary cards row — completion date, total runtime, episodes/week */}
      <section className="max-w-5xl mx-auto grid grid-cols-3 gap-6 mb-12" />

      {/* Timeline — vertical, milestone-based */}
      <section className="max-w-5xl mx-auto grid md:grid-cols-3 gap-10">
        {/* Left — week-by-week breakdown */}
        <div className="md:col-span-2" />
        {/* Right — milestones + export */}
        <div />
      </section>
    </main>
  );
}
