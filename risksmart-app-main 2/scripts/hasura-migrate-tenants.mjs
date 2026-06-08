#!/usr/bin/env node
// no-dd-sa:javascript-best-practices/no-console

/**
 * Migrates Hasura for multiple tenants from a single runner using
 * child-process parallelism instead of a GitHub Actions matrix.
 *
 * Environment variables:
 *   TENANT_KEYS            — comma-separated tenant keys (required)
 *   HASURA_ENDPOINT_PATTERN — URL with {tenantKey} placeholder (required)
 *   HASURA_ADMIN_SECRET    — shared admin secret (required)
 *   HASURA_WORKDIR         — path to Hasura project (default: api-stack/hasura)
 *   MAX_PARALLEL           — concurrency limit (default: 5)
 */

import { execFile } from 'node:child_process';
import { resolve } from 'node:path';
import { existsSync } from 'node:fs';

// ---------------------------------------------------------------------------
// Config
// ---------------------------------------------------------------------------

const TENANT_KEYS = (process.env.TENANT_KEYS ?? '')
  .split(',')
  .map((k) => k.trim())
  .filter(Boolean);

const ENDPOINT_PATTERN = process.env.HASURA_ENDPOINT_PATTERN ?? '';
const ADMIN_SECRET = process.env.HASURA_ADMIN_SECRET ?? '';
const WORKDIR = resolve(process.env.HASURA_WORKDIR ?? 'api-stack/hasura');
const MAX_PARALLEL = Math.max(1, Number(process.env.MAX_PARALLEL) || 5);

// ---------------------------------------------------------------------------
// Validation
// ---------------------------------------------------------------------------

const errors = [];
if (TENANT_KEYS.length === 0) errors.push('TENANT_KEYS is empty or not set');
if (!ENDPOINT_PATTERN) errors.push('HASURA_ENDPOINT_PATTERN is not set');
if (!ENDPOINT_PATTERN.includes('{tenantKey}'))
  errors.push('HASURA_ENDPOINT_PATTERN must contain {tenantKey} placeholder');
if (!ADMIN_SECRET) errors.push('HASURA_ADMIN_SECRET is not set');
if (!existsSync(WORKDIR))
  errors.push(`HASURA_WORKDIR does not exist: ${WORKDIR}`);

if (errors.length > 0) {
  console.error('Configuration errors:');
  errors.forEach((e) => console.error(`  - ${e}`));
  process.exit(1);
}

// ---------------------------------------------------------------------------
// Resolve hasura binary
// ---------------------------------------------------------------------------

function findHasuraBin() {
  // Prefer the pnpm-installed binary
  const candidates = [
    resolve('node_modules', '.bin', 'hasura'),
    resolve('node_modules', 'hasura-cli', 'hasura'),
  ];
  for (const candidate of candidates) {
    if (existsSync(candidate)) return candidate;
  }
  // Fallback: rely on PATH
  return 'hasura';
}

const HASURA_BIN = findHasuraBin();

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/** Run a single hasura command, streaming output prefixed with [tenantKey]. */
function runHasuraCommand(tenantKey, args) {
  return new Promise((resolve, reject) => {
    const endpoint = ENDPOINT_PATTERN.replace('{tenantKey}', tenantKey);
    const fullArgs = [
      ...args,
      '--endpoint',
      endpoint,
      '--project',
      WORKDIR,
      '--skip-update-check',
    ];

    const child = execFile(HASURA_BIN, fullArgs, {
      maxBuffer: 10 * 1024 * 1024,
      timeout: 10 * 60 * 1000, // 10 minutes per command to handle large migrations
      env: { ...process.env, HASURA_GRAPHQL_ADMIN_SECRET: ADMIN_SECRET },
    });

    const prefix = `[${tenantKey}]`;

    child.stdout?.on('data', (data) => {
      for (const line of data.toString().split('\n')) {
        if (line) process.stdout.write(`${prefix} ${line}\n`);
      }
    });

    child.stderr?.on('data', (data) => {
      for (const line of data.toString().split('\n')) {
        if (line) process.stderr.write(`${prefix} ${line}\n`);
      }
    });

    child.on('error', (err) => reject(err));
    child.on('close', (code, signal) => {
      if (code === 0) resolve();
      else if (signal)
        reject(
          new Error(
            `Command killed by signal ${signal}${child.killed ? ' (timeout)' : ''}`
          )
        );
      else reject(new Error(`Command exited with code ${code}`));
    });
  });
}

/** Migrate a single tenant (3 sequential hasura commands). */
async function migrateTenant(tenantKey) {
  const steps = [
    { name: 'migrate apply', args: ['migrate', 'apply', '--all-databases'] },
    { name: 'metadata apply', args: ['metadata', 'apply'] },
    { name: 'metadata reload', args: ['metadata', 'reload'] },
    {
      name: 'metadata consistency check',
      args: ['metadata', 'inconsistency', 'status'],
    },
  ];

  for (const step of steps) {
    console.log(`[${tenantKey}] Starting: ${step.name}`);
    await runHasuraCommand(tenantKey, step.args);
    console.log(`[${tenantKey}] Completed: ${step.name}`);
  }
}

/**
 * Promise-pool: run an async function over items with bounded concurrency.
 * No external dependencies required.
 */
async function promisePool(items, concurrency, fn) {
  const results = new Map();
  const queue = [...items];
  const workers = [];

  for (let i = 0; i < Math.min(concurrency, items.length); i++) {
    workers.push(
      (async () => {
        while (queue.length > 0) {
          const item = queue.shift();
          try {
            await fn(item);
            results.set(item, { ok: true });
          } catch (err) {
            results.set(item, { ok: false, error: err });
          }
        }
      })()
    );
  }

  await Promise.all(workers);
  return results;
}

// ---------------------------------------------------------------------------
// Main
// ---------------------------------------------------------------------------

console.log(
  `Migrating ${TENANT_KEYS.length} tenant(s) with concurrency ${MAX_PARALLEL}`
);
console.log(`Tenants: ${TENANT_KEYS.join(', ')}`);
console.log(`Hasura binary: ${HASURA_BIN}`);
console.log(`Work directory: ${WORKDIR}`);
console.log('');

const results = await promisePool(
  TENANT_KEYS,
  MAX_PARALLEL,
  async (tenantKey) => {
    const start = Date.now();
    console.log(`[${tenantKey}] Starting migration`);
    await migrateTenant(tenantKey);
    const elapsed = ((Date.now() - start) / 1000).toFixed(1);
    console.log(`[${tenantKey}] Migration completed in ${elapsed}s`);
  }
);

// ---------------------------------------------------------------------------
// Summary
// ---------------------------------------------------------------------------

console.log('');
console.log('='.repeat(60));
console.log('Migration Summary');
console.log('='.repeat(60));

const succeeded = [];
const failed = [];

for (const [tenant, result] of results) {
  if (result.ok) {
    succeeded.push(tenant);
    console.log(`  ✓ ${tenant}`);
  } else {
    failed.push(tenant);
    console.error(`  ✗ ${tenant}: ${result.error.message}`);
  }
}

console.log('='.repeat(60));
console.log(
  `Succeeded: ${succeeded.length}  Failed: ${failed.length}  Total: ${TENANT_KEYS.length}`
);

if (failed.length > 0) {
  console.error(`\nFailed tenants: ${failed.join(', ')}`);
  process.exit(1);
}
