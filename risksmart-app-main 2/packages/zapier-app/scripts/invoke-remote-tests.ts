/**
 * Layer 2: Zapier Invoke Tests
 *
 * Runs each action/search through the Zapier CLI `invoke` command.
 *
 * Two modes:
 *   (default)  Runs code locally through the Zapier CLI runtime.
 *              Works with port-forwarded or staging APIs. No push needed.
 *              Auth data is read from ZAPIER_INTEGRATION_* env vars
 *              (or .env.integration file).
 *
 *   --remote   Runs on Zapier's actual servers against a pushed snapshot.
 *              Requires `pnpm run test:invoke-push` first.
 *              API must be publicly reachable from Zapier.
 *
 * Usage:
 *   pnpm run test:invoke           # local mode
 *   pnpm run test:invoke-push      # push snapshot 0.0.0-<whoami>
 *   pnpm run test:invoke-remote    # remote mode
 *
 * Environment variables:
 *   ZAPIER_INTEGRATION_CLIENT_KEY     Required for local mode
 *   ZAPIER_INTEGRATION_CLIENT_SECRET  Required for local mode
 *   ZAPIER_INTEGRATION_API_BASE_URL   Required for local mode
 *   ZAPIER_INVOKE_SNAPSHOT_SUFFIX     Override snapshot suffix (default: whoami)
 *   ZAPIER_INVOKE_VERSION             Override version for remote mode
 *   ZAPIER_INVOKE_AUTH_ID             Zapier authentication ID for remote mode
 *   ZAPIER_INVOKE_DEBUG               Set to 'true' for verbose output
 */

import { execFileSync, execSync } from 'node:child_process';
import { existsSync, readFileSync, unlinkSync, writeFileSync } from 'node:fs';
import { resolve } from 'node:path';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface TestEntry {
  type: 'auth' | 'search' | 'create';
  key: string;
  description: string;
  inputData: Record<string, unknown>;
  assertions: (result: unknown) => void;
}

interface TestResult {
  key: string;
  description: string;
  isPassed: boolean;
  isSkipped?: boolean;
  error?: string;
}

// ---------------------------------------------------------------------------
// Config
// ---------------------------------------------------------------------------

const remote = process.argv.includes('--remote');
const snapshotSuffix =
  process.env.ZAPIER_INVOKE_SNAPSHOT_SUFFIX ??
  execSync('whoami', { encoding: 'utf-8' }).trim();
const version =
  process.env.ZAPIER_INVOKE_VERSION ?? `0.0.0-${snapshotSuffix}`;
const authId = process.env.ZAPIER_INVOKE_AUTH_ID ?? '-';
const debug = process.env.ZAPIER_INVOKE_DEBUG === 'true';
const cwd = resolve(import.meta.dirname, '..');
const dotEnvPath = resolve(cwd, '.env');

// Strip pnpm-specific npm_config_* env vars that npm/npx doesn't recognise
// and suppress npm warnings from .npmrc project config it can't parse.
const cleanEnv: Record<string, string | undefined> = {
  ...Object.fromEntries(
    Object.entries(process.env).filter(([key]) => !key.startsWith('npm_'))
  ),
  npm_config_loglevel: 'error',
};

// ---------------------------------------------------------------------------
// .env management for local mode
//
// `zapier-platform invoke` (local) reads auth fields from .env in the project root.
// We write it from ZAPIER_INTEGRATION_* env vars before running, and clean
// up after. If a .env already exists, we leave it alone.
// ---------------------------------------------------------------------------

let createdDotEnv = false;

