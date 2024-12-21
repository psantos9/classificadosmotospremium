import { fileURLToPath, URL } from 'node:url'
import vue from '@vitejs/plugin-vue'
import { adjectives, animals, uniqueNamesGenerator } from 'unique-names-generator'
import { defineConfig, type UserConfig } from 'vite'
import vueDevTools from 'vite-plugin-vue-devtools'

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  const releaseVersion = process.env.npm_package_version

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
      __APP_VERSION__: JSON.stringify(releaseVersion),
      __APP_BUILD_TIMESTAMP__: releaseTimestamp,
      __APP_RELEASE__: JSON.stringify(releaseName)
    },
    build: {
      sourcemap: ['production', 'staging'].includes(mode)
    }
  }
  return config
})
