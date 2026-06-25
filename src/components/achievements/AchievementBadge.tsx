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
        unlocked ? 'border-gold/30 bg-ink' : 'border-gold/10 opacity-40'
      } `}
    >
      <span
        className={`font-mono text-2xl ${unlocked ? 'text-gold' : 'text-parchment/20'} `}
      >
        {achievement.icon}
      </span>
      <div className="flex flex-col gap-0.5">
        <p
          className={`font-body text-sm ${unlocked ? 'text-parchment' : 'text-parchment/30'} `}
        >
          {achievement.title}
        </p>
        <p className="text-parchment/20 font-mono text-xs leading-relaxed">
          {achievement.condition}
        </p>
      </div>
      {unlocked && (
        <span className="text-gold/60 font-mono text-xs tracking-widest">
          UNLOCKED
        </span>
      )}
    </div>
  )
}
