import type { JSX } from 'react'
import { useCallback, useEffect, useState } from 'react'
import { Copy, Pin, Trash2 } from 'lucide-react'
import Card from '../components/ui/Card'
import Button from '../components/ui/Button'
import EmptyState from '../components/ui/EmptyState'
import { useSettingsStore } from '../stores/settings.store'
import { useUiStore } from '../stores/ui.store'
import { t } from '../lib/i18n'
import type { ClipboardItem } from '@shared/api-contract'

export default function ClipboardHistoryPage(): JSX.Element {
  const language = useSettingsStore((s) => s.settings.language)
  const pushToast = useUiStore((s) => s.pushToast)
  const [items, setItems] = useState<ClipboardItem[]>([])
  const [loading, setLoading] = useState<boolean>(true)
  const [errorMsg, setErrorMsg] = useState<string | null>(null)
  const [query, setQuery] = useState<string>('')

  const load = useCallback(async (): Promise<void> => {
    setLoading(true)
    const result = await window.zucks.clipboard.list()
    setLoading(false)
    if (result.ok) {
      setItems(result.data)
    } else {
      setErrorMsg(
        result.error.code === 'NOT_AVAILABLE'
          ? t(language, 'error.notAvailable')
          : result.error.message
      )
    }
  }, [language])

  useEffect(() => {
    void load()
  }, [load])

  const togglePin = async (id: string): Promise<void> => {
    const result = await window.zucks.clipboard.pin(id)
    if (result.ok) {
      await load()
    } else {
      pushToast('error', result.error.message)
    }
  }

  const remove = async (id: string): Promise<void> => {
    const result = await window.zucks.clipboard.delete(id)
    if (result.ok) {
      await load()
    } else {
      pushToast('error', result.error.message)
    }
  }

  const copy = async (id: string): Promise<void> => {
    const result = await window.zucks.clipboard.copy(id)
    if (result.ok) {
      pushToast('success', t(language, 'common.copied'))
    } else {
      pushToast('error', result.error.message)
    }
  }

  const filtered = items.filter((i) =>
    i.text.toLowerCase().includes(query.trim().toLowerCase())
  )

  return (
    <div className="flex flex-col gap-6">
      <Card
        title={t(language, 'clipboard.title')}
        description={t(language, 'clipboard.subtitle')}
      >
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder={t(language, 'clipboard.search')}
          className="w-full rounded-[var(--radius-md)] border border-[var(--color-border)] bg-[var(--color-surface-muted)] px-3 py-2 text-sm text-[var(--color-text)] outline-none focus:border-[var(--color-primary)]"
        />
      </Card>

      <Card>
        {loading ? (
          <p className="text-sm text-[var(--color-text-muted)]">
            {t(language, 'common.loading')}
          </p>
        ) : errorMsg ? (
          <p className="text-sm text-[var(--color-danger)]">{errorMsg}</p>
        ) : filtered.length === 0 ? (
          <EmptyState title={t(language, 'clipboard.empty')} />
        ) : (
          <ul className="flex flex-col gap-2">
            {filtered.map((item) => (
              <li
                key={item.id}
                className="flex items-start justify-between gap-3 rounded-[var(--radius-md)] border border-[var(--color-border)] bg-[var(--color-surface-muted)] p-3"
              >
                <p className="min-w-0 flex-1 break-words text-sm text-[var(--color-text)]">
                  {item.text}
                </p>
                <div className="flex shrink-0 items-center gap-1">
                  <button
                    type="button"
                    onClick={() => void copy(item.id)}
                    aria-label={t(language, 'common.copy')}
                    className="flex h-8 w-8 items-center justify-center rounded text-[var(--color-text-muted)] hover:bg-[var(--color-surface)] hover:text-[var(--color-text)]"
                  >
                    <Copy size={14} />
                  </button>
                  <button
                    type="button"
                    onClick={() => void togglePin(item.id)}
                    aria-label={item.pinned ? t(language, 'common.unpin') : t(language, 'common.pin')}
                    className={`flex h-8 w-8 items-center justify-center rounded hover:bg-[var(--color-surface)] ${
                      item.pinned
                        ? 'text-[var(--color-primary)]'
                        : 'text-[var(--color-text-muted)] hover:text-[var(--color-text)]'
                    }`}
                  >
                    <Pin size={14} />
                  </button>
                  <button
                    type="button"
                    onClick={() => void remove(item.id)}
                    aria-label={t(language, 'common.delete')}
                    className="flex h-8 w-8 items-center justify-center rounded text-[var(--color-text-muted)] hover:bg-[var(--color-surface)] hover:text-[var(--color-danger)]"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </Card>
    </div>
  )
}