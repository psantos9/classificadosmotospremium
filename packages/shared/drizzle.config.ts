import { defineConfig } from 'drizzle-kit'

export default defineConfig({
  out: './migrations',
  schema: './src/models/database/*.ts',
  dialect: 'sqlite',
  casing: 'camelCase'
})
