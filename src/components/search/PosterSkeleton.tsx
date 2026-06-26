export default function PosterSkeleton() {
  return (
    <div className="flex animate-pulse flex-col gap-3">
      <div className="bg-ink relative aspect-[2/3] overflow-hidden rounded-sm">
        <div className="via-parchment/5 animate-shimmer absolute inset-0 bg-gradient-to-r from-transparent to-transparent" />
      </div>
      <div className="bg-ink h-4 w-3/4 rounded-sm" />
      <div className="bg-ink h-3 w-1/2 rounded-sm" />
    </div>
  )
}
