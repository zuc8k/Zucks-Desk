import { ipcMain } from 'electron'
import { IPC_CHANNELS } from '@shared/constants'
import { ipcErr, ipcOk, type IpcResult } from '@shared/types/ipc'
import type { ClipboardItem } from '@shared/api-contract'
import {
  copyClipboardItem,
  deleteClipboardItem,
  listClipboardItems,
  toggleClipboardPin
} from '../services/clipboard.service'

function wrap<T>(fn: () => T): IpcResult<T> {
  try {
    return ipcOk(fn())
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unknown error'
    return ipcErr(message === 'NOT_FOUND' ? 'NOT_FOUND' : 'INTERNAL', message)
  }
}

export function registerClipboardIpc(): void {
  ipcMain.handle(
    IPC_CHANNELS.clipboardList,
    (): IpcResult<ClipboardItem[]> => wrap(() => listClipboardItems())
  )

  ipcMain.handle(
    IPC_CHANNELS.clipboardPin,
    (_event, id: unknown): IpcResult<void> => {
      if (typeof id !== 'string') return ipcErr('INVALID_INPUT', 'Item id is required')
      return wrap(() => toggleClipboardPin(id))
    }
  )

  ipcMain.handle(
    IPC_CHANNELS.clipboardDelete,
    (_event, id: unknown): IpcResult<void> => {
      if (typeof id !== 'string') return ipcErr('INVALID_INPUT', 'Item id is required')
      return wrap(() => deleteClipboardItem(id))
    }
  )

  ipcMain.handle(
    IPC_CHANNELS.clipboardCopy,
    (_event, id: unknown): IpcResult<void> => {
      if (typeof id !== 'string') return ipcErr('INVALID_INPUT', 'Item id is required')
      return wrap(() => copyClipboardItem(id))
    }
  )
}