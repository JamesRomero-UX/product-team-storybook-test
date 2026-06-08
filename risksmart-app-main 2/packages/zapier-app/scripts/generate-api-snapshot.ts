#!/usr/bin/env tsx
/**
 * Generates the API contract snapshot that captures the OpenAPI schemas
 * the Zapier app depends on.
 *
 * Usage:
 *   pnpm exec tsx scripts/generate-api-snapshot.ts
 *
 * The output file (api-contract.snapshot.json) should be committed to version
 * control so that `validate-api-contract.ts` can compare future API changes
 * against it.
 */

import { writeFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

import { generateSnapshot } from './lib/snapshot.js';

const __dirname = dirname(fileURLToPath(import.meta.url));
const snapshotPath = resolve(__dirname, '..', 'api-contract.snapshot.json');

const snapshot = generateSnapshot();

writeFileSync(snapshotPath, JSON.stringify(snapshot, null, 2) + '\n', 'utf-8');

process.stdout.write(`Snapshot written to ${snapshotPath}\n`);
process.stdout.write(`  version : ${snapshot.version}\n`);
process.stdout.write(`  paths   : ${Object.keys(snapshot.paths).length}\n`);
process.stdout.write(`  schemas : ${Object.keys(snapshot.schemas).length}\n`);
