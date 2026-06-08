import {
  GetSecretValueCommand,
  SecretsManagerClient,
} from '@aws-sdk/client-secrets-manager';
import { afterAll, beforeEach, describe, expect, it, vi } from 'vitest';

import { getConfig } from './config';

vi.mock('@aws-sdk/client-secrets-manager');
vi.mock('src/logger', () => ({
  getLogger: () => ({
    info: vi.fn(),
    error: vi.fn(),
  }),
}));

describe('getConfig', () => {
  const mockSecretId = 'test-secret-id';
  const mockJiraConfig = {
    JiraBaseUrl: 'https://test.atlassian.net',
    JiraApiToken: 'test-api-token-123',
  };
  const mockSend = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(SecretsManagerClient).mockImplementation(
      () =>
        ({
          send: mockSend,
        }) as unknown as SecretsManagerClient
    );
    vi.mocked(GetSecretValueCommand).mockImplementation(
      (input) => input as unknown as GetSecretValueCommand
    );
  });

  afterAll(() => {
    vi.restoreAllMocks();
  });

  it('should retrieve and parse Jira configuration successfully', async () => {
    mockSend.mockResolvedValueOnce({
      SecretString: JSON.stringify(mockJiraConfig),
    });

    const result = await getConfig(mockSecretId);

    expect(result).toEqual(mockJiraConfig);
    expect(GetSecretValueCommand).toHaveBeenCalledWith({
      SecretId: mockSecretId,
    });
    expect(mockSend).toHaveBeenCalledTimes(1);
  });

  it('should throw error when SecretString contains invalid JSON', async () => {
    mockSend.mockResolvedValueOnce({
      SecretString: 'invalid-json{',
    });

    await expect(getConfig(mockSecretId)).rejects.toThrow();
  });

  it('should throw error when SecretsManager service fails', async () => {
    const mockError = new Error('SecretsManager service error');
    mockSend.mockRejectedValueOnce(mockError);

    await expect(getConfig(mockSecretId)).rejects.toThrow(mockError);
  });
});
