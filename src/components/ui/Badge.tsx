type BadgeVariant = 'gold' | 'rose' | 'muted'

interface BadgeProps {
  children: React.ReactNode
  variant?: BadgeVariant
}

const styles: Record<BadgeVariant, string> = {
  gold: 'bg-white/10 text-cinema-white border-white/30',
  rose: 'bg-white/5 text-cinema-silver border-white/20',
  muted: 'bg-white/5 text-cinema-muted border-white/10',
}

export default function Badge({ children, variant = 'muted' }: BadgeProps) {
  return (
    <span
      className={`inline-flex items-center rounded-sm border px-2.5 py-0.5 font-mono text-xs tracking-widest ${styles[variant]} `}
    >
      {children}
    </span>
  )
}
