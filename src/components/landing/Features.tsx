import Link from 'next/link'

const features = [
  {
    icon: '◎',
    title: 'Smart Scheduling',
    body: 'Enter your free time and get a realistic episode plan — no guesswork.',
  },
  {
    icon: '◈',
    title: 'Completion Estimates',
    body: "Know exactly when you'll finish, down to the week.",
  },
  {
    icon: '◉',
    title: 'Milestone Tracking',
    body: 'Break long series into arcs and celebrate progress along the way.',
  },
]

export default function Features() {
  return (
    <section className="bg-ink border-gold/10 border-t border-b px-6 py-24">
      <div className="mx-auto grid max-w-5xl gap-12 md:grid-cols-3">
        {features.map((f) => (
          <div key={f.title} className="flex flex-col gap-4">
            <span className="text-gold font-mono text-2xl">{f.icon}</span>
            <h3 className="font-display text-parchment text-2xl">{f.title}</h3>
            <p className="text-parchment/50 font-mono text-base leading-relaxed">
              {f.body}
            </p>
          </div>
        ))}
      </div>
      <div className="mx-auto mt-12 flex max-w-5xl items-center justify-center gap-8">
        <Link
          href="/challenges"
          className="text-gold/50 hover:text-gold font-mono text-xs tracking-widest transition-colors"
        >
          EXPLORE FILM CHALLENGES →
        </Link>
        <span className="text-parchment/20 font-mono text-xs">·</span>
        <Link
          href="/list/new"
          className="text-gold/50 hover:text-gold font-mono text-xs tracking-widest transition-colors"
        >
          BUILD CUSTOM LIST →
        </Link>
      </div>
    </section>
  )
}
