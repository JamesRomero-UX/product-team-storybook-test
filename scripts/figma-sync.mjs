/**
 * figma-sync.mjs
 *
 * Keeps Code Connect files in sync with the Storybook.
 * Run: pnpm figma:sync
 */

import fs from 'fs'
import path from 'path'
import { execSync } from 'child_process'
import { fileURLToPath } from 'url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const ROOT = path.resolve(__dirname, '..')
const STORIES_DIR = path.join(ROOT, 'src/cloudscape-reference')
const CODE_CONNECT_DIR = path.join(ROOT, 'src/code-connect')

// ── 1. Scan stories for component imports ────────────────────────────────────

function getStoriesImports() {
  const imports = new Map() // componentName → importPath
  if (!fs.existsSync(STORIES_DIR)) return imports

  const walk = (dir) => {
    for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
      const full = path.join(dir, entry.name)
      if (entry.isDirectory()) { walk(full); continue }
      if (!entry.name.endsWith('.stories.tsx')) continue

      const content = fs.readFileSync(full, 'utf8')
      for (const line of content.split('\n')) {
        const m = line.match(/^import\s+(\w+)\s+from\s+'([^']+)'/)
        if (!m) continue
        const [, name, importPath] = m
        if (
          importPath.startsWith('@storybook') ||
          importPath.startsWith('react') ||
          importPath.includes('_setup') ||
          importPath.includes('_providers') ||
          importPath.startsWith('@types') ||
          name === 'type'
        ) continue
        imports.set(name, importPath)
      }
    }
  }
  walk(STORIES_DIR)
  return imports
}

// ── 2. Scan existing Code Connect files for covered components ───────────────
// Check the actual import statement inside each .figma.tsx — not just filename

function getCoveredComponents() {
  const covered = new Set()
  if (!fs.existsSync(CODE_CONNECT_DIR)) return covered

  for (const file of fs.readdirSync(CODE_CONNECT_DIR)) {
    if (!file.endsWith('.figma.tsx') && !file.endsWith('.figma.ts')) continue
    const content = fs.readFileSync(path.join(CODE_CONNECT_DIR, file), 'utf8')

    // Match: import Foo from '...' or import { Foo } from '...'
    for (const line of content.split('\n')) {
      const m = line.match(/^import\s+(?:\{([^}]+)\}|(\w+))\s+from\s+'[^@][^']*'/)
      if (!m) continue
      const named = m[1] ? m[1].split(',').map(s => s.trim().split(/\s+as\s+/).pop().trim()) : []
      const def = m[2]
      if (def && def !== 'figma' && def !== 'React') covered.add(def)
      for (const n of named) if (n && n !== 'figma' && n !== 'React') covered.add(n)
    }
    // Also match: import Foo from '@risk-smart/...'
    for (const line of content.split('\n')) {
      const m = line.match(/^import\s+(\w+)\s+from\s+'@[^']*'/)
      if (!m) continue
      if (m[1] !== 'figma' && m[1] !== 'React') covered.add(m[1])
    }
  }
  return covered
}

// ── 3. Report ─────────────────────────────────────────────────────────────────

const storyImports = getStoriesImports()
const covered = getCoveredComponents()

console.log(`\n📦 Storybook components found: ${storyImports.size}`)
console.log(`🔗 Code Connect coverage:       ${covered.size} components\n`)

const missing = []
for (const [name, importPath] of storyImports) {
  if (!covered.has(name)) {
    missing.push({ name, importPath })
  }
}

if (missing.length > 0) {
  console.log(`⚠️  Missing Code Connect for ${missing.length} components:`)
  for (const { name, importPath } of missing) {
    console.log(`   - ${name}  (${importPath})`)
  }
  console.log(`\nCreate a .figma.tsx file in src/code-connect/ for each one.\n`)
} else {
  console.log('✅ All Storybook components have Code Connect coverage.\n')
}

// ── 4. Publish ────────────────────────────────────────────────────────────────

console.log('🚀 Publishing Code Connect files to Figma...\n')
try {
  execSync('pnpm figma connect publish', { stdio: 'inherit', cwd: ROOT })
  console.log('\n✅ Published successfully.')
} catch (e) {
  console.error('\n❌ Publish failed. Fix the errors above and retry.')
  process.exit(1)
}
