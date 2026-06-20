/// <reference types="vite/client" />

interface ImportMetaEnv {
  /** Base URL for question audio assets (e.g. an R2 public bucket URL). Defaults to "/audio". */
  readonly VITE_AUDIO_BASE_URL?: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}
