export default function PosterSkeleton() {
  return (
    <div className="flex animate-pulse flex-col gap-3">
      <div className="bg-ink border-gold/5 aspect-[2/3] rounded-sm border" />
      <div className="bg-ink h-4 w-3/4 rounded-sm" />
      <div className="bg-ink h-3 w-1/2 rounded-sm" />
    </div>
  )
}
