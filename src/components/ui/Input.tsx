import { InputHTMLAttributes, useId } from 'react'

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string
  // Classes for the outer wrapper (layout, e.g. flex-1); `className`
  // styles the input itself
  wrapperClassName?: string
}

export default function Input({
  label,
  className = '',
  wrapperClassName = 'w-full',
  id,
  ...props
}: InputProps) {
  const generatedId = useId()
  const inputId = id ?? generatedId

  return (
    <div className={wrapperClassName}>
      {label && (
        <label
          htmlFor={inputId}
          className="text-parchment-dim mb-1.5 block font-mono text-xs tracking-widest uppercase"
        >
          {label}
        </label>
      )}

      <input
        id={inputId}
        className={`bg-ink border-line-strong text-parchment placeholder:text-parchment-faint focus:border-gold/60 w-full rounded-sm border px-4 py-3 font-sans text-base transition-colors focus:outline-none ${className}`}
        {...props}
      />
    </div>
  )
}
