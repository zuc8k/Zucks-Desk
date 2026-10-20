import type { JSX } from 'react'
import { useCallback, useEffect, useState } from 'react'
import { Camera, Monitor, AppWindow, Crop } from 'lucide-react'
import Card from '../components/ui/Card'
import Button from '../components/ui/Button'
import EmptyState from '../components/ui/EmptyState'
import { useSettingsStore } from '../stores/settings.store'
import { useUiStore } from '../stores/ui.store'
import { t } from '../lib/i18n'
import type { CaptureHistoryItem, CaptureMode } from '@shared/types/capture'

const modes: readonly { mode: CaptureMode; labelKey: string; Icon: typeof Camera }[] = [
  { mode: 'fullscreen', labelKey: 'capture.mode.fullscreen', Icon: Monitor },
  { mode: 'window', labelKey: 'capture.mode.window', Icon: AppWindow },
  { mode: 'region', labelKey: 'capture.mode.region', Icon: Crop }
]

export default function CapturePage(): JSX.Element {
  const language = useSettingsStore((s) => s.settings.language)
  const pushToast = useUiStore((s) => s.pushToast)
  const [busy, setBusy] = useState<boolean>(false)
  const [history, setHistory] = useState<CaptureHistoryItem[]>([])
  const [historyError, setHistoryError] = useState<string | null>(null)
  const [loadingHistory, setLoadingHistory] = useState<boolean>(true)

  const loadHistory = useCallback(async (): Promise<void> => {
    setLoadingHistory(true)
    setHistoryError(null)
    const result = await window.zucks.capture.history()
    setLoadingHistory(false)
    if (result.ok) {
      setHistory(result.data.filter((i) => i.kind === 'image'))
    } else {
      setHistoryError(
        result.error.code === 'NOT_AVAILABLE'
          ? t(language, 'error.notAvailable')
          : result.error.message
      )
    }
  }, [language])

  useEffect(() => {
    void loadHistory()
  }, [loadHistory])

  const takeScreenshot = async (mode: CaptureMode): Promise<void> => {
    setBusy(true)
    const result = await window.zucks.capture.screenshot(mode)
    setBusy(false)
    if (result.ok) {
      pushToast('success', 'Screenshot saved.')
      await loadHistory()
    } else {
      pushToast(
        'error',
        result.error.code === 'NOT_AVAILABLE'
          ? t(language, 'error.notAvailable')
          : result.error.message
      )
    }
  }

  return (
    <div className="flex flex-col gap-6">
      <Card
        title={t(language, 'capture.title')}
        description={t(language, 'capture.subtitle')}
      >
        <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
          {modes.map(({ mode, labelKey, Icon }) => (
            <Button
              key={mode}
              variant="secondary"
              size="md"
              disabled={busy}
              onClick={() => void takeScreenshot(mode)}
              className="h-24 flex-col gap-2"
            >
              <Icon size={22} />
              <span>{t(language, labelKey)}</span>
            </Button>
          ))}
        </div>
      </Card>

      <Card title={t(language, 'capture.history')}>
        {loadingHistory ? (
          <p className="text-sm text-[var(--color-text-muted)]">
            {t(language, 'common.loading')}
          </p>
        ) : historyError ? (
          <p className="text-sm text-[var(--color-danger)]">{historyError}</p>
        ) : history.length === 0 ? (
          <EmptyState title={t(language, 'capture.historyEmpty')} />
        ) : (
          <div className="grid grid-cols-2 gap-3 md:grid-cols-3 lg:grid-cols-4">
            {history.map((item) => (
              <div
                key={item.id}
                className="overflow-hidden rounded-[var(--radius-md)] border border-[var(--color-border)] bg-[var(--color-surface-muted)]"
              >
                <img
                  src={item.thumbnailDataUrl}
                  alt=""
                  className="h-28 w-full object-cover"
                />
                <p className="p-2 text-xs text-[var(--color-text-muted)]">
                  {new Date(item.createdAt).toLocaleString()}
                </p>
              </div>
            ))}
          </div>
        )}
      </Card>
    </div>
  )
}