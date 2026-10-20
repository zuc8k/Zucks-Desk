import { create } from 'zustand'

export type ToastKind = 'success' | 'error' | 'info'

export interface ToastMessage {
  id: string
  kind: ToastKind
  message: string
}

interface UiState {
  toasts: ToastMessage[]
  pushToast: (kind: ToastKind, message: string) => void
  dismissToast: (id: string) => void
}

let counter = 0

export const useUiStore = create<UiState>((set) => ({
  toasts: [],
  pushToast: (kind, message) => {
    counter += 1
    const id = `toast-${counter}`
    set((state) => ({ toasts: [...state.toasts, { id, kind, message }] }))
    setTimeout(() => {
      set((state) => ({ toasts: state.toasts.filter((t) => t.id !== id) }))
    }, 4000)
  },
  dismissToast: (id) =>
    set((state) => ({ toasts: state.toasts.filter((t) => t.id !== id) }))
}))