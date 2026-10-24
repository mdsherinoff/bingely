'use client'

import Link from 'next/link'
import { Button } from '@/components/ui'

interface PlanUnavailableProps {
  // Where to go to build the plan from scratch
  retryHref: string
  onBack: () => void
}

// Shown when a results link can't be turned into a plan — almost always
// because the link was cut short when it was copied or forwarded
export default function PlanUnavailable({
  retryHref,
  onBack,
}: PlanUnavailableProps) {
  return (
    <main
      id="main-content"
      className="bg-espresso flex min-h-screen flex-col items-center justify-center gap-5 px-6 text-center"
    >
      <span aria-hidden className="text-gold/60 font-mono text-3xl">
        ◎
      </span>
      <h1 className="font-display text-parchment text-3xl">
        We couldn&apos;t open this plan
      </h1>
      <p className="text-parchment-dim max-w-md font-sans">
        The link may have been cut off when it was copied or forwarded. Ask
        for the link again, or set up the plan yourself — it only takes a
        minute.
      </p>
      <div className="flex flex-wrap justify-center gap-3">
        <Link
          href={retryHref}
          className="bg-gold text-espresso inline-flex min-h-[44px] items-center rounded-sm px-5 font-sans text-sm font-semibold transition-colors hover:bg-[#ecb95c]"
        >
          Plan it myself
        </Link>
        <Button variant="secondary" onClick={onBack}>
          Go back
        </Button>
      </div>
    </main>
  )
}
