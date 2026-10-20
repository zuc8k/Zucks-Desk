import { BrowserWindow, app, dialog, nativeTheme } from 'electron'
import { registerIpcHandlers } from './ipc'
import { createMainWindow } from './window'
import { APP_ID, APP_NAME, IPC_CHANNELS } from '@shared/constants'
import { closeDatabase, initDatabase } from './services/database'
import { getSettings } from './services/settings.service'
import {
  startClipboardWatcher,
  stopClipboardWatcher
} from './services/clipboard.service'

const gotSingleInstanceLock = app.requestSingleInstanceLock()
if (!gotSingleInstanceLock) {
  app.quit()
}

let mainWindow: BrowserWindow | null = null

function bootstrap(): void {
  mainWindow = createMainWindow()
  mainWindow.on('closed', () => {
    mainWindow = null
  })
}

app.whenReady().then(() => {
  app.setName(APP_NAME)
  app.setAppUserModelId(APP_ID)

  try {
    initDatabase()
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err)
    dialog.showErrorBox(
      APP_NAME,
      `Could not initialize local database:\n\n${message}\n\nThe app will exit.`
    )
    app.quit()
    return
  }

  let settings
  try {
    settings = getSettings()
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err)
    dialog.showErrorBox(
      APP_NAME,
      `Could not load settings:\n\n${message}\n\nThe app will exit.`
    )
    app.quit()
    return
  }

  registerIpcHandlers()
  bootstrap()

  if (settings.enableClipboardWatcher) {
    try {
      startClipboardWatcher()
    } catch {
      // ignore watcher errors
    }
  }

  app.on('second-instance', () => {
    if (mainWindow) {
      if (mainWindow.isMinimized()) mainWindow.restore()
      mainWindow.focus()
    }
  })

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) bootstrap()
  })

  nativeTheme.on('updated', () => {
    const theme: 'light' | 'dark' = nativeTheme.shouldUseDarkColors ? 'dark' : 'light'
    for (const w of BrowserWindow.getAllWindows()) {
      w.webContents.send(IPC_CHANNELS.themeUpdated, theme)
    }
  })
})

app.on('before-quit', () => {
  try {
    stopClipboardWatcher()
  } catch {
    // ignore
  }
  closeDatabase()
})

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit()
  }
})