import type { JSX } from 'react'
import { useEffect, useState } from 'react'
import { Video, Square } from 'lucide-react'
import Card from '../components/ui/Card'
import Button from '../components/ui/Button'
import EmptyState from '../components/ui/EmptyState'
import { useSettingsStore } from '../stores/settings.store'
import { useUiStore } from '../stores/ui.store'
import { t } from '../lib/i18n'
import type { ScreenSource } from '@shared/types/capture'

export default function RecorderPage(): JSX.Element {
  const language = useSettingsStore((s) => s.settings.language)
  const pushToast = useUiStore((s) => s.pushToast)
  const [sources, setSources] = useState<ScreenSource[]>([])
  const [selectedSourceId, setSelectedSourceId] = useState<string | null>(null)
  const [includeAudio, setIncludeAudio] = useState<boolean>(true)
  const [recording, setRecording] = useState<boolean>(false)
  const [busy, setBusy] = useState<boolean>(false)
  const [errorMsg, setErrorMsg] = useState<string | null>(null)

  useEffect(() => {
    void (async () => {
      const result = await window.zucks.capture.listSources()
      if (result.ok) {
        setSources(result.data)
        const first = result.data[0]
        if (first) setSelectedSourceId(first.id)
      } else {
        setErrorMsg(
          result.error.code === 'NOT_AVAILABLE'
            ? t(language, 'error.notAvailable')
            : result.error.message
        )
      }
    })()
  }, [language])

  const start = async (): Promise<void> => {
    if (!selectedSourceId) return
    setBusy(true)
    const result = await window.zucks.capture.startRecording({
      sourceId: selectedSourceId,
      includeAudio,
      fps: 30
    })
    setBusy(false)
    if (result.ok) {
      setRecording(true)
      pushToast('success', 'Recording started.')
    } else {
      pushToast(
        'error',
        result.error.code === 'NOT_AVAILABLE'
          ? t(language, 'error.notAvailable')
          : result.error.message
      )
    }
  }

  const stop = async (): Promise<void> => {
    setBusy(true)
    const result = await window.zucks.capture.stopRecording()
    setBusy(false)
    if (result.ok) {
      setRecording(false)
      pushToast('success', 'Recording saved.')
    } else {
      pushToast('error', result.error.message)
    }
  }

  return (
    <div className="flex flex-col gap-6">
      <Card
        title={t(language, 'recorder.title')}
        description={t(language, 'recorder.subtitle')}
      >
        <div className="flex flex-col gap-4">
          <div>
            <label
              htmlFor="recorder-source"
              className="mb-2 block text-sm font-medium text-[var(--color-text)]"
            >
              {t(language, 'recorder.source')}
            </label>
            {sources.length === 0 ? (
              <p className="text-sm text-[var(--color-text-muted)]">
                {t(language, 'recorder.sourceEmpty')}
              </p>
            ) : (
              <select
                id="recorder-source"
                value={selectedSourceId ?? ''}
                onChange={(e) => setSelectedSourceId(e.target.value)}
                className="w-full rounded-[var(--radius-md)] border border-[var(--color-border)] bg-[var(--color-surface-muted)] px-3 py-2 text-sm text-[var(--color-text)]"
              >
                {sources.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.name}
                  </option>
                ))}
              </select>
            )}
          </div>

          <label className="flex items-center gap-3 text-sm text-[var(--color-text)]">
            <input
              type="checkbox"
              checked={includeAudio}
              onChange={(e) => setIncludeAudio(e.target.checked)}
              disabled={recording}
              className="h-4 w-4"
            />
            {t(language, 'recorder.includeAudio')}
          </label>

          {errorMsg && (
            <p className="text-sm text-[var(--color-danger)]">{errorMsg}</p>
          )}

          <div className="flex items-center gap-3">
            {recording ? (
              <Button variant="danger" onClick={stop} disabled={busy}>
                <Square size={16} />
                {t(language, 'recorder.stop')}
              </Button>
            ) : (
              <Button
                onClick={start}
                disabled={busy || !selectedSourceId}
              >
                <Video size={16} />
                {t(language, 'recorder.start')}
              </Button>
            )}
            <span className="text-sm text-[var(--color-text-muted)]">
              {recording ? t(language, 'recorder.recording') : t(language, 'recorder.ready')}
            </span>
          </div>
        </div>
      </Card>

      <Card title={t(language, 'recorder.history')}>
        <EmptyState title={t(language, 'recorder.historyEmpty')} />
      </Card>
    </div>
  )
}