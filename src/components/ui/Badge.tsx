type BadgeVariant = 'gold' | 'rose' | 'muted'

interface BadgeProps {
  children: React.ReactNode
  variant?: BadgeVariant
}

const styles: Record<BadgeVariant, string> = {
  gold: 'bg-gold/10 text-gold border-gold/30',
  rose: 'bg-rose/10 text-rose border-rose/30',
  muted: 'bg-parchment/5 text-parchment/50 border-parchment/10',
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
