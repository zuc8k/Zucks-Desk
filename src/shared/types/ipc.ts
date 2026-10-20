/**
 * Types describing the request/response envelope used by every IPC channel.
 * Every ipcMain.handle handler MUST return an IpcResult<T>, never throw.
 * This keeps the renderer free of untyped exceptions.
 */

export type IpcErrorCode =
  | 'INVALID_INPUT'
  | 'NOT_AVAILABLE'
  | 'PERMISSION_DENIED'
  | 'IO_ERROR'
  | 'NOT_FOUND'
  | 'CANCELLED'
  | 'TIMEOUT'
  | 'INTERNAL'

export interface IpcError {
  code: IpcErrorCode
  message: string
}

export type IpcResult<T> = { ok: true; data: T } | { ok: false; error: IpcError }

export function ipcOk<T>(data: T): IpcResult<T> {
  return { ok: true, data }
}

export function ipcErr<T = never>(code: IpcErrorCode, message: string): IpcResult<T> {
  return { ok: false, error: { code, message } }
}