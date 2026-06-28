import { ButtonHTMLAttributes } from 'react'

type Variant = 'primary' | 'secondary' | 'ghost'

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant
}

const styles: Record<Variant, string> = {
  primary:
    'bg-cinema-white text-cinema-black font-mono font-semibold hover:bg-cinema-silver transition-colors',
  secondary:
    'border border-cinema-border text-cinema-white font-mono hover:border-cinema-silver transition-colors',
  ghost:
    'text-cinema-silver font-mono hover:text-cinema-white transition-colors',
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
