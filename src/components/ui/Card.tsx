interface CardProps {
  children: React.ReactNode
  className?: string
  onClick?: () => void
}

export default function Card({ children, className = '', onClick }: CardProps) {
  return (
    <div
      onClick={onClick}
      className={`bg-ink border-gold/10 rounded-sm border p-5 ${onClick ? 'hover:border-gold/30 cursor-pointer transition-colors' : ''} ${className} `}
    >
      {children}
    </div>
  )
}
