import { forwardRef } from 'react'
import { Icon } from '../../data/icons'

/* Shared primitives. Control heights: xs 24 · sm 28 · md 32 · lg 40 (hero only). */

type Variant = 'ink' | 'ghost' | 'outline' | 'lime'
type Size = 'xs' | 'sm' | 'md'

const VARIANTS: Record<Variant, string> = {
  ink: 'bg-ink text-paper hover:bg-ink-2',
  ghost: 'bg-paper text-ink hover:bg-paper-2',
  outline: 'border border-line bg-white text-ink hover:border-black/25',
  lime: 'bg-lime text-ink hover:brightness-95',
}
const SIZES: Record<Size, string> = {
  xs: 'h-6 gap-1 px-2 text-[11px]',
  sm: 'h-7 gap-1.5 px-2.5 text-xs',
  md: 'h-8 gap-1.5 px-3 text-ui',
}

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant
  size?: Size
  icon?: string
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(function Button(
  { variant = 'outline', size = 'sm', icon, className = '', children, ...rest },
  ref,
) {
  return (
    <button
      ref={ref}
      {...rest}
      className={`inline-flex shrink-0 items-center justify-center rounded-md font-medium transition-colors disabled:pointer-events-none disabled:opacity-40 ${VARIANTS[variant]} ${SIZES[size]} ${className}`}
    >
      {icon && <Icon name={icon} className={size === 'xs' ? 'h-3 w-3' : 'h-3.5 w-3.5'} />}
      {children}
    </button>
  )
})

/** Thin range input: 2px track, square 12px thumb. Styled in index.css (.range). */
export function Range({
  value,
  min,
  max,
  step,
  onChange,
  label,
  format = (v) => String(v),
  className = '',
}: {
  value: number
  min: number
  max: number
  step: number
  onChange: (v: number) => void
  label: string
  format?: (v: number) => string
  className?: string
}) {
  const pct = ((value - min) / (max - min)) * 100
  return (
    <label className={`flex items-center gap-2.5 ${className}`}>
      <span className="text-xs text-muted">{label}</span>
      <input
        type="range"
        className="range flex-1"
        min={min}
        max={max}
        step={step}
        value={value}
        aria-label={label}
        aria-valuetext={format(value)}
        onChange={(e) => onChange(Number(e.target.value))}
        style={{ '--pct': `${pct}%` } as React.CSSProperties}
      />
      <span className="w-9 text-right font-mono text-[11px] tabular-nums text-ink">{format(value)}</span>
    </label>
  )
}

export function Switch({ checked, onChange, label }: { checked: boolean; onChange: (v: boolean) => void; label: string }) {
  return (
    <button
      role="switch"
      aria-checked={checked}
      onClick={() => onChange(!checked)}
      className="group inline-flex h-7 items-center gap-2 rounded-md px-1.5 text-xs text-ink-2 hover:bg-paper"
    >
      <span className={`relative h-4 w-7 rounded-sm transition-colors ${checked ? 'bg-ink' : 'bg-line'}`}>
        <span
          className={`absolute top-0.5 h-3 w-3 rounded-[3px] bg-white shadow-[0_1px_1px_rgba(0,0,0,0.15)] transition-transform duration-200 ${checked ? 'translate-x-3.5' : 'translate-x-0.5'}`}
        />
      </span>
      {label}
    </button>
  )
}

/** Small segmented control — replaces two-option selects. */
export function Segmented<T extends string>({
  options,
  value,
  onChange,
  label,
}: {
  options: { value: T; label?: string; icon?: string; title?: string }[]
  value: T
  onChange: (v: T) => void
  label: string
}) {
  return (
    <div role="radiogroup" aria-label={label} className="inline-flex h-7 items-center gap-px rounded-md border border-line p-0.5">
      {options.map((o) => (
        <button
          key={o.value}
          role="radio"
          aria-checked={value === o.value}
          aria-label={o.title ?? o.label}
          title={o.title}
          onClick={() => onChange(o.value)}
          className={`inline-flex h-full items-center gap-1 rounded-sm px-2 text-xs transition-colors ${
            value === o.value ? 'bg-ink text-paper' : 'text-muted hover:text-ink'
          }`}
        >
          {o.icon && <Icon name={o.icon} className="h-3.5 w-3.5" />}
          {o.label}
        </button>
      ))}
    </div>
  )
}

export function SearchField({
  value,
  onChange,
  placeholder,
  size = 'md',
  className = '',
  autoFocus,
}: {
  value: string
  onChange: (v: string) => void
  placeholder: string
  size?: 'md' | 'lg'
  className?: string
  autoFocus?: boolean
}) {
  return (
    <div
      className={`flex items-center gap-2 rounded-md border border-line bg-white transition-colors focus-within:border-ink ${
        size === 'lg' ? 'h-10 px-3 shadow-[0_1px_2px_rgba(0,0,0,0.05)]' : 'h-8 px-2.5'
      } ${className}`}
    >
      <Icon name="search" className="h-3.5 w-3.5 text-muted" />
      <input
        value={value}
        autoFocus={autoFocus}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        aria-label={placeholder}
        className="min-w-0 flex-1 bg-transparent text-ui outline-none placeholder:text-muted"
      />
      {value && (
        <button onClick={() => onChange('')} className="grid h-5 w-5 place-items-center rounded-sm text-muted hover:bg-paper hover:text-ink" aria-label="Clear search">
          <Icon name="close" className="h-3 w-3" />
        </button>
      )}
    </div>
  )
}
export { Tooltip } from './Tooltip'
