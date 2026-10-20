import { clipboard } from 'electron'
import { randomUUID } from 'node:crypto'
import { getDb } from './database'
import type { ClipboardItem } from '@shared/api-contract'

const MAX_ITEMS = 500
const POLL_MS = 1200

let watcherInterval: NodeJS.Timeout | null = null
let lastText = ''

export function startClipboardWatcher(): void {
  if (watcherInterval) return
  lastText = clipboard.readText()
  watcherInterval = setInterval(() => {
    try {
      const current = clipboard.readText()
      if (current && current !== lastText) {
        lastText = current
        insertClipboardItem(current)
      }
    } catch {
      // ignore polling errors
    }
  }, POLL_MS)
}

export function stopClipboardWatcher(): void {
  if (watcherInterval) {
    clearInterval(watcherInterval)
    watcherInterval = null
  }
}

interface ClipboardRow {
  id: string
  text: string
  pinned: number
  created_at: number
}

function rowToItem(row: ClipboardRow): ClipboardItem {
  return {
    id: row.id,
    text: row.text,
    pinned: row.pinned === 1,
    createdAt: row.created_at
  }
}

export function listClipboardItems(): ClipboardItem[] {
  const rows = getDb()
    .prepare(
      `SELECT id, text, pinned, created_at
       FROM clipboard_items
       ORDER BY pinned DESC, created_at DESC
       LIMIT 200`
    )
    .all() as ClipboardRow[]
  return rows.map(rowToItem)
}

function insertClipboardItem(text: string): void {
  const db = getDb()
  const existing = db
    .prepare('SELECT text FROM clipboard_items ORDER BY created_at DESC LIMIT 1')
    .get() as { text: string } | undefined
  if (existing && existing.text === text) return

  db.prepare(
    'INSERT INTO clipboard_items (id, text, pinned, created_at) VALUES (?, ?, 0, ?)'
  ).run(randomUUID(), text, Date.now())

  db.prepare(
    `DELETE FROM clipboard_items
     WHERE pinned = 0 AND id IN (
       SELECT id FROM clipboard_items
       WHERE pinned = 0
       ORDER BY created_at DESC
       LIMIT -1 OFFSET ?
     )`
  ).run(MAX_ITEMS)
}

export function toggleClipboardPin(id: string): void {
  const db = getDb()
  const row = db
    .prepare('SELECT pinned FROM clipboard_items WHERE id = ?')
    .get(id) as { pinned: number } | undefined
  if (!row) {
    throw new Error('NOT_FOUND')
  }
  const next = row.pinned === 1 ? 0 : 1
  db.prepare('UPDATE clipboard_items SET pinned = ? WHERE id = ?').run(next, id)
}

export function deleteClipboardItem(id: string): void {
  const info = getDb().prepare('DELETE FROM clipboard_items WHERE id = ?').run(id)
  if (info.changes === 0) {
    throw new Error('NOT_FOUND')
  }
}

export function copyClipboardItem(id: string): void {
  const row = getDb()
    .prepare('SELECT text FROM clipboard_items WHERE id = ?')
    .get(id) as { text: string } | undefined
  if (!row) {
    throw new Error('NOT_FOUND')
  }
  clipboard.writeText(row.text)
  lastText = row.text
}