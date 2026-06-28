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
        className={`bg-cinema-dark border-cinema-border text-cinema-white placeholder:text-cinema-muted focus:border-cinema-silver rounded-sm border px-4 py-3 font-mono text-base transition-colors focus:outline-none ${className} `}
        {...props}
      />
    </div>
  )
}
