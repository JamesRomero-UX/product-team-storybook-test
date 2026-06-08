#!/usr/bin/env node
/**
 * Generates docs/graphql-migration-tracker.md
 *
 * Scans every GraphQL operation in packages/web-graphql-client/graphql/ and
 * determines whether each one has been wrapped in a tRPC-aware web hook.
 *
 * Detection rule:
 *   MIGRATED — a file under packages/web/src/hooks/ both references
 *              `<OperationName>Document` AND contains `createQueryHook`
 *              or `useIsFeatureVisibleToOrg('trpc')`.
 *   PENDING  — no such hook exists yet.
 *
 * Run:
 *   node scripts/audit-graphql-migrations.mjs
 */

import { readdirSync, readFileSync, writeFileSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const ROOT = join(dirname(__filename), '..');

const GRAPHQL_DIR = join(ROOT, 'packages/web-graphql-client/graphql');
const HOOKS_DIR = join(ROOT, 'packages/web/src/hooks');
const OUTPUT_FILE = join(ROOT, 'docs/graphql-migration-tracker.md');

// ---------------------------------------------------------------------------
// Walk a directory recursively, returning files with the given extension
// ---------------------------------------------------------------------------

function walkDir(dir, ext) {
  const results = [];
  try {
    for (const entry of readdirSync(dir, { withFileTypes: true })) {
      const full = join(dir, entry.name);
      if (entry.isDirectory()) {
        results.push(...walkDir(full, ext));
      } else if (entry.isFile() && entry.name.endsWith(ext)) {
        results.push(full);
      }
    }
  } catch {
    // Ignore unreadable directories
  }
  return results;
}

// ---------------------------------------------------------------------------
// Step 1 — Parse all GraphQL operations grouped by entity directory
// ---------------------------------------------------------------------------

function parseOperations() {
  /** @type {Map<string, Array<{name: string, type: string, entity: string, status: string}>>} */
  const byEntity = new Map();

  for (const filePath of walkDir(GRAPHQL_DIR, '.graphql')) {
    const parts = filePath.replace(ROOT + '/', '').split('/');
    const entity = parts[parts.length - 2]; // parent directory name
    const content = readFileSync(filePath, 'utf-8');

    for (const [, type, name] of content.matchAll(/^(query|mutation)\s+(\w+)/gm)) {
      if (!byEntity.has(entity)) byEntity.set(entity, []);
      byEntity.get(entity).push({ name, type, entity, status: 'PENDING' });
    }
  }

  return byEntity;
}

// ---------------------------------------------------------------------------
// Step 2 — Build the set of Document names found in tRPC bridge hook files
// ---------------------------------------------------------------------------

function findMigratedDocuments() {
  const migrated = new Set();
  const hookFiles = [
    ...walkDir(HOOKS_DIR, '.tsx'),
    ...walkDir(HOOKS_DIR, '.ts'),
  ];

  for (const filePath of hookFiles) {
    const content = readFileSync(filePath, 'utf-8');

    // Only consider files that contain tRPC bridge logic
    const isBridge =
      content.includes('createQueryHook') ||
      content.includes("useIsFeatureVisibleToOrg('trpc')");

    if (!isBridge) continue;

    // Collect every *Document identifier referenced in this file
    for (const [, docName] of content.matchAll(/\b(\w+Document)\b/g)) {
      migrated.add(docName);
    }
  }

  return migrated;
}

// ---------------------------------------------------------------------------
// Step 3 — Mark each operation as MIGRATED or PENDING
// ---------------------------------------------------------------------------

function applyStatus(byEntity, migratedDocs) {
  for (const ops of byEntity.values()) {
    for (const op of ops) {
      // GraphQL codegen capitalises the first letter of the operation name
      // e.g. `insertRisk` → `InsertRiskDocument`
      const docName =
        op.name.charAt(0).toUpperCase() + op.name.slice(1) + 'Document';
      if (migratedDocs.has(docName)) {
        op.status = 'MIGRATED';
      }
    }
  }
}

// ---------------------------------------------------------------------------
// Step 4 — Render markdown
// ---------------------------------------------------------------------------

function renderMarkdown(byEntity) {
  let total = 0;
  let migratedCount = 0;
  let queries = 0;
  let mutations = 0;

  for (const ops of byEntity.values()) {
    for (const op of ops) {
      total++;
      if (op.type === 'query') queries++;
      else mutations++;
      if (op.status === 'MIGRATED') migratedCount++;
    }
  }

  const pending = total - migratedCount;
  const pct = total > 0 ? Math.round((migratedCount / total) * 100) : 0;
  const today = new Date().toISOString().split('T')[0];

  const lines = [
    '# GraphQL-to-tRPC Migration Tracker',
    '',
    '<!-- AUTO-GENERATED — do not edit by hand -->',
    `<!-- Updated: ${today} -->`,
    '<!-- Run: `node scripts/audit-graphql-migrations.mjs` to regenerate -->',
    '',
    '## How to use',
    '',
    'Each `⬜ PENDING` row is a GraphQL operation that needs migrating to the tRPC stack.',
    'Pass the **Operation** name directly to the migration skill:',
    '',
    '```',
    '/migrate-graphql-to-trpc <OperationName>',
    '```',
    '',
    '**Status key:**',
    '- `✅ MIGRATED` — a tRPC-aware web hook wrapping this operation already exists',
    '- `⬜ PENDING` — only the GraphQL path exists; migration not yet started',
    '',
    '---',
    '',
    '## Summary',
    '',
    '| Metric | Count |',
    '|--------|-------|',
    `| Total operations | ${total} |`,
    `| ✅ Migrated | ${migratedCount} |`,
    `| ⬜ Pending | ${pending} |`,
    `| Queries | ${queries} |`,
    `| Mutations | ${mutations} |`,
    `| Progress | ${pct}% |`,
    '',
    '---',
    '',
    '## Operations by Entity',
    '',
    '> Legend: ✅ all migrated · 🔄 partially migrated · ⬜ not started',
    '',
  ];

  // Sort entities alphabetically
  const sorted = [...byEntity.entries()].sort(([a], [b]) => a.localeCompare(b));

  for (const [entity, ops] of sorted) {
    const done = ops.filter((o) => o.status === 'MIGRATED').length;
    const badge = done === ops.length ? '✅' : done > 0 ? '🔄' : '⬜';

    lines.push(`### ${entity} ${badge} ${done}/${ops.length}`);
    lines.push('');
    lines.push('| Operation | Type | Status |');
    lines.push('|-----------|------|--------|');

    // MIGRATED rows first, then alphabetically within each status group
    const sortedOps = [...ops].sort((a, b) => {
      if (a.status !== b.status) return a.status === 'MIGRATED' ? -1 : 1;
      return a.name.localeCompare(b.name);
    });

    for (const op of sortedOps) {
      const icon = op.status === 'MIGRATED' ? '✅ MIGRATED' : '⬜ PENDING';
      lines.push(`| \`${op.name}\` | ${op.type} | ${icon} |`);
    }

    lines.push('');
  }

  return lines.join('\n');
}

// ---------------------------------------------------------------------------
// Main
// ---------------------------------------------------------------------------

function main() {
  process.stdout.write('Parsing GraphQL operations…\n');
  const byEntity = parseOperations();

  process.stdout.write('Scanning hook files for tRPC bridges…\n');
  const migratedDocs = findMigratedDocuments();

  applyStatus(byEntity, migratedDocs);

  const markdown = renderMarkdown(byEntity);
  writeFileSync(OUTPUT_FILE, markdown, 'utf-8');

  let total = 0;
  let migrated = 0;
  for (const ops of byEntity.values()) {
    for (const op of ops) {
      total++;
      if (op.status === 'MIGRATED') migrated++;
    }
  }

  process.stdout.write(
    `\nWritten → docs/graphql-migration-tracker.md\n` +
      `Total: ${total} operations | ✅ Migrated: ${migrated} | ⬜ Pending: ${total - migrated}\n`,
  );
}

main();
