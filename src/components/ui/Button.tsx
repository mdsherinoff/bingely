import { ButtonHTMLAttributes } from 'react'

type Variant = 'primary' | 'secondary' | 'ghost'

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant
}

const styles: Record<Variant, string> = {
  primary:
    'bg-gold text-espresso font-body font-semibold hover:bg-gold-muted transition-colors',
  secondary:
    'border border-gold/40 text-parchment font-body hover:border-gold/80 transition-colors',
  ghost: 'text-parchment/60 font-body hover:text-parchment transition-colors',
}

export default function Button({
  variant = 'primary',
  className = '',
  children,
  ...props
}: ButtonProps) {
  return (
    <button
      className={`min-h-[44px] rounded-sm px-5 py-2.5 text-sm tracking-wide ${styles[variant]} ${className}`}
      {...props}
    >
      {children}
    </button>
  )
}
