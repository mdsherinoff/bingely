// Mirrors the planner layout so the page doesn't jump when the title's
// details arrive
function Block({ className = '' }: { className?: string }) {
  return <div className={`bg-ink animate-pulse rounded-sm ${className}`} />
}

export default function PlannerSkeleton() {
  return (
    <main
      id="main-content"
      aria-busy="true"
      aria-label="Loading planner"
      className="bg-espresso min-h-screen px-6 py-12"
    >
      <div className="mx-auto flex max-w-4xl flex-col gap-12">
        <div className="flex items-start gap-4">
          <Block className="aspect-[2/3] w-16 flex-shrink-0 sm:w-24" />
          <div className="flex flex-1 flex-col gap-3">
            <Block className="h-9 w-2/3" />
            <Block className="h-4 w-16" />
            <Block className="h-6 w-40" />
            <Block className="h-4 w-48" />
          </div>
        </div>
        <div className="grid gap-10 md:grid-cols-2">
          <div className="flex flex-col gap-4">
            <Block className="h-7 w-48" />
            <Block className="h-11 w-full" />
            <Block className="h-24 w-full" />
          </div>
          <div className="flex flex-col gap-4">
            <Block className="h-7 w-40" />
            <div className="grid grid-cols-2 gap-3">
              <Block className="h-24" />
              <Block className="h-24" />
              <Block className="h-24" />
              <Block className="h-24" />
            </div>
            <Block className="h-24 w-full" />
          </div>
        </div>
      </div>
    </main>
  )
}
