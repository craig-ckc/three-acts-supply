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
      type="button"
      role="switch"
      aria-checked={checked}
      onClick={() => onChange(!checked)}
      // No hover fill: the track itself reacts, so the switch reads as one object next to the bordered groups.
      className={`group inline-flex h-7 select-none items-center gap-2 rounded-md px-1 text-xs transition-colors ${
        checked ? 'text-ink' : 'text-ink-2 hover:text-ink'
      }`}
    >
      {/* 26×16 track, 2px inset, 12px knob: radii nest (4 outer → 2 inner) and travel is exactly 10px. */}
      <span
        aria-hidden
        className={`flex h-4 w-[26px] shrink-0 items-center rounded-sm p-0.5 transition-colors duration-200 ease-[cubic-bezier(.22,1,.36,1)] ${
          checked ? 'bg-ink' : 'bg-black/[0.12] shadow-[inset_0_0_0_1px_rgba(0,0,0,0.05)] group-hover:bg-black/[0.18]'
        }`}
      >
        <span
          className={`h-3 w-3 rounded-[2px] transition-[translate,background-color,box-shadow] duration-200 ease-[cubic-bezier(.22,1,.36,1)] ${
            checked ? 'translate-x-2.5 bg-lime' : 'translate-x-0 bg-white shadow-[0_1px_1.5px_rgba(0,0,0,0.2)]'
          }`}
        />
      </span>
      <span className="leading-none">{label}</span>
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
    // 6px outer − 1px border − 2px inset → 3px segments, so the radii stay concentric.
    <div role="radiogroup" aria-label={label} className="inline-flex h-7 items-center gap-px rounded-md border border-line p-0.5">
      {options.map((o) => (
        <button
          key={o.value}
          type="button"
          role="radio"
          aria-checked={value === o.value}
          aria-label={o.title ?? o.label}
          title={o.title}
          onClick={() => onChange(o.value)}
          className={`inline-flex h-full items-center gap-1 rounded-[3px] px-2 text-xs transition-colors ${
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
      className={`flex items-center gap-2 rounded-md border border-line bg-white transition-colors hover:border-black/20 focus-within:border-ink ${
        size === 'lg' ? 'h-10 px-3 shadow-[0_1px_2px_rgba(0,0,0,0.05)]' : 'h-7 px-2'
      } ${className}`}
    >
      <Icon name="search" className={`shrink-0 text-muted ${size === 'lg' ? 'h-4 w-4' : 'h-3.5 w-3.5'}`} />
      <input
        value={value}
        autoFocus={autoFocus}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        aria-label={placeholder}
        className={`min-w-0 flex-1 bg-transparent outline-none placeholder:text-muted ${size === 'lg' ? 'text-[14px]' : 'text-xs'}`}
      />
      {value && (
        <button onClick={() => onChange('')} className="-mr-1 grid h-5 w-5 shrink-0 place-items-center rounded-sm text-muted transition-colors hover:bg-paper hover:text-ink" aria-label="Clear search">
          <Icon name="close" className="h-3 w-3" />
        </button>
      )}
    </div>
  )
}
export { Tooltip } from './Tooltip'
