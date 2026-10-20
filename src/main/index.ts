import { BrowserWindow, app, nativeTheme } from 'electron'
import { registerIpcHandlers } from './ipc'
import { createMainWindow } from './window'
import { APP_ID, APP_NAME, IPC_CHANNELS } from '@shared/constants'

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

  registerIpcHandlers()
  bootstrap()

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

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit()
  }
})