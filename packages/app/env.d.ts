/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly MODE: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}

declare const __COMMIT_HASH__: string
declare const __APP_BUILD_TIMESTAMP__: string
declare const __APP_RELEASE__: string
