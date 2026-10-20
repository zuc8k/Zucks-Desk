import type { JSX } from 'react'
import { useEffect, useState } from 'react'
import Card from '../components/ui/Card'
import Button from '../components/ui/Button'
import { useSettingsStore } from '../stores/settings.store'
import { useUiStore } from '../stores/ui.store'
import { t } from '../lib/i18n'
import type {
  AppLanguage,
  AppSettings,
  ThemeMode
} from '@shared/types/settings'

export default function SettingsPage(): JSX.Element {
  const settings = useSettingsStore((s) => s.settings)
  const saving = useSettingsStore((s) => s.saving)
  const update = useSettingsStore((s) => s.update)
  const pushToast = useUiStore((s) => s.pushToast)

  const [local, setLocal] = useState<AppSettings>(settings)
  const [errorMsg, setErrorMsg] = useState<string | null>(null)

  useEffect(() => {
    setLocal(settings)
  }, [settings])

  const language = settings.language

  const setTheme = (theme: ThemeMode): void => {
    setLocal((prev) => ({ ...prev, theme }))
  }

  const setLanguage = (next: AppLanguage): void => {
    setLocal((prev) => ({ ...prev, language: next }))
  }

  const save = async (): Promise<void> => {
    setErrorMsg(null)
    const ok = await update(local)
    if (ok) {
      pushToast('success', t(language, 'settings.saved'))
    } else {
      setErrorMsg(t(language, 'settings.saveFailed'))
      pushToast('error', t(language, 'settings.saveFailed'))
    }
  }

  return (
    <div className="flex flex-col gap-6">
      <Card
        title={t(language, 'settings.title')}
        description={t(language, 'settings.subtitle')}
      >
        <div className="flex flex-col gap-6">
          <div>
            <label className="mb-2 block text-sm font-medium text-[var(--color-text)]">
              {t(language, 'settings.theme')}
            </label>
            <div className="flex gap-2">
              {(['light', 'dark', 'system'] as const).map((mode) => (
                <Button
                  key={mode}
                  variant={local.theme === mode ? 'primary' : 'secondary'}
                  size="sm"
                  onClick={() => setTheme(mode)}
                >
                  {t(language, `settings.theme.${mode}`)}
                </Button>
              ))}
            </div>
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium text-[var(--color-text)]">
              {t(language, 'settings.language')}
            </label>
            <div className="flex gap-2">
              {(['en', 'ar'] as const).map((lang) => (
                <Button
                  key={lang}
                  variant={local.language === lang ? 'primary' : 'secondary'}
                  size="sm"
                  onClick={() => setLanguage(lang)}
                >
                  {t(language, `settings.language.${lang}`)}
                </Button>
              ))}
            </div>
          </div>

          <div>
            <label
              htmlFor="capture-dir"
              className="mb-2 block text-sm font-medium text-[var(--color-text)]"
            >
              {t(language, 'settings.captureDir')}
            </label>
            <input
              id="capture-dir"
              type="text"
              value={local.captureSaveDirectory}
              onChange={(e) =>
                setLocal((prev) => ({ ...prev, captureSaveDirectory: e.target.value }))
              }
              className="w-full rounded-[var(--radius-md)] border border-[var(--color-border)] bg-[var(--color-surface-muted)] px-3 py-2 text-sm text-[var(--color-text)] outline-none focus:border-[var(--color-primary)]"
            />
          </div>

          <div>
            <label
              htmlFor="recording-dir"
              className="mb-2 block text-sm font-medium text-[var(--color-text)]"
            >
              {t(language, 'settings.recordingDir')}
            </label>
            <input
              id="recording-dir"
              type="text"
              value={local.recordingSaveDirectory}
              onChange={(e) =>
                setLocal((prev) => ({ ...prev, recordingSaveDirectory: e.target.value }))
              }
              className="w-full rounded-[var(--radius-md)] border border-[var(--color-border)] bg-[var(--color-surface-muted)] px-3 py-2 text-sm text-[var(--color-text)] outline-none focus:border-[var(--color-primary)]"
            />
          </div>

          <label className="flex items-center gap-3 text-sm text-[var(--color-text)]">
            <input
              type="checkbox"
              checked={local.launchOnStartup}
              onChange={(e) =>
                setLocal((prev) => ({ ...prev, launchOnStartup: e.target.checked }))
              }
              className="h-4 w-4"
            />
            {t(language, 'settings.launchOnStartup')}
          </label>

          <label className="flex items-center gap-3 text-sm text-[var(--color-text)]">
            <input
              type="checkbox"
              checked={local.enableClipboardWatcher}
              onChange={(e) =>
                setLocal((prev) => ({ ...prev, enableClipboardWatcher: e.target.checked }))
              }
              className="h-4 w-4"
            />
            {t(language, 'settings.enableClipboardWatcher' in en ? 'settings.enableClipboardWatcher' : 'settings.enableClipboard')}
          </label>

          {errorMsg && (
            <p className="text-sm text-[var(--color-danger)]">{errorMsg}</p>
          )}

          <div className="flex justify-end">
            <Button onClick={save} disabled={saving}>
              {saving ? t(language, 'common.loading') : t(language, 'settings.save')}
            </Button>
          </div>
        </div>
      </Card>
    </div>
  )
}

const en = { 'settings.enableClipboardWatcher': '' }