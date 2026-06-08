import { SecretsManagerClient } from '@aws-sdk/client-secrets-manager';
import { afterAll, beforeEach, describe, expect, it, vi } from 'vitest';

import { getSecretFromArn } from './getSecretFromArn';

vi.mock('@aws-sdk/client-secrets-manager');
vi.mock('src/logger', () => ({
  getLogger: () => ({
    info: vi.fn(),
    error: vi.fn(),
  }),
}));

describe('getSecretFromArn', () => {
  const mockSecretArn = 'arn:aws:secretsmanager:region:account:secret:name';
  const mockSecretString = JSON.stringify({ key: 'value' });
  const mockSend = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(SecretsManagerClient).mockImplementation(
      () =>
        ({
          send: mockSend,
        }) as unknown as SecretsManagerClient
    );
  });

  afterAll(() => {
    vi.restoreAllMocks();
  });

  it('should retrieve and parse secret successfully', async () => {
    mockSend.mockResolvedValueOnce({
      SecretString: mockSecretString,
    });

    const result = await getSecretFromArn(mockSecretArn);

    expect(result).toEqual({ key: 'value' });
  });

  it('should throw error if SecretString is undefined', async () => {
    mockSend.mockResolvedValueOnce({
      SecretString: undefined,
    });

    await expect(getSecretFromArn(mockSecretArn)).rejects.toThrow(
      'Secret string is empty'
    );
  });

  it('should throw error when SecretsManager throws', async () => {
    const mockError = new Error('AWS SDK error');
    mockSend.mockRejectedValueOnce(mockError);

    await expect(getSecretFromArn(mockSecretArn)).rejects.toThrow(mockError);
  });
});
