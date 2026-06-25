interface ProgressBarProps {
  percent: number
  showLabel?: boolean
}

export default function ProgressBar({
  percent,
  showLabel = true,
}: ProgressBarProps) {
  return (
    <div className="flex flex-col gap-1.5">
      {showLabel && (
        <div className="flex justify-between">
          <span className="text-parchment/30 font-mono text-xs tracking-widest">
            PROGRESS
          </span>
          <span className="text-gold font-mono text-xs">{percent}%</span>
        </div>
      )}
      <div className="bg-ink border-gold/10 h-1 overflow-hidden rounded-full border">
        <div
          className="bg-gold h-full rounded-full transition-all duration-500"
          style={{ width: `${percent}%` }}
        />
      </div>
    </div>
  )
}
