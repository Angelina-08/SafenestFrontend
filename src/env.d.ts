/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_PEXELS_API: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}
