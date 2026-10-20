interface LoadingProps {
  label?: string
}

export default function Loading({ label = 'Loading…' }: LoadingProps): React.JSX.Element {
  return (
    <div className="flex items-center justify-center gap-3 py-10 text-sm text-[var(--color-text-muted)]">
      <span
        className="inline-block h-4 w-4 animate-spin rounded-full border-2 border-[var(--color-border)] border-t-[var(--color-primary)]"
        aria-hidden="true"
      />
      <span>{label}</span>
    </div>
  )
}