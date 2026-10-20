import type { AppLanguage, AppSettings, HotkeyBindings, ThemeMode } from './types/settings'

export const APP_NAME = 'ZUCKS DESK'
export const APP_ID = 'com.zucksdesk.app'
export const APP_VERSION = '0.1.0'

export const IPC_CHANNELS = {
  // Window controls
  windowMinimize: 'window:minimize',
  windowMaximizeToggle: 'window:maximize-toggle',
  windowClose: 'window:close',
  windowIsMaximized: 'window:is-maximized',
  windowMaximizeChanged: 'window:maximize-changed',

  // Theme
  themeCurrent: 'theme:current',
  themeUpdated: 'theme:updated',

  // Capture
  captureListSources: 'capture:list-sources',
  captureScreenshot: 'capture:screenshot',
  captureStartRecording: 'capture:start-recording',
  captureStopRecording: 'capture:stop-recording',
  captureHistory: 'capture:history',
  captureDeleteHistory: 'capture:delete-history',

  // OCR
  ocrRecognize: 'ocr:recognize',

  // Clipboard
  clipboardList: 'clipboard:list',
  clipboardPin: 'clipboard:pin',
  clipboardDelete: 'clipboard:delete',
  clipboardCopy: 'clipboard:copy',

  // Notes
  notesList: 'notes:list',
  notesCreate: 'notes:create',
  notesUpdate: 'notes:update',
  notesDelete: 'notes:delete',

  // System
  systemInfo: 'system:info',
  systemResources: 'system:resources',

  // Settings
  settingsGet: 'settings:get',
  settingsUpdate: 'settings:update',

  // Overlay (region selection)
  overlayRequestImage: 'overlay:request-image',
  overlayImage: 'overlay:image',
  overlaySelect: 'overlay:select',
  overlayCancel: 'overlay:cancel'
} as const

export const DEFAULT_HOTKEYS: HotkeyBindings = {
  captureFullscreen: 'CommandOrControl+Shift+1',
  captureRegion: 'CommandOrControl+Shift+2',
  captureWindow: 'CommandOrControl+Shift+3',
  toggleRecorder: 'CommandOrControl+Shift+5',
  openOcr: 'CommandOrControl+Shift+O'
}

export const DEFAULT_SETTINGS: AppSettings = {
  theme: 'system',
  language: 'en',
  captureSaveDirectory: '',
  recordingSaveDirectory: '',
  launchOnStartup: false,
  minimizeToTray: false,
  enableClipboardWatcher: true,
  hotkeys: DEFAULT_HOTKEYS
}

export const SUPPORTED_LANGUAGES: readonly AppLanguage[] = ['en', 'ar']
export const SUPPORTED_THEMES: readonly ThemeMode[] = ['light', 'dark', 'system']

export const MIN_WINDOW_WIDTH = 900
export const MIN_WINDOW_HEIGHT = 600
export const DEFAULT_WINDOW_WIDTH = 1200
export const DEFAULT_WINDOW_HEIGHT = 800