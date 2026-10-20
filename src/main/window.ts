import { BrowserWindow, app, nativeTheme, shell } from 'electron'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'
import { IPC_CHANNELS } from '@shared/constants'

const currentDir = dirname(fileURLToPath(import.meta.url))

export function createMainWindow(): BrowserWindow {
  const isDark = nativeTheme.shouldUseDarkColors
  const backgroundColor = isDark ? '#0f172a' : '#f8fafc'
  const symbolColor = isDark ? '#f8fafc' : '#0f172a'

  const win = new BrowserWindow({
    width: 1200,
    height: 800,
    minWidth: 900,
    minHeight: 600,
    show: false,
    backgroundColor,
    titleBarStyle: 'hidden',
    titleBarOverlay: {
      color: backgroundColor,
      symbolColor,
      height: 40
    },
    webPreferences: {
      preload: join(currentDir, '../preload/index.js'),
      contextIsolation: true,
      nodeIntegration: false,
      sandbox: false,
      webSecurity: true
    }
  })

  win.once('ready-to-show', () => {
    win.show()
  })

  win.on('maximize', () => {
    win.webContents.send(IPC_CHANNELS.windowMaximizeChanged, true)
  })

  win.on('unmaximize', () => {
    win.webContents.send(IPC_CHANNELS.windowMaximizeChanged, false)
  })

  win.webContents.setWindowOpenHandler((details) => {
    void shell.openExternal(details.url)
    return { action: 'deny' }
  })

  const rendererUrl = process.env['ELECTRON_RENDERER_URL']
  if (!app.isPackaged && typeof rendererUrl === 'string' && rendererUrl.length > 0) {
    void win.loadURL(rendererUrl)
  } else {
    void win.loadFile(join(currentDir, '../renderer/index.html'))
  }

  return win
}