function ensureDotEnv(): void {
  if (remote) {
    return;
  }

  if (existsSync(dotEnvPath)) {
    // User already has a .env — respect it
    return;
  }

  const clientKey = process.env.ZAPIER_INTEGRATION_CLIENT_KEY;
  const clientSecret = process.env.ZAPIER_INTEGRATION_CLIENT_SECRET;
  const apiBaseUrl = process.env.ZAPIER_INTEGRATION_API_BASE_URL;

  if (!clientKey || !clientSecret || !apiBaseUrl) {
    // Try loading from .env.integration
    const integrationEnvPath = resolve(cwd, '.env.integration');
    if (existsSync(integrationEnvPath)) {
      const content = readFileSync(integrationEnvPath, 'utf-8');
      for (const line of content.split('\n')) {
        const trimmed = line.trim();
        if (!trimmed || trimmed.startsWith('#')) {
          continue;
        }
        const eqIdx = trimmed.indexOf('=');
        if (eqIdx > 0) {
          const key = trimmed.slice(0, eqIdx);
          const value = trimmed.slice(eqIdx + 1);
          process.env[key] = value;
        }
      }
    }
  }

  const ck = process.env.ZAPIER_INTEGRATION_CLIENT_KEY;
  const cs = process.env.ZAPIER_INTEGRATION_CLIENT_SECRET;
  const url = process.env.ZAPIER_INTEGRATION_API_BASE_URL;

  if (!ck || !cs || !url) {
    throw new Error(
      'Local invoke mode requires auth credentials.\n' +
        'Set ZAPIER_INTEGRATION_CLIENT_KEY, ZAPIER_INTEGRATION_CLIENT_SECRET,\n' +
        'and ZAPIER_INTEGRATION_API_BASE_URL env vars, or create .env.integration.'
    );
  }

  // Write the auth fields with authData_ prefix as zapier-platform invoke expects.
  // The CLI's loadAuthDataFromEnv() strips the prefix and populates bundle.authData.
  writeFileSync(
    dotEnvPath,
    `authData_client_key=${ck}\nauthData_client_secret=${cs}\nauthData_api_base_url=${url}\n`
  );
  createdDotEnv = true;
}

function cleanupDotEnv(): void {
  if (createdDotEnv && existsSync(dotEnvPath)) {
    unlinkSync(dotEnvPath);
  }
}

// ---------------------------------------------------------------------------
// Session refresh for local mode
//
// `zapier-platform invoke` in local mode does NOT automatically run the session auth
// exchange. We must call `auth refresh` first, which exchanges the client
// credentials for a session key and appends it to the .env file.
// ---------------------------------------------------------------------------

function refreshSession(): void {
  if (remote) {
    return;
  }

  if (debug) {
    console.log('  [session] Refreshing session key via auth refresh...');
  }

  try {
    execFileSync(
      'npx',
      ['zapier-platform', 'invoke', 'auth', 'refresh', '--non-interactive'],
      {
        cwd,
        encoding: 'utf-8',
        timeout: 30_000,
        env: cleanEnv,
        stdio: debug ? 'inherit' : 'pipe',
      }
    );
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    throw new Error(`Session refresh failed: ${message}`);
  }
}

// ---------------------------------------------------------------------------
// JSON parsing
//
// `zapier-platform invoke` outputs JSON mixed with other text (warnings, logs).
// We extract the first JSON object or array from the output.
// ---------------------------------------------------------------------------

function parseJsonOutput(output: string): unknown {
  const objStart = output.indexOf('{');
  const arrStart = output.indexOf('[');

  if (objStart === -1 && arrStart === -1) {
    throw new Error(`No JSON found in output: ${output.slice(0, 200)}`);
  }

  const jsonStart =
    objStart === -1
      ? arrStart
      : arrStart === -1
        ? objStart
        : Math.min(objStart, arrStart);

  const closer = output[jsonStart] === '{' ? '}' : ']';
  const jsonEnd = output.lastIndexOf(closer);

  if (jsonEnd <= jsonStart) {
    throw new Error(`Malformed JSON in output: ${output.slice(0, 200)}`);
  }

  return JSON.parse(output.slice(jsonStart, jsonEnd + 1));
}

// ---------------------------------------------------------------------------
// Invoke helper
// ---------------------------------------------------------------------------

