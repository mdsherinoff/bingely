import Link from 'next/link'

export default function Footer() {
  return (
    <footer className="border-line border-t px-6 py-10">
      <div className="mx-auto flex max-w-5xl flex-col items-center justify-between gap-4 md:flex-row">
        <p className="font-display text-parchment-dim text-2xl tracking-tight">
          Bingely
        </p>
        <div className="flex items-center gap-6">
          <Link
            href="/challenges"
            className="text-parchment-faint hover:text-parchment-dim font-mono text-xs tracking-widest transition-colors"
          >
            CHALLENGES
          </Link>
          <Link
            href="/lists"
            className="text-parchment-faint hover:text-parchment-dim font-mono text-xs tracking-widest transition-colors"
          >
            MY LISTS
          </Link>
          <Link
            href="/achievements"
            className="text-parchment-faint hover:text-parchment-dim font-mono text-xs tracking-widest transition-colors"
          >
            ACHIEVEMENTS
          </Link>
        </div>
        <p className="text-parchment-faint font-mono text-xs tracking-widest">
          BUILT FOR FILM LOVERS · {new Date().getFullYear()}
        </p>
        <Link
          href="/room237"
          className="text-espresso hover:text-gold/10 transition-colors duration-700 select-none"
          title=""
        >
          LUMOS
        </Link>
      </div>
    </footer>
  )
}
