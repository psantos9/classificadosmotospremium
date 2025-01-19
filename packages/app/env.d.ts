/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly MODE: string
  readonly VITE_MIXPANEL_TOKEN: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}

declare const __API_BASE_URL__: string
declare const __GIT_COMMIT_HASH__: string
declare const __GIT_COMMIT_BRANCH__: string
declare const __APP_BUILD_TIMESTAMP__: string
declare const __CLOUDFLARE_TURNSTILE_SITEKEY__: string
