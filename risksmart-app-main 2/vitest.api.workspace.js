import { defineWorkspace } from 'vitest/config'

export default defineWorkspace([
  "./packages/rest-api/vite.config.js",
  "./packages/scim-api/vite.config.js",
  "./packages/auth/vitest.config.ts",
  "./packages/data-import/vitest.config.ts",
])
