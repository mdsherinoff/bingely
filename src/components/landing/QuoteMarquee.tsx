const quotes = [
  '"I Love You 3000." — Avengers Endgame',
  '"May the Force be with you." — Star Wars',
  '"All those moments will be lost in time, like tears in rain." — Blade Runner',
  '"You can\'t handle the truth!" — A Few Good Men',
  '"To infinity and beyond." — Toy Story',
  '"Why so serious?" — The Dark Knight',
  '"I\'ll be back." — The Terminator',
  '"Elementary, my dear Watson." — Sherlock Holmes',
]

export default function QuoteMarquee() {
  const repeated = [...quotes, ...quotes]

  return (
    <div className="bg-ink border-gold/20 relative flex h-10 items-center overflow-hidden border-b">
      <div className="animate-marquee flex gap-12 whitespace-nowrap">
        {repeated.map((quote, i) => (
          <span
            key={i}
            className="text-gold/50 flex-shrink-0 font-mono text-xs tracking-widest"
          >
            {quote}
          </span>
        ))}
      </div>
    </div>
  )
}
