export default function Footer() {
  return (
    <footer className="border-gold/10 border-t px-6 py-10">
      <div className="mx-auto flex max-w-5xl flex-col items-center justify-between gap-4 md:flex-row">
        <p className="font-display text-parchment/40 text-2xl tracking-tight">
          Bingely
        </p>
        <p className="text-parchment/20 font-mono text-xs tracking-widest">
          BUILT FOR FILM LOVERS · {new Date().getFullYear()}
        </p>
      </div>
    </footer>
  )
}
