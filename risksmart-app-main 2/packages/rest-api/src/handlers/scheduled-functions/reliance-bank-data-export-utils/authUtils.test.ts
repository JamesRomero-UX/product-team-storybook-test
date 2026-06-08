import { afterAll, afterEach, describe, expect, vi } from 'vitest';

import { getCredentials } from './authUtils';

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

describe('getCredentials', () => {
  it('returns secret', async () => {
    vi.stubEnv('ENTRA_SECRET_NAME', 'test-secret-name');

    mockedSecretsManagerClientSend.mockResolvedValueOnce({
      SecretString: '{"testKey": "testValue"}',
    });

    const expectedResult = {
      testKey: 'testValue',
    };
    const result = await getCredentials();

    expect(result).toEqual(expectedResult);
  });

  it('throws if environment variable not set', async () => {
    vi.stubEnv('ENTRA_SECRET_NAME', undefined);

    const expectedErrorMessage =
      'Environment variable ENTRA_SECRET_NAME is not defined';

    await expect(getCredentials()).rejects.toThrowError(
      expect.objectContaining({
        message: expectedErrorMessage,
      })
    );
  });

  it('throws if failed to retrieve secret', async () => {
    vi.stubEnv('ENTRA_SECRET_NAME', 'test-secret-name');
    const expectedErrorMessage = 'Something went wrong';
    mockedSecretsManagerClientSend.mockRejectedValueOnce(
      new Error(expectedErrorMessage)
    );

    await expect(getCredentials()).rejects.toThrowError(
      expect.objectContaining({
        message: expectedErrorMessage,
      })
    );
  });
});
