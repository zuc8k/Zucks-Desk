import Database from 'better-sqlite3'
import { app } from 'electron'
import { join } from 'node:path'

let db: Database.Database | null = null

export function initDatabase(): void {
  if (db) return
  const dbPath = join(app.getPath('userData'), 'zucks-desk.db')
  db = new Database(dbPath)
  db.pragma('journal_mode = WAL')
  db.pragma('foreign_keys = ON')
  runMigrations(db)
}

export function getDb(): Database.Database {
  if (!db) {
    throw new Error('Database has not been initialized')
  }
  return db
}

export function closeDatabase(): void {
  if (db) {
    try {
      db.close()
    } catch {
      // ignore
    }
    db = null
  }
}

function runMigrations(database: Database.Database): void {
  const current = (database.pragma('user_version', { simple: true }) as number) ?? 0

  if (current < 1) {
    database.exec(`
      CREATE TABLE IF NOT EXISTS settings (
        key TEXT PRIMARY KEY,
        value TEXT NOT NULL
      );

      CREATE TABLE IF NOT EXISTS notes (
        id TEXT PRIMARY KEY,
        title TEXT NOT NULL,
        body TEXT NOT NULL,
        pinned INTEGER NOT NULL DEFAULT 0,
        created_at INTEGER NOT NULL,
        updated_at INTEGER NOT NULL
      );

      CREATE TABLE IF NOT EXISTS clipboard_items (
        id TEXT PRIMARY KEY,
        text TEXT NOT NULL,
        pinned INTEGER NOT NULL DEFAULT 0,
        created_at INTEGER NOT NULL
      );

      CREATE TABLE IF NOT EXISTS capture_history (
        id TEXT PRIMARY KEY,
        kind TEXT NOT NULL,
        file_path TEXT NOT NULL,
        thumbnail_data_url TEXT NOT NULL,
        created_at INTEGER NOT NULL
      );

      CREATE INDEX IF NOT EXISTS idx_clipboard_created ON clipboard_items(created_at DESC);
      CREATE INDEX IF NOT EXISTS idx_notes_updated ON notes(updated_at DESC);
      CREATE INDEX IF NOT EXISTS idx_capture_created ON capture_history(created_at DESC);
    `)
    database.pragma('user_version = 1')
  }
}