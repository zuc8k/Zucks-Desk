/**
 * Central IPC registration point.
 * Feature-specific handlers are added incrementally from their own files
 * (capture.ipc.ts, ocr.ipc.ts, ...) and imported here.
 *
 * Window controls are registered here because they are foundational.
 */

import { BrowserWindow, ipcMain } from 'electron'
import { IPC_CHANNELS } from '@shared/constants'

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
    // Placeholder: real implementation reads nativeTheme.
    return 'light'
  })
}