import { useEffect } from 'react'
import { RouterProvider } from 'react-router-dom'
import { router } from './router'
import { useSettingsStore } from './stores/settings.store'
import { useUiStore } from './stores/ui.store'

export default function App(): React.JSX.Element {
  const theme = useSettingsStore((s) => s.settings.theme)
  const language = useSettingsStore((s) => s.settings.language)
  const loadSettings = useSettingsStore((s) => s.load)
  const loaded = useSettingsStore((s) => s.loaded)

  useEffect(() => {
    void loadSettings()
  }, [loadSettings])

  useEffect(() => {
    if (!loaded) return
    const root = document.documentElement
    const resolvedTheme =
      theme === 'system'
        ? window.matchMedia('(prefers-color-scheme: dark)').matches
          ? 'dark'
          : 'light'
        : theme
    root.setAttribute('data-theme', resolvedTheme)
    root.setAttribute('lang', language)
    root.setAttribute('dir', language === 'ar' ? 'rtl' : 'ltr')
  }, [theme, language, loaded])

  useEffect(() => {
    const unsubscribe = window.zucks.theme.onChange((nativeTheme) => {
      const current = useSettingsStore.getState().settings.theme
      if (current === 'system') {
        document.documentElement.setAttribute('data-theme', nativeTheme)
      }
    })
    return unsubscribe
  }, [])

  if (!loaded) {
    return (
      <div className="flex h-full items-center justify-center bg-[var(--color-bg)] text-[var(--color-text-muted)]">
        Loading ZUCKS DESK…
      </div>
    )
  }

  return <RouterProvider router={router} />
}