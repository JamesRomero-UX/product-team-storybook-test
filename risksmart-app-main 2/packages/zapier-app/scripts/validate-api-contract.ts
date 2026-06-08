#!/usr/bin/env tsx
/**
 * Validates that the current external-api schemas have not introduced
 * breaking changes relative to the committed contract snapshot.
 *
 * Usage:
 *   pnpm exec tsx scripts/validate-api-contract.ts
 *
 * Exit codes:
 *   0 — no breaking changes detected
 *   1 — breaking changes detected (details printed to stderr)
 *   2 — snapshot file missing or unreadable
 */

import { readFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

import {
  type ContractSnapshot,
  detectBreakingChanges,
  generateSnapshot,
} from './lib/snapshot.js';

const __dirname = dirname(fileURLToPath(import.meta.url));
const snapshotPath = resolve(__dirname, '..', 'api-contract.snapshot.json');

// ---------------------------------------------------------------------------
// Load committed snapshot
// ---------------------------------------------------------------------------

let committedSnapshot: ContractSnapshot;

try {
  const raw = readFileSync(snapshotPath, 'utf-8');
  committedSnapshot = JSON.parse(raw) as ContractSnapshot;
} catch (err) {
  process.stderr.write(
    `Failed to read snapshot at ${snapshotPath}.\n` +
      'Run "pnpm exec tsx scripts/generate-api-snapshot.ts" to create it.\n' +
      `${err}\n`
  );
  process.exit(2);
}

// ---------------------------------------------------------------------------
// Generate fresh snapshot from current schemas
// ---------------------------------------------------------------------------

const currentSnapshot = generateSnapshot();

// ---------------------------------------------------------------------------
// Detect breaking changes
// ---------------------------------------------------------------------------

const breakingChanges = detectBreakingChanges(
  committedSnapshot,
  currentSnapshot
);

if (breakingChanges.length === 0) {
  process.stdout.write('No breaking changes detected. Contract is valid.\n');
  process.exit(0);
}

process.stderr.write(
  `\nBreaking changes detected (${breakingChanges.length}):\n\n`
);

for (const change of breakingChanges) {
  process.stderr.write(`  [${change.kind}] ${change.detail}\n`);
  process.stderr.write(`    at ${change.path}\n\n`);
}

process.stderr.write(
  'The Zapier app must be updated to handle these changes.\n' +
    'After updating, regenerate the snapshot:\n' +
    '  pnpm exec tsx scripts/generate-api-snapshot.ts\n'
);

process.exit(1);
