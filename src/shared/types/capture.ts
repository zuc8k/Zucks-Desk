/**
 * Capture and recording domain types shared between main and renderer.
 */

export type CaptureMode = 'fullscreen' | 'window' | 'region'

export interface CaptureRequest {
  mode: CaptureMode
}

export interface CaptureResult {
  id: string
  filePath: string
  thumbnailDataUrl: string
  width: number
  height: number
  createdAt: number
  mode: CaptureMode
}

export interface ScreenSource {
  id: string
  name: string
  thumbnailDataUrl: string
  displayId: string | null
  appIconDataUrl: string | null
}

export interface RecordingOptions {
  sourceId: string
  includeAudio: boolean
  fps: 30 | 60
}

export interface RecordingResult {
  id: string
  filePath: string
  durationMs: number
  sizeBytes: number
  createdAt: number
}

export interface CaptureHistoryItem {
  id: string
  kind: 'image' | 'video'
  filePath: string
  thumbnailDataUrl: string
  createdAt: number
}