import { beforeAll, describe, expect, it } from 'vitest';

import authentication from '../../src/authentication.js';
import App from '../../src/index.js';
import {
  appTester,
  authBundle,
  initSession,
  rawAuthBundle,
} from './helpers.js';

describe('Authentication (integration)', () => {
  beforeAll(async () => {
    await initSession();
  });

  it('exchanges client credentials for a session key', async () => {
    const result = await appTester(
      App.authentication.sessionConfig.perform,
      rawAuthBundle()
    );

    expect(result).toHaveProperty('sessionKey');
    expect(typeof result.sessionKey).toBe('string');
    expect(result.sessionKey.length).toBeGreaterThan(0);
  });

  it('passes the auth test endpoint', async () => {
    const result = await appTester(
      authentication.test,
      authBundle()
    );

    // The test function fetches /risks?page_size=1 — should return data
    expect(result).toBeDefined();
  });

  it('returns a connection label containing the API host', async () => {
    const label = await appTester(
      authentication.connectionLabel!,
      authBundle()
    );

    expect(typeof label).toBe('string');
    expect(label).toContain('RiskSmart');
    // Should contain the host from the API base URL
    const host = new URL(process.env.ZAPIER_INTEGRATION_API_BASE_URL!).host;
    expect(label).toContain(host);
  });
});
