import { execSync } from 'node:child_process'
import { fileURLToPath, URL } from 'node:url'
import vue from '@vitejs/plugin-vue'
import { defineConfig, type UserConfig } from 'vite'
// import vueDevTools from 'vite-plugin-vue-devtools'

const branch = execSync('git rev-parse --abbrev-ref HEAD').toString('utf-8')
const commitHash = execSync('git rev-parse --short HEAD').toString('utf-8')

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  const releaseTimestamp = new Date().getTime()

  const config: UserConfig = {
    server: {
      host: '0.0.0.0'
    },
    plugins: [
      vue({
        template: {
          compilerOptions: {
            isCustomElement: tag => ['swiper-container', 'swiper-slide'].includes(tag)
          }
        }
      })
      // vueDevTools()
    ],
    resolve: {
      alias: {
        '@': fileURLToPath(new URL('./src', import.meta.url))
      }
    },
    define: {
      __API_BASE_URL__: JSON.stringify(mode === 'production' ? 'https://backend.classificadosmotospremium.com.br' : mode === 'preview' ? 'https://backend.preview.classificadosmotospremium.com.br' : 'http://localhost:8088'),
      __GIT_COMMIT_HASH__: JSON.stringify(commitHash),
      __GIT_COMMIT_BRANCH__: JSON.stringify(branch),
      __APP_BUILD_TIMESTAMP__: releaseTimestamp,
      __CLOUDFLARE_TURNSTILE_SITEKEY__: JSON.stringify(mode === 'production' ? '0x4AAAAAAA5fXJjiHC8VPgfl' : mode === 'preview' ? '0x4AAAAAAA5fWSTx7823F7do' : '3x00000000000000000000FF')
    },
    build: {
      sourcemap: ['production', 'staging'].includes(mode)
    }
  }
  return config
})
