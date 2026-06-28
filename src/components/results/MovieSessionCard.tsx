import { MovieSession } from '@/lib/scheduler'

interface MovieSessionCardProps {
  session: MovieSession
  totalRuntime: number
}

function formatTime(time: string): string {
  const [h, m] = time.split(':').map(Number)
  const period = h >= 12 ? 'PM' : 'AM'
  const hour = h % 12 || 12
  return `${hour}${m > 0 ? `:${String(m).padStart(2, '0')}` : ''} ${period}`
}

export default function MovieSessionCard({
  session,
  totalRuntime,
}: MovieSessionCardProps) {
  const percent = Math.round((session.minuteEnd / totalRuntime) * 100)

  return (
    <div
      className={`flex flex-col gap-3 rounded-sm border p-4 transition-colors ${session.isComplete ? 'border-gold/30 bg-ink' : 'border-gold/10'} `}
    >
      <div className="flex items-start justify-between">
        <div className="flex flex-col gap-0.5">
          <p className="text-parchment/30 font-mono text-xs tracking-widest">
            SESSION {session.sessionNumber}
          </p>
          <p className="text-parchment font-mono text-base">
            {session.date.toLocaleDateString('en-US', {
              weekday: 'long',
              month: 'short',
              day: 'numeric',
            })}
          </p>
          <p className="text-parchment/40 font-mono text-xs">
            {formatTime(session.start)} — {formatTime(session.end)}
          </p>
        </div>
        <div className="flex flex-col gap-0.5 text-right">
          <p className="text-gold font-mono text-xs">
            {session.durationMins} min
          </p>
          <p className="text-parchment/30 font-mono text-xs">
            mins {session.minuteStart}–{session.minuteEnd}
          </p>
        </div>
      </div>

      {/* Progress bar */}
      <div className="flex flex-col gap-1">
        <div className="bg-espresso h-1 overflow-hidden rounded-full">
          <div
            className="bg-gold h-full rounded-full transition-all duration-500"
            style={{ width: `${percent}%` }}
          />
        </div>
        <p className="text-parchment/20 text-right font-mono text-xs">
          {percent}% complete after this session
        </p>
      </div>

      {session.isComplete && (
        <p className="text-gold/60 font-mono text-xs tracking-widest">
          ✓ FILM COMPLETE
        </p>
      )}
    </div>
  )
}
