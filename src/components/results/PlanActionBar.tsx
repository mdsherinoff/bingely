import Link from 'next/link'
import ShareButton from './ShareButton'

interface PlanActionBarProps {
  editHref: string
  title: string
}

// The two things people want the moment a plan appears — tweak it or
// send it — kept at the top rather than at the end of a long page
export default function PlanActionBar({ editHref, title }: PlanActionBarProps) {
  return (
    <div className="flex flex-wrap items-center gap-3">
      <Link
        href={editHref}
        className="border-line-strong text-parchment hover:border-gold/60 inline-flex min-h-[44px] items-center gap-2 rounded-sm border px-5 font-sans text-sm transition-colors"
      >
        <span aria-hidden>✎</span> Edit this plan
      </Link>
      <ShareButton title={title} className="px-5" />
    </div>
  )
}
