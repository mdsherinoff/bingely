export default function ProfilePage() {
  return (
    <main className="bg-espresso min-h-screen px-6 py-12">
      {/* User header — avatar, name, stats */}
      <section className="mx-auto mb-12 max-w-4xl" />

      {/* Saved plans grid */}
      <section className="mx-auto mb-12 max-w-4xl">
        <h2 className="font-display text-parchment mb-6 text-3xl">
          Your Plans
        </h2>
        <div className="grid gap-6 md:grid-cols-2" />
      </section>

      {/* Achievements */}
      <section className="mx-auto max-w-4xl">
        <h2 className="font-display text-parchment mb-6 text-3xl">
          Achievements
        </h2>
        <div className="grid grid-cols-3 gap-4 sm:grid-cols-4" />
      </section>
    </main>
  )
}
