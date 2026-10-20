import { useEffect, useState } from 'react'
import { Minus, Square, X } from 'lucide-react'

export default function TitleBar(): React.JSX.Element {
  const [maximized, setMaximized] = useState(false)

  useEffect(() => {
    void window.zucks.window.isMaximized().then(setMaximized)
    const unsubscribe = window.zucks.window.onMaximizeChange(setMaximized)
    return unsubscribe
  }, [])

  return (
    <div className="flex h-[var(--titlebar-height)] shrink-0 items-center justify-between border-b border-[var(--color-border)] bg-[var(--color-surface)] px-3">
      <div className="text-xs font-semibold tracking-wide text-[var(--color-text-muted)]">
        ZUCKS DESK
      </div>
      <div className="flex items-center gap-1">
        <button
          type="button"
          onClick={() => window.zucks.window.minimize()}
          className="flex h-8 w-8 items-center justify-center rounded text-[var(--color-text-muted)] hover:bg-[var(--color-surface-muted)] hover:text-[var(--color-text)]"
          aria-label="Minimize"
        >
          <Minus size={14} />
        </button>
        <button
          type="button"
          onClick={() => window.zucks.window.toggleMaximize()}
          className="flex h-8 w-8 items-center justify-center rounded text-[var(--color-text-muted)] hover:bg-[var(--color-surface-muted)] hover:text-[var(--color-text)]"
          aria-label={maximized ? 'Restore' : 'Maximize'}
        >
          <Square size={12} />
        </button>
        <button
          type="button"
          onClick={() => window.zucks.window.close()}
          className="flex h-8 w-8 items-center justify-center rounded text-[var(--color-text-muted)] hover:bg-[var(--color-danger)] hover:text-white"
          aria-label="Close"
        >
          <X size={14} />
        </button>
      </div>
    </div>
  )
}