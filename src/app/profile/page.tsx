export default function ProfilePage() {
  return (
    <main className="min-h-screen bg-espresso px-6 py-12">
      {/* User header — avatar, name, stats */}
      <section className="max-w-4xl mx-auto mb-12" />

      {/* Saved plans grid */}
      <section className="max-w-4xl mx-auto mb-12">
        <h2 className="font-display text-3xl text-parchment mb-6">
          Your Plans
        </h2>
        <div className="grid md:grid-cols-2 gap-6" />
      </section>

      {/* Achievements */}
      <section className="max-w-4xl mx-auto">
        <h2 className="font-display text-3xl text-parchment mb-6">
          Achievements
        </h2>
        <div className="grid grid-cols-3 sm:grid-cols-4 gap-4" />
      </section>
    </main>
  );
}
