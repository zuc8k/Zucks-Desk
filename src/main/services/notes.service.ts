import { randomUUID } from 'node:crypto'
import { getDb } from './database'
import { ValidationError } from '../security/validate'
import type { Note, NoteCreateInput, NoteUpdateInput } from '@shared/types/notes'

interface NoteRow {
  id: string
  title: string
  body: string
  pinned: number
  created_at: number
  updated_at: number
}

function rowToNote(row: NoteRow): Note {
  return {
    id: row.id,
    title: row.title,
    body: row.body,
    pinned: row.pinned === 1,
    createdAt: row.created_at,
    updatedAt: row.updated_at
  }
}

export function listNotes(): Note[] {
  const rows = getDb()
    .prepare(
      `SELECT id, title, body, pinned, created_at, updated_at
       FROM notes
       ORDER BY pinned DESC, updated_at DESC`
    )
    .all() as NoteRow[]
  return rows.map(rowToNote)
}

export function createNote(input: NoteCreateInput): Note {
  const title = typeof input.title === 'string' ? input.title.slice(0, 500) : ''
  const body = typeof input.body === 'string' ? input.body.slice(0, 100_000) : ''
  if (!title.trim() && !body.trim()) {
    throw new ValidationError('Note title or body required')
  }
  const now = Date.now()
  const note: Note = {
    id: randomUUID(),
    title,
    body,
    pinned: false,
    createdAt: now,
    updatedAt: now
  }
  getDb()
    .prepare(
      `INSERT INTO notes (id, title, body, pinned, created_at, updated_at)
       VALUES (?, ?, ?, ?, ?, ?)`
    )
    .run(note.id, note.title, note.body, 0, note.createdAt, note.updatedAt)
  return note
}

export function updateNote(input: NoteUpdateInput): Note {
  const db = getDb()
  const row = db
    .prepare(
      `SELECT id, title, body, pinned, created_at, updated_at
       FROM notes WHERE id = ?`
    )
    .get(input.id) as NoteRow | undefined
  if (!row) {
    throw new ValidationError('Note not found')
  }
  const note = rowToNote(row)
  if (typeof input.title === 'string') note.title = input.title.slice(0, 500)
  if (typeof input.body === 'string') note.body = input.body.slice(0, 100_000)
  if (typeof input.pinned === 'boolean') note.pinned = input.pinned
  note.updatedAt = Date.now()

  db.prepare(
    `UPDATE notes SET title = ?, body = ?, pinned = ?, updated_at = ? WHERE id = ?`
  ).run(note.title, note.body, note.pinned ? 1 : 0, note.updatedAt, note.id)

  return note
}

export function deleteNote(id: string): void {
  const info = getDb().prepare('DELETE FROM notes WHERE id = ?').run(id)
  if (info.changes === 0) {
    throw new ValidationError('Note not found')
  }
}