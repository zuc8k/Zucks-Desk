import type { IpcResult } from './types/ipc'
import type {
  CaptureHistoryItem,
  CaptureMode,
  CaptureResult,
  RecordingOptions,
  RecordingResult,
  ScreenSource
} from './types/capture'
import type { Note, NoteCreateInput, NoteUpdateInput } from './types/notes'
import type { AppSettings, AppSettingsPatch } from './types/settings'

export interface ClipboardItem {
  id: string
  text: string
  pinned: boolean
  createdAt: number
}

export interface SystemInfo {
  os: string
  arch: string
  appVersion: string
  totalMemoryBytes: number
  cpuModel: string
  cpuCores: number
  diskFreeBytes: number
  diskTotalBytes: number
}

export interface ResourceSnapshot {
  cpuPercent: number
  usedMemoryBytes: number
  totalMemoryBytes: number
  timestamp: number
}

export type OcrLang = 'ara' | 'eng' | 'ara+eng'

export interface OcrResult {
  text: string
  confidence: number
}

export interface CaptureApi {
  listSources(): Promise<IpcResult<ScreenSource[]>>
  screenshot(mode: CaptureMode, sourceId?: string): Promise<IpcResult<CaptureResult>>
  startRecording(options: RecordingOptions): Promise<IpcResult<RecordingResult>>
  stopRecording(): Promise<IpcResult<RecordingResult>>
  history(): Promise<IpcResult<CaptureHistoryItem[]>>
  deleteHistory(id: string): Promise<IpcResult<void>>
}

export interface OcrApi {
  recognize(imageDataUrl: string, lang: OcrLang): Promise<IpcResult<OcrResult>>
}

export interface ClipboardApi {
  list(): Promise<IpcResult<ClipboardItem[]>>
  pin(id: string): Promise<IpcResult<void>>
  delete(id: string): Promise<IpcResult<void>>
  copy(id: string): Promise<IpcResult<void>>
}

export interface NotesApi {
  list(): Promise<IpcResult<Note[]>>
  create(input: NoteCreateInput): Promise<IpcResult<Note>>
  update(input: NoteUpdateInput): Promise<IpcResult<Note>>
  delete(id: string): Promise<IpcResult<void>>
}

export interface SystemApi {
  info(): Promise<IpcResult<SystemInfo>>
  resources(): Promise<IpcResult<ResourceSnapshot>>
}

export interface SettingsApi {
  get(): Promise<IpcResult<AppSettings>>
  update(patch: AppSettingsPatch): Promise<IpcResult<AppSettings>>
}

export interface WindowApi {
  minimize(): void
  toggleMaximize(): void
  close(): void
  isMaximized(): Promise<boolean>
  onMaximizeChange(listener: (maximized: boolean) => void): () => void
}

export interface ThemeApi {
  current(): Promise<'light' | 'dark'>
  onChange(listener: (theme: 'light' | 'dark') => void): () => void
}

export interface ZucksApi {
  capture: CaptureApi
  ocr: OcrApi
  clipboard: ClipboardApi
  notes: NotesApi
  system: SystemApi
  settings: SettingsApi
  window: WindowApi
  theme: ThemeApi
}