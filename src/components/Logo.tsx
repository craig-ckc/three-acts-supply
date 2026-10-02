export function Mark({ className = 'h-6 w-6' }: { className?: string }) {
  return (
    <svg viewBox="0 0 32 32" className={className} aria-hidden>
      <path d="M16 4v24M5.6 10l20.8 12M5.6 22l20.8-12" stroke="currentColor" strokeWidth="3.2" strokeLinecap="round" fill="none" />
    </svg>
  )
}
