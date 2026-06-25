import { Suggestion } from '@/lib/suggestions'

interface SuggestionCardProps {
  suggestion: Suggestion
}

const levelStyles: Record<Suggestion['level'], string> = {
  tip: 'border-gold/20 bg-ink',
  warning: 'border-rose/30 bg-rose/5',
  success: 'border-gold/30 bg-ink',
}

const icons: Record<Suggestion['level'], string> = {
  tip: '◎',
  warning: '△',
  success: '✓',
}

const iconColors: Record<Suggestion['level'], string> = {
  tip: 'text-gold/50',
  warning: 'text-rose/70',
  success: 'text-gold',
}

export default function SuggestionCard({ suggestion }: SuggestionCardProps) {
  return (
    <div
      className={`flex gap-3 rounded-sm border p-4 ${levelStyles[suggestion.level]} `}
    >
      <span
        className={`mt-0.5 flex-shrink-0 font-mono text-sm ${iconColors[suggestion.level]} `}
      >
        {icons[suggestion.level]}
      </span>
      <div className="flex flex-col gap-1">
        <p
          className={`font-body text-sm font-semibold ${suggestion.level === 'warning' ? 'text-rose' : 'text-parchment'} `}
        >
          {suggestion.title}
        </p>
        <p className="font-body text-parchment/50 text-sm leading-relaxed">
          {suggestion.body}
        </p>
      </div>
    </div>
  )
}
