import { ipcMain } from 'electron'
import { IPC_CHANNELS } from '@shared/constants'
import { ipcErr, ipcOk, type IpcResult } from '@shared/types/ipc'
import type { ResourceSnapshot, SystemInfo } from '@shared/api-contract'
import { getResourceSnapshot, getSystemInfo } from '../services/system.service'

export function registerSystemIpc(): void {
  ipcMain.handle(IPC_CHANNELS.systemInfo, (): IpcResult<SystemInfo> => {
    try {
      return ipcOk(getSystemInfo())
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to read system info'
      return ipcErr('INTERNAL', message)
    }
  })

  ipcMain.handle(IPC_CHANNELS.systemResources, (): IpcResult<ResourceSnapshot> => {
    try {
      return ipcOk(getResourceSnapshot())
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to read resources'
      return ipcErr('INTERNAL', message)
    }
  })
}