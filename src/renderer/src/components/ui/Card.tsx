import type { ReactNode } from 'react'

interface CardProps {
  title?: string
  description?: string
  children: ReactNode
  className?: string
}

export default function Card({
  title,
  description,
  children,
  className = ''
}: CardProps): React.JSX.Element {
  return (
    <section
      className={`rounded-[var(--radius-lg)] border border-[var(--color-border)] bg-[var(--color-surface)] p-5 shadow-sm ${className}`}
    >
      {title && (
        <header className="mb-3">
          <h2 className="text-base font-semibold text-[var(--color-text)]">{title}</h2>
          {description && (
            <p className="mt-1 text-sm text-[var(--color-text-muted)]">{description}</p>
          )}
        </header>
      )}
      {children}
    </section>
  )
}