function invoke(
  type: 'auth' | 'search' | 'create',
  key: string,
  inputData: Record<string, unknown>
): unknown {
  const inputJson = JSON.stringify(inputData);

  const args = [
    'zapier-platform',
    'invoke',
    type,
    key,
    '--inputData',
    inputJson,
    '--non-interactive',
  ];

  if (remote) {
    args.push('--authentication-id', authId);
    args.push('--version', version);
    args.push('--remote');
  }

  if (debug) {
    console.log(`  [invoke] npx ${args.join(' ')}`);
  }

  try {
    const output = execFileSync('npx', args, {
      cwd,
      encoding: 'utf-8',
      timeout: 60_000,
      env: cleanEnv,
    });

    return parseJsonOutput(output);
  } catch (err) {
    // 403 means the action works but the API client lacks scope for this
    // resource. Treat it as a successful invocation (scope is a config issue,
    // not a code bug).
    const message = err instanceof Error ? err.message : String(err);
    if (message.includes('403') && message.includes('Insufficient scope')) {
      return { _skipped: true, reason: 'insufficient_scope' };
    }
    throw new Error(`invoke ${type} ${key} failed: ${message}`);
  }
}

function assert(condition: boolean, message: string): void {
  if (!condition) {
    throw new Error(`Assertion failed: ${message}`);
  }
}

// ---------------------------------------------------------------------------
// Test manifest
// ---------------------------------------------------------------------------

function buildManifest(): TestEntry[] {
  const entries: TestEntry[] = [];

  // Auth: test endpoint (local mode only — remote mode handles auth internally)
  if (!remote) {
    entries.push({
      type: 'auth',
      key: 'test',
      description: 'Auth test endpoint succeeds',
      inputData: {},
      assertions: (result) => {
        assert(result != null, 'auth test should return a result');
      },
    });
  }

  // ---------------------------------------------------------------------------
  // Assertion helpers
  //
  // All helpers first check for { _skipped: true } — returned when the API
  // client lacks scope for a resource (403). This is not a code bug.
  // ---------------------------------------------------------------------------

  const isSkipped = (result: unknown): boolean =>
    result != null &&
    typeof result === 'object' &&
    (result as Record<string, unknown>)._skipped === true;

  // List searches: local returns { results: [...], paging_token: ... }
  // Remote returns [...] (Zapier unwraps the results)
  const assertListResult = (result: unknown) => {
    if (isSkipped(result)) return;
    if (remote) {
      assert(Array.isArray(result), 'result should be an array');
    } else {
      const r = result as Record<string, unknown>;
      assert(Array.isArray(r.results), 'results should be an array');
      assert(
        r.paging_token === null || typeof r.paging_token === 'string',
        'paging_token should be null or string'
      );
    }
  };

  // Find-by-ID searches: local returns [item] or [], remote returns [item] or []
  const assertFindResult = (result: unknown) => {
    if (isSkipped(result)) return;
    assert(Array.isArray(result), 'result should be an array');
  };

  // Super Zap (enrichment) searches: same as find but may return richer objects
  const assertEnrichmentResult = (result: unknown) => {
    if (isSkipped(result)) return;
    assert(Array.isArray(result), 'result should be an array');
  };

  // ---------------------------------------------------------------------------
  // List searches (11)
  // ---------------------------------------------------------------------------

  const listSearches = [
    'list_risks',
    'list_indicators',
    'list_controls',
    'list_actions',
    'list_issues',
    'list_policies',
    'list_assessments',
    'list_obligations',
    'list_third_parties',
    'list_enterprise_risks',
    'list_impacts',
  ];

  for (const key of listSearches) {
    const label = key.replace(/_/g, ' ');
    entries.push({
      type: 'search',
      key,
      description: `${label} returns results`,
      inputData: { page_size: 2 },
      assertions: assertListResult,
    });
  }

  // ---------------------------------------------------------------------------
  // Find-by-ID searches (12) — use a nonexistent ID; expect empty array (not error)
  // ---------------------------------------------------------------------------

  const findSearches = [
    'find_risk',
    'find_indicator',
    'find_control',
    'find_action',
    'find_issue',
    'find_policy',
    'find_assessment',
    'find_obligation',
    'find_third_party',
    'find_enterprise_risk',
    'find_impact',
    'find_user',
  ];

  for (const key of findSearches) {
    const label = key.replace(/_/g, ' ');
    entries.push({
      type: 'search',
      key,
      description: `${label} handles missing ID gracefully`,
      inputData: { id: '00000000-0000-0000-0000-000000000000' },
      assertions: assertFindResult,
    });
  }

  // ---------------------------------------------------------------------------
  // Super Zap / enrichment searches (5)
  // These require valid IDs to return data, so we test with a nonexistent ID
  // to verify they don't error out.
  // ---------------------------------------------------------------------------

  const ownerSearches = [
    'find_actions_by_owner',
    'find_issues_by_owner',
    'find_risks_by_owner',
  ];

  for (const key of ownerSearches) {
    const label = key.replace(/_/g, ' ');
    entries.push({
      type: 'search',
      key,
      description: `${label} handles missing owner gracefully`,
      inputData: { owner_id: '00000000-0000-0000-0000-000000000000' },
      assertions: assertEnrichmentResult,
    });
  }

  entries.push({
    type: 'search',
    key: 'get_risk_overview',
    description: 'get risk overview handles missing ID gracefully',
    inputData: { id: '00000000-0000-0000-0000-000000000000' },
    assertions: assertEnrichmentResult,
  });

  entries.push({
    type: 'search',
    key: 'get_issue_details',
    description: 'get issue details handles missing ID gracefully',
    inputData: { id: '00000000-0000-0000-0000-000000000000' },
    assertions: assertEnrichmentResult,
  });

  return entries;
}

