import type { Authentication, Bundle, ZObject } from 'zapier-platform-core';

const validateBaseUrl = (raw: unknown): string => {
  const url = String(raw || '');

  try {
    const parsed = new URL(url);
    if (parsed.protocol !== 'https:') {
      throw new Error('API Base URL must use HTTPS');
    }

    return parsed.origin;
  } catch (err) {
    if (err instanceof Error && err.message.includes('HTTPS')) {
      throw err;
    }
    throw new Error(`Invalid API Base URL: ${url}`);
  }
};

const getSessionKey = async (z: ZObject, bundle: Bundle) => {
  const baseUrl = validateBaseUrl(bundle.authData.api_base_url);
  const response = await z.request({
    url: `${baseUrl}/api/v1/auth/token`,
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      clientKey: bundle.authData.client_key,
      clientSecret: bundle.authData.client_secret,
    }),
  });

  // Zapier platform types response.data as `{}`; the auth endpoint returns { accessToken }.
  return { sessionKey: (response.data as { accessToken: string }).accessToken };
};

const test = async (z: ZObject, bundle: Bundle) => {
  const baseUrl = validateBaseUrl(bundle.authData.api_base_url);
  const response = await z.request({
    url: `${baseUrl}/api/v1/risks`,
    params: { page_size: '1' },
  });

  return response.data;
};

export default {
  type: 'session' as const,
  test,
  sessionConfig: {
    perform: getSessionKey,
  },
  fields: [
    {
      key: 'client_key',
      label: 'Client Key',
      type: 'string' as const,
      required: true,
      helpText:
        'Your RiskSmart API client key. Go to [Settings > Integrations > External API](https://app.risksmart.link/settings) in RiskSmart to generate credentials.',
    },
    {
      key: 'client_secret',
      label: 'Client Secret',
      type: 'password' as const,
      required: true,
      helpText:
        'Your RiskSmart API client secret. Go to [Settings > Integrations > External API](https://app.risksmart.link/settings) in RiskSmart to generate credentials.',
    },
    {
      key: 'api_base_url',
      label: 'API Base URL',
      type: 'string' as const,
      required: true,
      helpText:
        'The full RiskSmart API URL for your environment (e.g. `dev-cloud-risksmartapp-tenant.640196420962.risksmart.link`).',
    },
  ],
  connectionLabel: async (z: ZObject, bundle: Bundle): Promise<string> => {
    const url = String(bundle.authData.api_base_url || '');

    try {
      const host = new URL(url).host;

      return `RiskSmart (${host})`;
    } catch {
      return 'RiskSmart';
    }
  },
} satisfies Authentication;
