import { app, nativeTheme } from 'electron'
import { getDb } from './database'
import { startClipboardWatcher, stopClipboardWatcher } from './clipboard.service'
import { DEFAULT_SETTINGS, SUPPORTED_LANGUAGES, SUPPORTED_THEMES } from '@shared/constants'
import type { AppSettings, AppSettingsPatch, HotkeyBindings } from '@shared/types/settings'
import {
  ValidationError,
  assertBoolean,
  assertLanguage,
  assertTheme,
  isPlainObject
} from '../security/validate'

const SETTINGS_KEY = 'app_settings_v1'

let cached: AppSettings | null = null

function mergeHotkeys(value: unknown): HotkeyBindings {
  if (!isPlainObject(value)) {
    return { ...DEFAULT_SETTINGS.hotkeys }
  }
  const keys: (keyof HotkeyBindings)[] = [
    'captureFullscreen',
    'captureRegion',
    'captureWindow',
    'toggleRecorder',
    'openOcr'
  ]
  const result = { ...DEFAULT_SETTINGS.hotkeys }
  for (const key of keys) {
    const candidate = value[key]
    if (typeof candidate === 'string' && candidate.length > 0) {
      result[key] = candidate
    }
  }
  return result
}

function mergeWithDefaults(raw: Record<string, unknown>): AppSettings {
  const theme = SUPPORTED_THEMES.includes(raw.theme as never)
    ? (raw.theme as AppSettings['theme'])
    : DEFAULT_SETTINGS.theme
  const language = SUPPORTED_LANGUAGES.includes(raw.language as never)
    ? (raw.language as AppSettings['language'])
    : DEFAULT_SETTINGS.language

  return {
    theme,
    language,
    captureSaveDirectory:
      typeof raw.captureSaveDirectory === 'string'
        ? raw.captureSaveDirectory
        : DEFAULT_SETTINGS.captureSaveDirectory,
    recordingSaveDirectory:
      typeof raw.recordingSaveDirectory === 'string'
        ? raw.recordingSaveDirectory
        : DEFAULT_SETTINGS.recordingSaveDirectory,
    launchOnStartup:
      typeof raw.launchOnStartup === 'boolean'
        ? raw.launchOnStartup
        : DEFAULT_SETTINGS.launchOnStartup,
    minimizeToTray:
      typeof raw.minimizeToTray === 'boolean'
        ? raw.minimizeToTray
        : DEFAULT_SETTINGS.minimizeToTray,
    enableClipboardWatcher:
      typeof raw.enableClipboardWatcher === 'boolean'
        ? raw.enableClipboardWatcher
        : DEFAULT_SETTINGS.enableClipboardWatcher,
    hotkeys: mergeHotkeys(raw.hotkeys)
  }
}

function readFromDb(): AppSettings | null {
  const row = getDb()
    .prepare('SELECT value FROM settings WHERE key = ?')
    .get(SETTINGS_KEY) as { value: string } | undefined
  if (!row) return null
  try {
    const parsed = JSON.parse(row.value) as unknown
    if (!isPlainObject(parsed)) return null
    return mergeWithDefaults(parsed)
  } catch {
    return null
  }
}

function writeToDb(settings: AppSettings): void {
  getDb()
    .prepare('INSERT OR REPLACE INTO settings (key, value) VALUES (?, ?)')
    .run(SETTINGS_KEY, JSON.stringify(settings))
}

function applySideEffects(next: AppSettings, previous: AppSettings | null): void {
  try {
    nativeTheme.themeSource = next.theme
  } catch {
    // ignore
  }
  try {
    app.setLoginItemSettings({ openAtLogin: next.launchOnStartup })
  } catch {
    // ignore
  }
  if (previous && previous.enableClipboardWatcher !== next.enableClipboardWatcher) {
    try {
      if (next.enableClipboardWatcher) {
        startClipboardWatcher()
      } else {
        stopClipboardWatcher()
      }
    } catch {
      // ignore
    }
  }
}

export function getSettings(): AppSettings {
  if (cached) return cached
  const fromDb = readFromDb()
  if (fromDb) {
    cached = fromDb
  } else {
    cached = { ...DEFAULT_SETTINGS }
    writeToDb(cached)
  }
  applySideEffects(cached, null)
  return cached
}

export function updateSettings(patch: AppSettingsPatch): AppSettings {
  const current = getSettings()
  const next: AppSettings = { ...current, hotkeys: { ...current.hotkeys } }

  if ('theme' in patch && patch.theme !== undefined) {
    next.theme = assertTheme(patch.theme)
  }
  if ('language' in patch && patch.language !== undefined) {
    next.language = assertLanguage(patch.language)
  }
  if ('captureSaveDirectory' in patch && typeof patch.captureSaveDirectory === 'string') {
    next.captureSaveDirectory = patch.captureSaveDirectory
  }
  if (
    'recordingSaveDirectory' in patch &&
    typeof patch.recordingSaveDirectory === 'string'
  ) {
    next.recordingSaveDirectory = patch.recordingSaveDirectory
  }
  if ('launchOnStartup' in patch && patch.launchOnStartup !== undefined) {
    next.launchOnStartup = assertBoolean(patch.launchOnStartup, 'launchOnStartup')
  }
  if ('minimizeToTray' in patch && patch.minimizeToTray !== undefined) {
    next.minimizeToTray = assertBoolean(patch.minimizeToTray, 'minimizeToTray')
  }
  if ('enableClipboardWatcher' in patch && patch.enableClipboardWatcher !== undefined) {
    next.enableClipboardWatcher = assertBoolean(
      patch.enableClipboardWatcher,
      'enableClipboardWatcher'
    )
  }
  if ('hotkeys' in patch && patch.hotkeys !== undefined) {
    if (!isPlainObject(patch.hotkeys)) {
      throw new ValidationError('hotkeys must be an object')
    }
    next.hotkeys = { ...next.hotkeys, ...mergeHotkeys(patch.hotkeys) }
  }

  writeToDb(next)
  cached = next
  applySideEffects(next, current)
  return next
}