import { z } from 'zod';

const getAuthUrl = () => process.env.AUTH_PROVIDER_URL;

export const createAuthHeaders = (token: string) => ({
  Authorization: `Bearer ${token}`,
});

interface Claim {
  grant_type: string;
  client_id: string;
  user_id: string;
  org_id: string;
  permissions: string;
  exp_hours: string;
  source_service?: string;
}

const authTokenSchema = z.object({
  access_token: z.string(),
  token_type: z.string(),
  expires_in: z.number(),
  scope: z.string(),
});

export const generateTestToken = async (
  claims?: Partial<Claim>
): Promise<string> => {
  const defaultClaims = {
    grant_type: 'client_credentials',
    client_id: 'test-client',
    user_id: 'auth0|test_user_123',
    org_id: 'org_test',
    permissions: 'risks:read',
    exp_hours: '1',
    source_service: 'external-api',
    ...claims,
  };

  const authUrl = getAuthUrl();
  if (!authUrl) {
    throw new Error('authUrl missing for request');
  }

  const response = await fetch(`${getAuthUrl()}/token`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: new URLSearchParams(defaultClaims).toString(),
  });

  if (!response.ok) {
    throw new Error(`Failed to generate token: ${response.status}`);
  }

  const jsonResponse = await response.json();
  const parseResult = authTokenSchema.safeParse(jsonResponse);

  if (!parseResult.success) {
    throw new Error('Failed to parse token response');
  }

  return parseResult.data.access_token;
};
