import Link from 'next/link'

export default function Footer() {
  return (
    <footer className="border-gold/10 border-t px-6 py-10">
      <div className="mx-auto flex max-w-5xl flex-col items-center justify-between gap-4 md:flex-row">
        <p className="font-display text-parchment/40 text-2xl tracking-tight">
          Bingely
        </p>
        <div className="flex items-center gap-6">
          <Link
            href="/challenges"
            className="text-parchment/20 hover:text-parchment/40 font-mono text-xs tracking-widest transition-colors"
          >
            CHALLENGES
          </Link>
          <Link
            href="/list/new"
            className="text-parchment/20 hover:text-parchment/40 font-mono text-xs tracking-widest transition-colors"
          >
            CUSTOM LIST
          </Link>
          <Link
            href="/achievements"
            className="text-parchment/20 hover:text-parchment/40 font-mono text-xs tracking-widest transition-colors"
          >
            ACHIEVEMENTS
          </Link>
        </div>
        <p className="text-parchment/20 font-mono text-xs tracking-widest">
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
