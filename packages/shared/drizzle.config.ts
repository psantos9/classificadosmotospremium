import { defineConfig } from 'drizzle-kit'

export default defineConfig({
  out: './migrations',
  schema: 'src/models/database/schema.ts',
  dialect: 'sqlite',
  casing: 'camelCase'
})
