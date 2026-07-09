import { InputHTMLAttributes } from 'react'

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string
}

export default function Input({ label, className = '', ...props }: InputProps) {
  return (
    <div className="w-full">
      {label && (
        <label className="text-parchment-dim mb-1.5 block font-mono text-xs tracking-widest uppercase">
          {label}
        </label>
      )}

      <input
        className={`bg-ink border-line-strong text-parchment placeholder:text-parchment-faint focus:border-gold/60 rounded-sm border px-4 py-3 font-sans text-base transition-colors focus:outline-none ${className} `}
        {...props}
      />
    </div>
  )
}
