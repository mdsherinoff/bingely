import { InputHTMLAttributes } from 'react'

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string
}

export default function Input({ label, className = '', ...props }: InputProps) {
  return (
    <div className="flex flex-col gap-1.5">
      {label && (
        <label className="text-parchment/50 font-mono text-xs tracking-widest uppercase">
          {label}
        </label>
      )}
      <input
        className={`bg-ink border-gold/20 text-parchment font-body placeholder:text-parchment/30 focus:border-gold/60 rounded-sm border px-4 py-3 text-base transition-colors focus:outline-none ${className} `}
        {...props}
      />
    </div>
  )
}
