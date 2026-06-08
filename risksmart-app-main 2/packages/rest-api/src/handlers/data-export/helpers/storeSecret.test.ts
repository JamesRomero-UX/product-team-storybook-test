import { SecretsManagerClient } from '@aws-sdk/client-secrets-manager';
import {
  DataExportScheduleFrequencyEnum,
  DataExportScheduleStorageTypeEnum,
} from 'generated/graphql';
import { afterAll, beforeEach, describe, expect, it, vi } from 'vitest';

import { storeSecret } from './storeSecret';

vi.mock('@aws-sdk/client-secrets-manager', () => ({
  SecretsManagerClient: vi.fn(),
  CreateSecretCommand: vi.fn().mockImplementation((input) => ({ input })),
  DescribeSecretCommand: vi.fn().mockImplementation((input) => ({ input })),
  PutSecretValueCommand: vi.fn().mockImplementation((input) => ({ input })),
  ResourceNotFoundException: class extends Error {
    constructor(message: string) {
      super(message);
      this.name = 'ResourceNotFoundException';
    }
  },
}));

vi.mock('src/logger', () => ({
  getLogger: vi.fn(() => ({
    info: vi.fn(),
    error: vi.fn(),
  })),
}));

describe('storeSecret', () => {
  const mockSecretsManager = {
    send: vi.fn(),
  };

  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(SecretsManagerClient).mockReturnValue(
      mockSecretsManager as unknown as SecretsManagerClient
    );
    process.env.SST_STAGE = 'test';
  });

  afterAll(() => {
    vi.restoreAllMocks();
  });

  const mockSharePointInput = {
    tenant: 'test-tenant',
    orgKey: 'test-org',
    inputObject: {
      frequency: DataExportScheduleFrequencyEnum.Daily,
      storageType: DataExportScheduleStorageTypeEnum.MsSharePoint,
      entraSecretValue: 'secret-value',
      entraTenantId: 'tenant-id',
      entraClientId: 'client-id',
      sharePointSiteId: 'site-id',
      sharePointDriveId: 'drive-id',
      spFolder: 'folder-path',
    },
  };

  const mockSftpInput = {
    tenant: 'test-tenant',
    orgKey: 'test-org',
    inputObject: {
      frequency: DataExportScheduleFrequencyEnum.Daily,
      storageType: DataExportScheduleStorageTypeEnum.Sftp,
      hostname: 'sftp.example.com',
      port: 22,
      username: 'testuser',
      password: 'testpassword',
    },
  };

  describe('SharePoint secret', () => {
    it('should update existing SharePoint secret successfully', async () => {
      const mockArn =
        'arn:aws:secretsmanager:us-east-1:123456789:secret:test-secret';
      mockSecretsManager.send.mockResolvedValueOnce({ ARN: mockArn });

      const result = await storeSecret(mockSharePointInput);

      expect(result).toBe(mockArn);
      expect(mockSecretsManager.send).toHaveBeenCalledTimes(1);
      expect(mockSecretsManager.send).toHaveBeenCalledWith(
        expect.objectContaining({
          input: expect.objectContaining({
            SecretId: 'test-SharePoint-data-export-schedule-secret-test-org',
            SecretString: expect.any(String),
          }),
        })
      );
    });

    it('should create new SharePoint secret when it does not exist', async () => {
      const mockArn =
        'arn:aws:secretsmanager:us-east-1:123456789:secret:test-secret';
      const resourceNotFoundError = new Error('ResourceNotFoundException');
      resourceNotFoundError.name = 'ResourceNotFoundException';

      mockSecretsManager.send
        .mockRejectedValueOnce(resourceNotFoundError)
        .mockResolvedValueOnce({ ARN: mockArn });

      const result = await storeSecret(mockSharePointInput);

      expect(result).toBe(mockArn);
      expect(mockSecretsManager.send).toHaveBeenCalledTimes(2);
      // First call: PutSecretValue (fails with ResourceNotFoundException)
      expect(mockSecretsManager.send).toHaveBeenNthCalledWith(
        1,
        expect.objectContaining({
          input: expect.objectContaining({
            SecretId: 'test-SharePoint-data-export-schedule-secret-test-org',
          }),
        })
      );
      // Second call: CreateSecret (succeeds)
      expect(mockSecretsManager.send).toHaveBeenNthCalledWith(
        2,
        expect.objectContaining({
          input: expect.objectContaining({
            Name: 'test-SharePoint-data-export-schedule-secret-test-org',
          }),
        })
      );
    });

    it('should build correct secret name for SharePoint', async () => {
      const mockArn =
        'arn:aws:secretsmanager:us-east-1:123456789:secret:test-secret';
      mockSecretsManager.send.mockResolvedValueOnce({ ARN: mockArn });

      await storeSecret(mockSharePointInput);

      expect(mockSecretsManager.send).toHaveBeenCalledWith(
        expect.objectContaining({
          input: expect.objectContaining({
            SecretId: 'test-SharePoint-data-export-schedule-secret-test-org',
          }),
        })
      );
    });

    it('should build correct secret value for SharePoint', async () => {
      const mockArn =
        'arn:aws:secretsmanager:us-east-1:123456789:secret:test-secret';
      mockSecretsManager.send.mockResolvedValueOnce({ ARN: mockArn });

      await storeSecret(mockSharePointInput);

      const expectedSecretValue = JSON.stringify({
        tenant: 'test-tenant',
        orgKey: 'test-org',
        entraSecretValue: 'secret-value',
        entraTenantId: 'tenant-id',
        entraClientId: 'client-id',
        sharePointSiteId: 'site-id',
        sharePointDriveId: 'drive-id',
        sPFolder: 'folder-path',
      });

      expect(mockSecretsManager.send).toHaveBeenCalledWith(
        expect.objectContaining({
          input: expect.objectContaining({
            SecretString: expectedSecretValue,
          }),
        })
      );
    });
  });

  describe('SFTP secret', () => {
    it('should update existing SFTP secret successfully', async () => {
      const mockArn =
        'arn:aws:secretsmanager:us-east-1:123456789:secret:test-secret';
      mockSecretsManager.send.mockResolvedValueOnce({ ARN: mockArn });

      const result = await storeSecret(mockSftpInput);

      expect(result).toBe(mockArn);
      expect(mockSecretsManager.send).toHaveBeenCalledTimes(1);
    });

    it('should create new SFTP secret when it does not exist', async () => {
      const mockArn =
        'arn:aws:secretsmanager:us-east-1:123456789:secret:test-secret';
      const resourceNotFoundError = new Error('ResourceNotFoundException');
      resourceNotFoundError.name = 'ResourceNotFoundException';

      mockSecretsManager.send
        .mockRejectedValueOnce(resourceNotFoundError)
        .mockResolvedValueOnce({ ARN: mockArn });

      const result = await storeSecret(mockSftpInput);

      expect(result).toBe(mockArn);
      expect(mockSecretsManager.send).toHaveBeenCalledTimes(2);
    });

    it('should build correct secret name for SFTP', async () => {
      const mockArn =
        'arn:aws:secretsmanager:us-east-1:123456789:secret:test-secret';
      mockSecretsManager.send.mockResolvedValueOnce({ ARN: mockArn });

      await storeSecret(mockSftpInput);

      expect(mockSecretsManager.send).toHaveBeenCalledWith(
        expect.objectContaining({
          input: expect.objectContaining({
            SecretId: 'test-SFTP-data-export-schedule-secret-test-org',
          }),
        })
      );
    });

    it('should build correct secret value for SFTP', async () => {
      const mockArn =
        'arn:aws:secretsmanager:us-east-1:123456789:secret:test-secret';
      mockSecretsManager.send.mockResolvedValueOnce({ ARN: mockArn });

      await storeSecret(mockSftpInput);

      const expectedSecretValue = JSON.stringify({
        tenant: 'test-tenant',
        orgKey: 'test-org',
        hostname: 'sftp.example.com',
        port: 22,
        username: 'testuser',
        password: 'testpassword',
      });

      expect(mockSecretsManager.send).toHaveBeenCalledWith(
        expect.objectContaining({
          input: expect.objectContaining({
            SecretString: expectedSecretValue,
          }),
        })
      );
    });
  });

  describe('Error handling', () => {
    it('should throw error when update operation fails with non-ResourceNotFoundException', async () => {
      const genericError = new Error('Generic AWS error');
      mockSecretsManager.send.mockRejectedValueOnce(genericError);

      await expect(storeSecret(mockSharePointInput)).rejects.toThrow(
        'Generic AWS error'
      );
    });

    it('should throw error when create operation fails', async () => {
      const resourceNotFoundError = new Error('ResourceNotFoundException');
      resourceNotFoundError.name = 'ResourceNotFoundException';
      const createError = new Error('Create failed');

      mockSecretsManager.send
        .mockRejectedValueOnce(resourceNotFoundError)
        .mockRejectedValueOnce(createError);

      await expect(storeSecret(mockSharePointInput)).rejects.toThrow(
        'Create failed'
      );
    });
  });
});
