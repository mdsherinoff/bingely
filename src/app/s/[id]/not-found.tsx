import Link from 'next/link'

export default function ShortLinkNotFound() {
  return (
    <main
      id="main-content"
      className="bg-espresso flex min-h-screen flex-col items-center justify-center gap-5 px-6 text-center"
    >
      <span aria-hidden className="text-gold/60 font-mono text-3xl">
        ◎
      </span>
      <h1 className="font-display text-parchment text-3xl">
        This plan link doesn&apos;t work
      </h1>
      <p className="text-parchment-dim max-w-md font-sans">
        It may have been mistyped or cut off. Ask for the link again, or plan
        something yourself — it only takes a minute.
      </p>
      <Link
        href="/"
        className="bg-gold text-espresso inline-flex min-h-[44px] items-center rounded-sm px-5 font-sans text-sm font-semibold"
      >
        Start planning
      </Link>
    </main>
  )
}
