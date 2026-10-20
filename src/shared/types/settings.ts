/**
 * Application settings domain types.
 */

export type ThemeMode = 'light' | 'dark' | 'system'

export type AppLanguage = 'ar' | 'en'

export interface HotkeyBindings {
  captureFullscreen: string
  captureRegion: string
  captureWindow: string
  toggleRecorder: string
  openOcr: string
}

export interface AppSettings {
  theme: ThemeMode
  language: AppLanguage
  captureSaveDirectory: string
  recordingSaveDirectory: string
  launchOnStartup: boolean
  minimizeToTray: boolean
  enableClipboardWatcher: boolean
  hotkeys: HotkeyBindings
}

export type AppSettingsPatch = Partial<AppSettings>