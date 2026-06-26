import { InputHTMLAttributes } from 'react'

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string
}

export default function Input({ label, className = '', ...props }: InputProps) {
  return (
    <div className="w-full">
      {label && (
        <label className="text-parchment/50 mb-1.5 block font-mono text-xs tracking-widest uppercase">
          {label}
        </label>
      )}

      <input
        className={`bg-ink border-gold/20 text-parchment font-body placeholder:text-parchment/30 focus:border-gold/60 w-full rounded-sm border px-4 py-3 text-base transition-colors focus:outline-none ${className} `}
        {...props}
      />
    </div>
  )
}
