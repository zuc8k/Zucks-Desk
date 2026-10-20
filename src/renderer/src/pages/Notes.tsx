import type { JSX } from 'react'
import { useCallback, useEffect, useState } from 'react'
import { Plus, Save, Trash2 } from 'lucide-react'
import Card from '../components/ui/Card'
import Button from '../components/ui/Button'
import EmptyState from '../components/ui/EmptyState'
import { useSettingsStore } from '../stores/settings.store'
import { useUiStore } from '../stores/ui.store'
import { t } from '../lib/i18n'
import type { Note } from '@shared/types/notes'

export default function NotesPage(): JSX.Element {
  const language = useSettingsStore((s) => s.settings.language)
  const pushToast = useUiStore((s) => s.pushToast)
  const [notes, setNotes] = useState<Note[]>([])
  const [loading, setLoading] = useState<boolean>(true)
  const [errorMsg, setErrorMsg] = useState<string | null>(null)
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const [title, setTitle] = useState<string>('')
  const [body, setBody] = useState<string>('')
  const [editingNew, setEditingNew] = useState<boolean>(false)

  const load = useCallback(async (): Promise<void> => {
    setLoading(true)
    const result = await window.zucks.notes.list()
    setLoading(false)
    if (result.ok) {
      setNotes(result.data)
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

  const startNew = (): void => {
    setSelectedId(null)
    setTitle('')
    setBody('')
    setEditingNew(true)
  }

  const select = (note: Note): void => {
    setSelectedId(note.id)
    setTitle(note.title)
    setBody(note.body)
    setEditingNew(false)
  }

  const save = async (): Promise<void> => {
    if (!title.trim() && !body.trim()) return
    if (editingNew || !selectedId) {
      const result = await window.zucks.notes.create({ title, body })
      if (result.ok) {
        pushToast('success', 'Note saved.')
        setEditingNew(false)
        setSelectedId(result.data.id)
        await load()
      } else {
        pushToast('error', result.error.message)
      }
    } else {
      const result = await window.zucks.notes.update({ id: selectedId, title, body })
      if (result.ok) {
        pushToast('success', 'Note saved.')
        await load()
      } else {
        pushToast('error', result.error.message)
      }
    }
  }

  const remove = async (id: string): Promise<void> => {
    const result = await window.zucks.notes.delete(id)
    if (result.ok) {
      pushToast('success', 'Note deleted.')
      if (selectedId === id) {
        setSelectedId(null)
        setTitle('')
        setBody('')
        setEditingNew(false)
      }
      await load()
    } else {
      pushToast('error', result.error.message)
    }
  }

  return (
    <div className="grid grid-cols-1 gap-6 lg:grid-cols-[320px_1fr]">
      <Card title={t(language, 'notes.list')}>
        <div className="mb-3">
          <Button size="sm" onClick={startNew}>
            <Plus size={14} />
            {t(language, 'notes.new')}
          </Button>
        </div>
        {loading ? (
          <p className="text-sm text-[var(--color-text-muted)]">
            {t(language, 'common.loading')}
          </p>
        ) : errorMsg ? (
          <p className="text-sm text-[var(--color-danger)]">{errorMsg}</p>
        ) : notes.length === 0 ? (
          <EmptyState title={t(language, 'notes.empty')} />
        ) : (
          <ul className="flex flex-col gap-1">
            {notes.map((note) => (
              <li key={note.id}>
                <button
                  type="button"
                  onClick={() => select(note)}
                  className={`w-full rounded-[var(--radius-md)] px-3 py-2 text-left text-sm transition-colors ${
                    selectedId === note.id
                      ? 'bg-[var(--color-primary)] text-white'
                      : 'text-[var(--color-text)] hover:bg-[var(--color-surface-muted)]'
                  }`}
                >
                  <div className="truncate font-medium">
                    {note.title || '(untitled)'}
                  </div>
                  <div
                    className={`truncate text-xs ${
                      selectedId === note.id
                        ? 'text-white/80'
                        : 'text-[var(--color-text-muted)]'
                    }`}
                  >
                    {note.body}
                  </div>
                </button>
              </li>
            ))}
          </ul>
        )}
      </Card>

      <Card>
        <div className="flex flex-col gap-3">
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder={t(language, 'notes.titlePlaceholder')}
            className="w-full rounded-[var(--radius-md)] border border-[var(--color-border)] bg-[var(--color-surface-muted)] px-3 py-2 text-base font-semibold text-[var(--color-text)] outline-none focus:border-[var(--color-primary)]"
          />
          <textarea
            value={body}
            onChange={(e) => setBody(e.target.value)}
            placeholder={t(language, 'notes.bodyPlaceholder')}
            className="h-72 w-full resize-none rounded-[var(--radius-md)] border border-[var(--color-border)] bg-[var(--color-surface-muted)] p-3 text-sm text-[var(--color-text)] outline-none focus:border-[var(--color-primary)]"
          />
          <div className="flex justify-end gap-2">
            {selectedId && (
              <Button
                variant="danger"
                size="sm"
                onClick={() => void remove(selectedId)}
              >
                <Trash2 size={14} />
                {t(language, 'notes.delete')}
              </Button>
            )}
            <Button size="sm" onClick={save}>
              <Save size={14} />
              {t(language, 'notes.save')}
            </Button>
          </div>
        </div>
      </Card>
    </div>
  )
}