// ---------------------------------------------------------------------------
// Runner
// ---------------------------------------------------------------------------

async function main() {
  const mode = remote ? 'remote' : 'local';
  console.log(`\nZapier Invoke Tests (${mode})`);
  if (remote) {
    console.log(`  Version: ${version}`);
    console.log(`  Auth ID: ${authId}`);
  }
  console.log('');

  ensureDotEnv();
  refreshSession();

  const manifest = buildManifest();
  const results: TestResult[] = [];

  try {
    for (const entry of manifest) {
      process.stdout.write(`  ${entry.description} ... `);
      try {
        const result = invoke(entry.type, entry.key, entry.inputData);

        // Check if the invocation was skipped due to insufficient scope
        const isSkipped =
          result != null &&
          typeof result === 'object' &&
          (result as Record<string, unknown>)._skipped === true;

        entry.assertions(result);
        results.push({
          key: entry.key,
          description: entry.description,
          isPassed: true,
          isSkipped,
        });
        console.log(isSkipped ? 'SKIP (insufficient scope)' : 'PASS');
      } catch (err) {
        const message = err instanceof Error ? err.message : String(err);
        results.push({
          key: entry.key,
          description: entry.description,
          isPassed: false,
          error: message,
        });
        console.log('FAIL');
        if (debug) {
          console.log(`    ${message}`);
        }
      }
    }
  } finally {
    cleanupDotEnv();
  }

  // Summary
  const passed = results.filter((r) => r.isPassed && !r.isSkipped).length;
  const skipped = results.filter((r) => r.isSkipped).length;
  const failed = results.filter((r) => !r.isPassed).length;

  const parts = [`${passed} passed`];
  if (skipped > 0) parts.push(`${skipped} skipped`);
  if (failed > 0) parts.push(`${failed} failed`);
  parts.push(`${results.length} total`);

  console.log(`\n  Results: ${parts.join(', ')}\n`);

  if (failed > 0) {
    console.log('  Failures:');
    for (const r of results.filter((r) => !r.isPassed)) {
      console.log(`    - ${r.description}: ${r.error}`);
    }
    console.log('');
    process.exit(1);
  }
}

main().catch((err) => {
  cleanupDotEnv();
  console.error('Fatal error:', err);
  process.exit(1);
});
