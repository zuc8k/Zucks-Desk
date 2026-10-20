/**
 * Notes domain types.
 */

export interface Note {
  id: string
  title: string
  body: string
  pinned: boolean
  createdAt: number
  updatedAt: number
}

export interface NoteCreateInput {
  title: string
  body: string
}

export interface NoteUpdateInput {
  id: string
  title?: string
  body?: string
  pinned?: boolean
}