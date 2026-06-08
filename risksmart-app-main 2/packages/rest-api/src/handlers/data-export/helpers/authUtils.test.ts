import type { SharePointCredentials } from 'src/handlers/data-export/types';
import { afterAll, afterEach, describe, expect, vi } from 'vitest';

import { getMicrosoftGraphApiAccessToken } from './authUtils';

const mockedSecretsManagerClientSend = vi.fn();
const mockedAcquireTokenByClientCredential = vi.fn();

vi.mock('src/logger', () => ({
  getLogger: vi.fn(() => ({
    info: vi.fn(),
    error: vi.fn(),
    warn: vi.fn(),
  })),
}));

vi.mock('@aws-sdk/client-secrets-manager', () => {
  return {
    SecretsManagerClient: vi.fn().mockImplementation(() => ({
      send: mockedSecretsManagerClientSend,
    })),
    GetSecretValueCommand: vi.fn(),
  };
});

vi.mock('@azure/msal-node', () => {
  return {
    ConfidentialClientApplication: vi.fn().mockImplementation(() => ({
      acquireTokenByClientCredential: mockedAcquireTokenByClientCredential,
    })),
  };
});

afterEach(() => {
  vi.clearAllMocks();
});

afterAll(() => {
  vi.restoreAllMocks();
  vi.unstubAllEnvs();
});

describe('getGraphApiAccessToken', () => {
  const credentials: SharePointCredentials = {
    entraSecretValue: 'testSecretValue',
    entraClientId: 'testClientId',
    entraTenantId: 'testTenantId',
    tenant: 'testTenant',
    orgKey: 'testOrgKey',
    sharePointSiteId: 'testSiteId',
    sharePointDriveId: 'testDriveId',
  };

  it('returns an access token', async () => {
    const tokenString = 'test token string';
    mockedAcquireTokenByClientCredential.mockResolvedValueOnce({
      accessToken: tokenString,
    });

    const result = await getMicrosoftGraphApiAccessToken(credentials);
    expect(result).toEqual(tokenString);
  });

  it('throws if token is missing from response', async () => {
    mockedAcquireTokenByClientCredential.mockResolvedValueOnce({});

    await expect(
      getMicrosoftGraphApiAccessToken(credentials)
    ).rejects.toThrowError(
      expect.objectContaining({
        message: 'Bearer token missing from response',
      })
    );
  });

  it('throws if token acquisition fails', async () => {
    const expectedErrorMessage = 'Something went wrong';
    mockedAcquireTokenByClientCredential.mockRejectedValueOnce(
      new Error(expectedErrorMessage)
    );

    await expect(
      getMicrosoftGraphApiAccessToken(credentials)
    ).rejects.toThrowError(
      expect.objectContaining({
        message: expectedErrorMessage,
      })
    );
  });
});
