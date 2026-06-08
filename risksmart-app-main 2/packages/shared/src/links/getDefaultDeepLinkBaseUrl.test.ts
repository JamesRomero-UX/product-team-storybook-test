import { describe, expect, it } from 'vitest';

import { getDefaultDeepLinkBaseUrl } from './getDefaultDeepLinkBaseUrl';

const withEnv = (vars: Record<string, string | undefined>, fn: () => void) => {
  const backup: Record<string, string | undefined> = {};
  for (const k of Object.keys(vars)) {
    backup[k] = process.env[k];
    if (vars[k] === undefined) {
      delete process.env[k];
    } else {
      process.env[k] = vars[k];
    }
  }
  try {
    fn();
  } finally {
    for (const [k, v] of Object.entries(backup)) {
      if (v === undefined) {
        delete process.env[k];
      } else {
        process.env[k] = v;
      }
    }
  }
};

describe('getDefaultDeepLinkBaseUrl', () => {
  it('prefers explicit WEB_APP_BASE_URL', () => {
    withEnv(
      { WEB_APP_BASE_URL: 'https://explicit.example', STAGE: 'prod' },
      () => {
        expect(getDefaultDeepLinkBaseUrl()).toBe('https://explicit.example');
      }
    );
  });

  it('falls back to APP_BASE_URL when WEB_APP_BASE_URL absent', () => {
    withEnv(
      { APP_BASE_URL: 'https://appbase.example', STAGE: 'staging' },
      () => {
        expect(getDefaultDeepLinkBaseUrl()).toBe('https://appbase.example');
      }
    );
  });

  it('maps prod stage to production domain', () => {
    withEnv(
      { STAGE: 'prod', WEB_APP_BASE_URL: undefined, APP_BASE_URL: undefined },
      () => {
        expect(getDefaultDeepLinkBaseUrl()).toBe('https://app.risksmart.link');
      }
    );
  });

  it('maps staging stage to staging domain', () => {
    withEnv(
      {
        STAGE: 'staging',
        WEB_APP_BASE_URL: undefined,
        APP_BASE_URL: undefined,
      },
      () => {
        expect(getDefaultDeepLinkBaseUrl()).toBe(
          'https://staging.risksmart.link'
        );
      }
    );
  });

  it('maps dev-cloud stage to dev-cloud domain', () => {
    withEnv(
      {
        STAGE: 'dev-cloud',
        WEB_APP_BASE_URL: undefined,
        APP_BASE_URL: undefined,
      },
      () => {
        expect(getDefaultDeepLinkBaseUrl()).toBe(
          'https://dev-cloud.risksmart.link'
        );
      }
    );
  });

  it('falls back to localhost when unknown stage', () => {
    withEnv({ STAGE: 'my-feature-branch' }, () => {
      expect(getDefaultDeepLinkBaseUrl()).toBe('http://localhost:3000');
    });
  });

  it('strips trailing slash from explicit env', () => {
    withEnv({ WEB_APP_BASE_URL: 'https://strip.me/' }, () => {
      expect(getDefaultDeepLinkBaseUrl()).toBe('https://strip.me');
    });
  });
});
