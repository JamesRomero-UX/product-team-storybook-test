import { z } from 'zod';

const authUrl = process.env.AUTH_PROVIDER_URL;

export const createAuthHeaders = (testUserJwt: string) => ({
  authorization: `bearer ${testUserJwt}`,
});

interface Claim {
  grant_type: string;
  client_id: string;
  user_id: string;
  org_id: string;
  scope: string;
  exp_hours: string;
  source_service?: string;
  hasura_feature_flags?: string;
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
    scope: 'test',
    exp_hours: '1',
    ...claims,
  };

  const response = await fetch(`${authUrl}/token`, {
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
