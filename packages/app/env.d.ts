/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly MODE: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}

declare const __API_BASE_URL__: string
declare const __GIT_COMMIT_HASH__: string
declare const __GIT_COMMIT_BRANCH__: string
declare const __APP_BUILD_TIMESTAMP__: string
