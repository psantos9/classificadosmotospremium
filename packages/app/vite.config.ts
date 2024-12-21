import { execSync } from 'node:child_process'
import { fileURLToPath, URL } from 'node:url'
import vue from '@vitejs/plugin-vue'
import { adjectives, animals, uniqueNamesGenerator } from 'unique-names-generator'
import { defineConfig, type UserConfig } from 'vite'
import vueDevTools from 'vite-plugin-vue-devtools'

const commitHash = execSync('git rev-parse --short HEAD').toString('utf-8')

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  const releaseName = uniqueNamesGenerator({
    dictionaries: [adjectives, animals],
    separator: '-',
    length: 2
  })

  const releaseTimestamp = new Date().getTime()

  const config: UserConfig = {
    plugins: [
      vue(),
      vueDevTools()
    ],
    resolve: {
      alias: {
        '@': fileURLToPath(new URL('./src', import.meta.url))
      }
    },
    define: {
      __API_BASE_URL: mode === 'production' ? 'https://backend.classificadosmotospremium.com.br' : mode === 'preview' ? 'https://backend.preview.classificadosmotospremium.com.br' : 'http://localhost:8088',
      __COMMIT_HASH__: JSON.stringify(commitHash),
      __APP_BUILD_TIMESTAMP__: releaseTimestamp,
      __APP_RELEASE__: JSON.stringify(releaseName)
    },
    build: {
      sourcemap: ['production', 'staging'].includes(mode)
    }
  }
  return config
})
