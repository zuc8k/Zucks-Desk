import { create } from 'zustand'
import type { AppSettings, AppSettingsPatch } from '@shared/types/settings'
import { DEFAULT_SETTINGS } from '@shared/constants'

interface SettingsState {
  settings: AppSettings
  loaded: boolean
  saving: boolean
  load: () => Promise<void>
  update: (patch: AppSettingsPatch) => Promise<boolean>
}

export const useSettingsStore = create<SettingsState>((set, get) => ({
  settings: DEFAULT_SETTINGS,
  loaded: false,
  saving: false,

  load: async (): Promise<void> => {
    if (get().loaded) return
    const result = await window.zucks.settings.get()
    if (result.ok) {
      set({ settings: result.data, loaded: true })
    } else {
      set({ loaded: true })
    }
  },

  update: async (patch: AppSettingsPatch): Promise<boolean> => {
    set({ saving: true })
    const result = await window.zucks.settings.update(patch)
    if (result.ok) {
      set({ settings: result.data, saving: false })
      return true
    }
    set({ saving: false })
    return false
  }
}))