import { createAppTester } from 'zapier-platform-core';

import App from '../../src/index.js';

/**
 * Zapier's official test harness. Runs the full middleware chain
 * (auth token exchange, error handling, retry) in-process,
 * making real HTTP calls to the staging API.
 *
 * Note: `createAppTester` does NOT retry on RefreshAuthError (that's
 * handled by Zapier's backend in production). We pre-fetch the session
 * key via `initSession()` and include it in every bundle.
 */
export const appTester = createAppTester(App);

/** Unique prefix for test-created entities. Enables cleanup and identification. */
export const TEST_PREFIX = `[zapier-int-${Date.now()}]`;

/** Returns the owner ID from env, used when creating entities. */
export function ownerId(): string {
  return process.env.ZAPIER_INTEGRATION_OWNER_ID!;
}

/** Cached session key, populated by `initSession()`. */
let sessionKey: string | undefined;

/**
 * Exchanges client credentials for a session token.
 * Must be called once before tests that make authenticated API requests.
 */
export async function initSession(): Promise<string> {
  if (sessionKey) {
    return sessionKey;
  }

  const result = await appTester(
    App.authentication.sessionConfig.perform,
    {
      authData: {
        client_key: process.env.ZAPIER_INTEGRATION_CLIENT_KEY!,
        client_secret: process.env.ZAPIER_INTEGRATION_CLIENT_SECRET!,
        api_base_url: process.env.ZAPIER_INTEGRATION_API_BASE_URL!,
      },
      inputData: {},
    }
  );

  sessionKey = result.sessionKey as string;
  return sessionKey;
}

/**
 * Builds a partial Bundle with auth credentials + pre-fetched session key.
 * Merges optional inputData for action/search calls.
 *
 * Must call `initSession()` first (typically in `beforeAll`).
 */
export function authBundle(inputData: Record<string, unknown> = {}) {
  if (!sessionKey) {
    throw new Error(
      'Session not initialized. Call `await initSession()` in beforeAll.'
    );
  }

  return {
    authData: {
      client_key: process.env.ZAPIER_INTEGRATION_CLIENT_KEY!,
      client_secret: process.env.ZAPIER_INTEGRATION_CLIENT_SECRET!,
      api_base_url: process.env.ZAPIER_INTEGRATION_API_BASE_URL!,
      sessionKey,
    },
    inputData,
  };
}

/**
 * Builds a bundle with ONLY the raw auth fields (no session key).
 * Used for testing the session exchange itself.
 */
export function rawAuthBundle(inputData: Record<string, unknown> = {}) {
  return {
    authData: {
      client_key: process.env.ZAPIER_INTEGRATION_CLIENT_KEY!,
      client_secret: process.env.ZAPIER_INTEGRATION_CLIENT_SECRET!,
      api_base_url: process.env.ZAPIER_INTEGRATION_API_BASE_URL!,
    },
    inputData,
  };
}
