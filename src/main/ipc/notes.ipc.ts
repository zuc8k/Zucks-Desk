import { ipcMain } from 'electron'
import { IPC_CHANNELS } from '@shared/constants'
import { ipcErr, ipcOk, type IpcResult } from '@shared/types/ipc'
import type { Note, NoteCreateInput, NoteUpdateInput } from '@shared/types/notes'
import {
  createNote,
  deleteNote,
  listNotes,
  updateNote
} from '../services/notes.service'
import { isPlainObject } from '../security/validate'

function wrap<T>(fn: () => T): IpcResult<T> {
  try {
    return ipcOk(fn())
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unknown error'
    const isValidation = err instanceof Error && err.name === 'ValidationError'
    return ipcErr(isValidation ? 'INVALID_INPUT' : 'INTERNAL', message)
  }
}

export function registerNotesIpc(): void {
  ipcMain.handle(IPC_CHANNELS.notesList, (): IpcResult<Note[]> => wrap(() => listNotes()))

  ipcMain.handle(
    IPC_CHANNELS.notesCreate,
    (_event, input: unknown): IpcResult<Note> => {
      if (!isPlainObject(input)) {
        return ipcErr('INVALID_INPUT', 'Note input must be an object')
      }
      const title = typeof input.title === 'string' ? input.title : ''
      const body = typeof input.body === 'string' ? input.body : ''
      const payload: NoteCreateInput = { title, body }
      return wrap(() => createNote(payload))
    }
  )

  ipcMain.handle(
    IPC_CHANNELS.notesUpdate,
    (_event, input: unknown): IpcResult<Note> => {
      if (!isPlainObject(input)) {
        return ipcErr('INVALID_INPUT', 'Note input must be an object')
      }
      if (typeof input.id !== 'string') {
        return ipcErr('INVALID_INPUT', 'Note id is required')
      }
      const patch: NoteUpdateInput = { id: input.id }
      if (typeof input.title === 'string') patch.title = input.title
      if (typeof input.body === 'string') patch.body = input.body
      if (typeof input.pinned === 'boolean') patch.pinned = input.pinned
      return wrap(() => updateNote(patch))
    }
  )

  ipcMain.handle(
    IPC_CHANNELS.notesDelete,
    (_event, id: unknown): IpcResult<void> => {
      if (typeof id !== 'string') {
        return ipcErr('INVALID_INPUT', 'Note id is required')
      }
      return wrap(() => deleteNote(id))
    }
  )
}