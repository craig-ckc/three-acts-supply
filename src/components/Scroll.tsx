import { ScrollArea } from '@base-ui/react/scroll-area'

interface Props {
  children: React.ReactNode
  className?: string
  viewportClassName?: string
  /** Light thumb for dark surfaces (the floating panel). */
  tone?: 'light' | 'dark'
  viewportRef?: React.Ref<HTMLDivElement>
}

/** App-wide scroll container: Base UI ScrollArea with a thin, branded overlay thumb. */
export function Scroll({ children, className = '', viewportClassName = '', tone = 'light', viewportRef }: Props) {
  const thumb = tone === 'dark' ? 'bg-white/20 hover:bg-white/35' : 'bg-black/20 hover:bg-black/35'
  return (
    <ScrollArea.Root className={`relative min-h-0 overflow-hidden ${className}`}>
      <ScrollArea.Viewport ref={viewportRef} className={`h-full overscroll-contain outline-none ${viewportClassName}`}>
        {children}
      </ScrollArea.Viewport>
      <ScrollArea.Scrollbar
        orientation="vertical"
        className="z-20 m-0.5 flex w-1.5 justify-center rounded-full opacity-0 transition-opacity duration-200 data-[hovering]:opacity-100 data-[scrolling]:opacity-100 data-[scrolling]:duration-0"
      >
        <ScrollArea.Thumb className={`w-full rounded-full transition-colors ${thumb}`} />
      </ScrollArea.Scrollbar>
    </ScrollArea.Root>
  )
}
