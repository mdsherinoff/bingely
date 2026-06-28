import { SelectHTMLAttributes } from 'react'

interface SelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
  label?: string
  options: { value: string; label: string }[]
}

export default function Select({
  label,
  options,
  className = '',
  ...props
}: SelectProps) {
  return (
    <div className="flex flex-col gap-1.5">
      {label && (
        <label className="text-parchment/50 font-mono text-xs tracking-widest uppercase">
          {label}
        </label>
      )}
      <select
        className={`bg-ink border-gold/20 text-parchment focus:border-gold/60 cursor-pointer appearance-none rounded-sm border px-4 py-3 font-mono text-base transition-colors focus:outline-none ${className} `}
        {...props}
      >
        {options.map((opt) => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>
    </div>
  )
}
