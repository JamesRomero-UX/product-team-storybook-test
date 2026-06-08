import { defineWorkspace } from 'vitest/config'

export default defineWorkspace([
  // Use separate workspace files for better organization
  "./vitest.frontend.workspace.js",
  "./vitest.api.workspace.js",
  "./vitest.infrastructure.workspace.js"
])
