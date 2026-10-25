'use client'

import { Season } from '@/types/media'
import { TrackedPlan, planStatus } from '@/hooks/useTrackedPlans'
import { episodeLabel } from '@/lib/episodes'
import { Button } from '@/components/ui'

interface ProgressPanelProps {
  tracked: TrackedPlan | undefined
  // Whether the followed plan is the one on screen (someone may follow
  // a different plan for the same show, e.g. before opening a friend's)
  isThisPlan: boolean
  seasons?: Season[]
  onFollow: () => void
  onUnfollow: () => void
  onSetWatched: (through: number) => void
  onReplan: () => void
}

const statusCopy = (tracked: TrackedPlan) => {
  const s = planStatus(tracked)
  switch (s.kind) {
    case 'done':
      return { text: 'Finished — nice work', tone: 'text-gold border-gold/50 bg-gold/10' }
    case 'not-started':
      return { text: 'Not started yet', tone: 'text-parchment-dim border-line-strong' }
    case 'on-track':
      return { text: 'On track', tone: 'text-gold border-gold/50 bg-gold/10' }
    case 'ahead':
      return {
        text: `${s.by} episode${s.by === 1 ? '' : 's'} ahead`,
        tone: 'text-gold border-gold/50 bg-gold/10',
      }
    case 'behind':
      return {
        text: `${s.by} episode${s.by === 1 ? '' : 's'} behind`,
        tone: 'text-rose border-rose/50 bg-rose/10',
      }
  }
}

export default function ProgressPanel({
  tracked,
  isThisPlan,
  seasons,
  onFollow,
  onUnfollow,
  onSetWatched,
  onReplan,
}: ProgressPanelProps) {
  if (!tracked || !isThisPlan) {
    return (
      <div className="border-line bg-ink flex flex-wrap items-center justify-between gap-4 rounded-sm border p-5">
        <div className="flex max-w-md flex-col gap-1">
          <p className="text-parchment font-sans text-base font-medium">
            {tracked ? 'You’re following a different plan for this show' : 'Watching this?'}
          </p>
          <p className="text-parchment-dim font-sans text-sm">
            {tracked
              ? 'Switch to this one to track it instead. Your progress so far comes with you.'
              : 'Follow the plan to tick off episodes as you go. We’ll tell you if you fall behind and re-plan the rest in one tap.'}
          </p>
        </div>
        <Button onClick={onFollow}>
          {tracked ? 'Follow this plan instead' : 'Follow this plan'}
        </Button>
      </div>
    )
  }

  const status = statusCopy(tracked)
  const watched = tracked.watchedThrough
  const pct = Math.round((watched / tracked.totalEpisodes) * 100)
  const kind = planStatus(tracked).kind
  const canReplan =
    (kind === 'behind' || kind === 'ahead') && watched < tracked.totalEpisodes
  const set = (n: number) =>
    onSetWatched(Math.min(tracked.totalEpisodes, Math.max(0, n)))

  return (
    <div className="border-gold/30 bg-ink flex flex-col gap-4 rounded-sm border p-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <p className="text-parchment-dim font-mono text-xs tracking-widest">
          YOUR PROGRESS
        </p>
        <span
          aria-live="polite"
          className={`rounded-full border px-3 py-1 font-sans text-xs ${status.tone}`}
        >
          {status.text}
        </span>
      </div>

      <div className="flex flex-col gap-2">
        <div
          role="progressbar"
          aria-valuemin={0}
          aria-valuemax={tracked.totalEpisodes}
          aria-valuenow={watched}
          aria-label={`${watched} of ${tracked.totalEpisodes} episodes watched`}
          className="bg-espresso border-line h-2 overflow-hidden rounded-full border"
        >
          <div className="bg-gold h-full transition-all" style={{ width: `${pct}%` }} />
        </div>
        <p className="text-parchment-faint font-mono text-xs tabular-nums">
          {watched} of {tracked.totalEpisodes} episodes · {pct}%
        </p>
      </div>

      <div className="flex flex-wrap items-center gap-3">
        <span className="text-parchment font-sans text-sm">Watched through</span>
        <div className="flex items-center">
          <button
            type="button"
            onClick={() => set(watched - 1)}
            disabled={watched <= 0}
            aria-label="One episode back"
            className="border-line-strong text-parchment hover:border-gold/60 h-10 w-10 rounded-l-sm border font-mono transition-colors disabled:opacity-30"
          >
            −
          </button>
          <span className="border-line-strong text-gold flex h-10 min-w-[7rem] items-center justify-center border-y px-3 font-mono text-sm tabular-nums">
            {watched === 0 ? 'Nothing yet' : episodeLabel(watched, seasons)}
          </span>
          <button
            type="button"
            onClick={() => set(watched + 1)}
            disabled={watched >= tracked.totalEpisodes}
            aria-label="One more episode watched"
            className="border-line-strong text-parchment hover:border-gold/60 h-10 w-10 rounded-r-sm border font-mono transition-colors disabled:opacity-30"
          >
            +
          </button>
        </div>
        <span className="text-parchment-faint font-sans text-xs">
          or tick weeks off below
        </span>
      </div>

      {canReplan && (
        <div className="border-line flex flex-wrap items-center justify-between gap-3 border-t pt-4">
          <p className="text-parchment-dim max-w-sm font-sans text-sm">
            {kind === 'behind'
              ? 'Life happens. Rebuild the rest of the plan from where you are, starting today.'
              : 'Ahead of schedule — rebuild the plan from here to see your new finish date.'}
          </p>
          <Button onClick={onReplan}>
            Re-plan from {episodeLabel(watched + 1, seasons)}
          </Button>
        </div>
      )}

      <button
        type="button"
        onClick={onUnfollow}
        className="text-parchment-faint hover:text-rose w-fit font-sans text-xs transition-colors"
      >
        Stop following
      </button>
    </div>
  )
}
