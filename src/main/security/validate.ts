/**
 * Lightweight runtime validators used by IPC handlers.
 * Never trust data coming from the renderer.
 */

import type { CaptureMode } from '@shared/types/capture'
import type { AppLanguage, ThemeMode } from '@shared/types/settings'

export class ValidationError extends Error {
  constructor(message: string) {
    super(message)
    this.name = 'ValidationError'
  }
}

export interface StringOptions {
  minLength?: number
  maxLength?: number
}

export function assertString(value: unknown, field: string, options?: StringOptions): string {
  if (typeof value !== 'string') {
    throw new ValidationError(`${field} must be a string`)
  }
  const min = options?.minLength ?? 0
  const max = options?.maxLength ?? 10000
  if (value.length < min) {
    throw new ValidationError(`${field} must be at least ${min} characters`)
  }
  if (value.length > max) {
    throw new ValidationError(`${field} must be at most ${max} characters`)
  }
  return value
}

export function assertBoolean(value: unknown, field: string): boolean {
  if (typeof value !== 'boolean') {
    throw new ValidationError(`${field} must be a boolean`)
  }
  return value
}

export function assertNumber(value: unknown, field: string): number {
  if (typeof value !== 'number' || Number.isNaN(value)) {
    throw new ValidationError(`${field} must be a valid number`)
  }
  return value
}

export function assertCaptureMode(value: unknown): CaptureMode {
  if (value !== 'fullscreen' && value !== 'window' && value !== 'region') {
    throw new ValidationError('Invalid capture mode')
  }
  return value
}

export function assertTheme(value: unknown): ThemeMode {
  if (value !== 'light' && value !== 'dark' && value !== 'system') {
    throw new ValidationError('Invalid theme')
  }
  return value
}

export function assertLanguage(value: unknown): AppLanguage {
  if (value !== 'ar' && value !== 'en') {
    throw new ValidationError('Invalid language')
  }
  return value
}

export function assertSafePath(value: unknown, field: string): string {
  const p = assertString(value, field, { minLength: 1, maxLength: 4096 })
  if (p.includes('\0')) {
    throw new ValidationError(`${field} contains null bytes`)
  }
  return p
}

export function isPlainObject(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value)
}