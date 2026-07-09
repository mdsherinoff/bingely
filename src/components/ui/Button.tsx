import { ButtonHTMLAttributes } from 'react'

type Variant = 'primary' | 'secondary' | 'ghost'

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant
}

const styles: Record<Variant, string> = {
  primary:
    'bg-gold text-espresso font-sans font-semibold hover:bg-[#ecb95c] transition-colors disabled:opacity-40 disabled:cursor-not-allowed',
  secondary:
    'border border-line-strong text-parchment font-sans hover:border-gold/60 transition-colors disabled:opacity-40 disabled:cursor-not-allowed',
  ghost:
    'text-parchment-dim font-sans hover:text-parchment transition-colors',
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
