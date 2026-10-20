import { useUiStore, type ToastKind } from '../../stores/ui.store'

const kindStyles: Record<ToastKind, string> = {
  success: 'border-l-4 border-[var(--color-success)]',
  error: 'border-l-4 border-[var(--color-danger)]',
  info: 'border-l-4 border-[var(--color-primary)]'
}

export default function ToastContainer(): React.JSX.Element {
  const toasts = useUiStore((s) => s.toasts)
  const dismiss = useUiStore((s) => s.dismissToast)

  return (
    <div className="pointer-events-none fixed bottom-4 right-4 z-50 flex w-80 flex-col gap-2">
      {toasts.map((toast) => (
        <div
          key={toast.id}
          className={`pointer-events-auto rounded-[var(--radius-md)] border border-[var(--color-border)] bg-[var(--color-surface)] px-4 py-3 text-sm text-[var(--color-text)] shadow-lg ${kindStyles[toast.kind]}`}
          role="status"
        >
          <div className="flex items-start justify-between gap-3">
            <span>{toast.message}</span>
            <button
              type="button"
              onClick={() => dismiss(toast.id)}
              className="text-[var(--color-text-muted)] hover:text-[var(--color-text)]"
              aria-label="Dismiss notification"
            >
              ×
            </button>
          </div>
        </div>
      ))}
    </div>
  )
}