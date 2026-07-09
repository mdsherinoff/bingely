interface CardProps {
  children: React.ReactNode
  className?: string
  onClick?: () => void
}

export default function Card({ children, className = '', onClick }: CardProps) {
  return (
    <div
      onClick={onClick}
      className={`bg-ink border-line rounded-sm border p-5 ${onClick ? 'hover:border-gold/50 hover:bg-raised cursor-pointer transition-colors' : ''} ${className} `}
    >
      {children}
    </div>
  )
}
