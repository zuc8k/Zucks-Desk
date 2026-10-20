/// <reference types="vite/client" />

import type { ZucksApi } from '@shared/api-contract'

declare global {
  interface Window {
    zucks: ZucksApi
  }
}

export {}