import { contextBridge, ipcRenderer, type IpcRendererEvent } from 'electron'
import { IPC_CHANNELS } from '@shared/constants'
import type {
  ZucksApi,
  CaptureApi,
  OcrApi,
  ClipboardApi,
  NotesApi,
  SystemApi,
  SettingsApi,
  WindowApi,
  ThemeApi
} from '@shared/api-contract'
import type { IpcError, IpcResult } from '@shared/types/ipc'

function toIpcError(err: unknown): IpcError {
  if (err instanceof Error) {
    if (err.message.includes('No handler registered')) {
      return {
        code: 'NOT_AVAILABLE',
        message: 'This feature is not yet available in this build.'
      }
    }
    return { code: 'INTERNAL', message: err.message }
  }
  return { code: 'INTERNAL', message: 'Unknown IPC error' }
}

async function invoke<T>(channel: string, ...args: unknown[]): Promise<IpcResult<T>> {
  try {
    const result = (await ipcRenderer.invoke(channel, ...args)) as IpcResult<T>
    return result
  } catch (err) {
    return { ok: false, error: toIpcError(err) }
  }
}

function invokeVoid(channel: string, ...args: unknown[]): void {
  ipcRenderer.send(channel, ...args)
}

const captureApi: CaptureApi = {
  listSources: () => invoke(IPC_CHANNELS.captureListSources),
  screenshot: (mode) => invoke(IPC_CHANNELS.captureScreenshot, mode),
  startRecording: (options) => invoke(IPC_CHANNELS.captureStartRecording, options),
  stopRecording: () => invoke(IPC_CHANNELS.captureStopRecording),
  history: () => invoke(IPC_CHANNELS.captureHistory),
  deleteHistory: (id) => invoke(IPC_CHANNELS.captureDeleteHistory, id)
}

const ocrApi: OcrApi = {
  recognize: (imageDataUrl, lang) => invoke(IPC_CHANNELS.ocrRecognize, imageDataUrl, lang)
}

const clipboardApi: ClipboardApi = {
  list: () => invoke(IPC_CHANNELS.clipboardList),
  pin: (id) => invoke(IPC_CHANNELS.clipboardPin, id),
  delete: (id) => invoke(IPC_CHANNELS.clipboardDelete, id),
  copy: (id) => invoke(IPC_CHANNELS.clipboardCopy, id)
}

const notesApi: NotesApi = {
  list: () => invoke(IPC_CHANNELS.notesList),
  create: (input) => invoke(IPC_CHANNELS.notesCreate, input),
  update: (input) => invoke(IPC_CHANNELS.notesUpdate, input),
  delete: (id) => invoke(IPC_CHANNELS.notesDelete, id)
}

const systemApi: SystemApi = {
  info: () => invoke(IPC_CHANNELS.systemInfo),
  resources: () => invoke(IPC_CHANNELS.systemResources)
}

const settingsApi: SettingsApi = {
  get: () => invoke(IPC_CHANNELS.settingsGet),
  update: (patch) => invoke(IPC_CHANNELS.settingsUpdate, patch)
}

const windowApi: WindowApi = {
  minimize: () => invokeVoid(IPC_CHANNELS.windowMinimize),
  toggleMaximize: () => invokeVoid(IPC_CHANNELS.windowMaximizeToggle),
  close: () => invokeVoid(IPC_CHANNELS.windowClose),
  isMaximized: async (): Promise<boolean> => {
    try {
      return (await ipcRenderer.invoke(IPC_CHANNELS.windowIsMaximized)) as boolean
    } catch {
      return false
    }
  },
  onMaximizeChange: (listener) => {
    const handler = (_event: IpcRendererEvent, maximized: boolean): void => {
      listener(maximized)
    }
    ipcRenderer.on(IPC_CHANNELS.windowMaximizeChanged, handler)
    return (): void => {
      ipcRenderer.removeListener(IPC_CHANNELS.windowMaximizeChanged, handler)
    }
  }
}

const themeApi: ThemeApi = {
  current: async (): Promise<'light' | 'dark'> => {
    try {
      return (await ipcRenderer.invoke(IPC_CHANNELS.themeCurrent)) as 'light' | 'dark'
    } catch {
      return 'light'
    }
  },
  onChange: (listener) => {
    const handler = (_event: IpcRendererEvent, theme: 'light' | 'dark'): void => {
      listener(theme)
    }
    ipcRenderer.on(IPC_CHANNELS.themeUpdated, handler)
    return (): void => {
      ipcRenderer.removeListener(IPC_CHANNELS.themeUpdated, handler)
    }
  }
}

const zucksApi: ZucksApi = {
  capture: captureApi,
  ocr: ocrApi,
  clipboard: clipboardApi,
  notes: notesApi,
  system: systemApi,
  settings: settingsApi,
  window: windowApi,
  theme: themeApi
}

if (process.contextIsolated) {
  contextBridge.exposeInMainWorld('zucks', zucksApi)
} else {
  // Should never happen with our BrowserWindow config; defensive guard only.
  throw new Error('contextIsolation must be enabled')
}