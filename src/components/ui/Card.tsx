interface CardProps {
  children: React.ReactNode
  className?: string
  onClick?: () => void
}

export default function Card({ children, className = '', onClick }: CardProps) {
  return (
    <div
      onClick={onClick}
      className={`bg-cinema-surface border-cinema-border rounded-sm border p-5 ${onClick ? 'hover:border-cinema-silver cursor-pointer transition-colors' : ''} ${className} `}
    >
      {children}
    </div>
  )
}
