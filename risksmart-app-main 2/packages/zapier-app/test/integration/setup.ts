/**
 * Integration test setup.
 *
 * Unlike the unit test setup, this does NOT import nock or disable network.
 * Integration tests make real HTTP calls to the staging API.
 *
 * Loads credentials from .env.integration if present.
 */

import { existsSync, readFileSync } from 'node:fs';
import { resolve } from 'node:path';

// Load .env.integration if it exists (does not override existing env vars)
const envPath = resolve(import.meta.dirname, '../../.env.integration');
if (existsSync(envPath)) {
  const content = readFileSync(envPath, 'utf-8');
  for (const line of content.split('\n')) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) continue;
    const eqIdx = trimmed.indexOf('=');
    if (eqIdx > 0) {
      const key = trimmed.slice(0, eqIdx);
      const value = trimmed.slice(eqIdx + 1);
      if (!process.env[key]) {
        process.env[key] = value;
      }
    }
  }
}

const REQUIRED_ENV_VARS = [
  'ZAPIER_INTEGRATION_CLIENT_KEY',
  'ZAPIER_INTEGRATION_CLIENT_SECRET',
  'ZAPIER_INTEGRATION_API_BASE_URL',
  'ZAPIER_INTEGRATION_OWNER_ID',
] as const;

const missing = REQUIRED_ENV_VARS.filter((key) => !process.env[key]);

if (missing.length > 0) {
  throw new Error(
    `Missing required environment variables for integration tests:\n` +
      `  ${missing.join('\n  ')}\n\n` +
      `Copy .env.integration.example to .env.integration and fill in staging credentials.`
  );
}
