import { ipcMain } from 'electron'
import { IPC_CHANNELS } from '@shared/constants'
import { ipcErr, ipcOk, type IpcResult } from '@shared/types/ipc'
import type { AppSettings, AppSettingsPatch } from '@shared/types/settings'
import { getSettings, updateSettings } from '../services/settings.service'
import { isPlainObject } from '../security/validate'

export function registerSettingsIpc(): void {
  ipcMain.handle(IPC_CHANNELS.settingsGet, (): IpcResult<AppSettings> => {
    try {
      return ipcOk(getSettings())
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to load settings'
      return ipcErr('INTERNAL', message)
    }
  })

  ipcMain.handle(
    IPC_CHANNELS.settingsUpdate,
    (_event, patch: unknown): IpcResult<AppSettings> => {
      if (!isPlainObject(patch)) {
        return ipcErr('INVALID_INPUT', 'Settings patch must be an object')
      }
      try {
        return ipcOk(updateSettings(patch as AppSettingsPatch))
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Failed to update settings'
        const isValidation = err instanceof Error && err.name === 'ValidationError'
        return ipcErr(isValidation ? 'INVALID_INPUT' : 'INTERNAL', message)
      }
    }
  )
}