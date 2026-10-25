import { Achievement } from '@/lib/achievements'

interface AchievementBadgeProps {
  achievement: Achievement
  unlocked: boolean
}

export default function AchievementBadge({
  achievement,
  unlocked,
}: AchievementBadgeProps) {
  return (
    <div
      className={`flex flex-col items-center gap-2 rounded-sm border p-4 text-center transition-colors ${
        unlocked ? 'border-gold/30 bg-ink' : 'border-line-strong border-dashed'
      }`}
    >
      <span
        aria-hidden
        className={`font-mono text-2xl ${unlocked ? 'text-gold' : 'text-line-strong'}`}
      >
        {achievement.icon}
      </span>
      <div className="flex flex-col gap-0.5">
        <p
          className={`font-sans text-sm ${unlocked ? 'text-parchment' : 'text-parchment-dim'}`}
        >
          {achievement.title}
        </p>
        <p className="text-parchment-dim font-sans text-xs leading-relaxed">
          {achievement.condition}
        </p>
      </div>
      <span
        className={`font-mono text-xs tracking-widest ${unlocked ? 'text-gold' : 'text-parchment-dim'}`}
      >
        {unlocked ? 'UNLOCKED' : 'LOCKED'}
      </span>
    </div>
  )
}
