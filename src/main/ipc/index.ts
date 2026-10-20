import { BrowserWindow, ipcMain, nativeTheme } from 'electron'
import { IPC_CHANNELS } from '@shared/constants'
import { registerSettingsIpc } from './settings.ipc'
import { registerSystemIpc } from './system.ipc'
import { registerNotesIpc } from './notes.ipc'
import { registerClipboardIpc } from './clipboard.ipc'

export function registerIpcHandlers(): void {
  ipcMain.handle(IPC_CHANNELS.windowIsMaximized, (event): boolean => {
    return BrowserWindow.fromWebContents(event.sender)?.isMaximized() ?? false
  })

  ipcMain.on(IPC_CHANNELS.windowMinimize, (event): void => {
    BrowserWindow.fromWebContents(event.sender)?.minimize()
  })

  ipcMain.on(IPC_CHANNELS.windowMaximizeToggle, (event): void => {
    const win = BrowserWindow.fromWebContents(event.sender)
    if (!win) return
    if (win.isMaximized()) {
      win.unmaximize()
    } else {
      win.maximize()
    }
  })

  ipcMain.on(IPC_CHANNELS.windowClose, (event): void => {
    BrowserWindow.fromWebContents(event.sender)?.close()
  })

  ipcMain.handle(IPC_CHANNELS.themeCurrent, (): 'light' | 'dark' => {
    return nativeTheme.shouldUseDarkColors ? 'dark' : 'light'
  })

  registerSettingsIpc()
  registerSystemIpc()
  registerNotesIpc()
  registerClipboardIpc()
}