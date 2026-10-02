import { toaster } from 'baseui/toast'

/** Branded, single-line toast. Base Web supplies queueing; we supply the look. */
export function notify(message: React.ReactNode, tone: 'default' | 'error' = 'default', autoHideDuration = 1800) {
  toaster.info(message, {
    autoHideDuration,
    overrides: {
      Body: {
        style: {
          backgroundColor: tone === 'error' ? '#b42318' : '#141414',
          color: '#efeeec',
          width: 'auto',
          minWidth: 0,
          maxWidth: '420px',
          minHeight: 0,
          padding: '8px 12px',
          marginTop: '8px',
          borderRadius: '8px',
          fontSize: '13px',
          lineHeight: '18px',
          boxShadow: '0 12px 32px -12px rgba(0,0,0,0.45)',
        },
      },
      InnerContainer: { style: { display: 'flex', alignItems: 'center', gap: '12px', whiteSpace: 'nowrap' } },
      CloseIcon: { style: { display: 'none' } },
    },
  })
}

export async function copyText(text: string, label: string) {
  try {
    await navigator.clipboard.writeText(text)
    notify(`Copied ${label}`)
  } catch {
    notify('Clipboard access was blocked by the browser', 'error')
  }
}
