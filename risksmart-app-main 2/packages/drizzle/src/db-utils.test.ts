import { getTenantConfigFromDynamoDB } from '@risksmart-app/tenant-configuration/src/adaptors/database/index';
import * as pg from 'pg';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import type { PoolEntry } from './db-utils';
import {
  createConnectionPool,
  normalizeConnectionString,
  tenantPools,
} from './db-utils';
import { getEnv } from './utils/index';
// Mock functions using vi.hoisted to ensure they're available during module loading
const { mockDynamoSend, mockSecretsSend } = vi.hoisted(() => ({
  mockDynamoSend: vi.fn(),
  mockSecretsSend: vi.fn(),
}));

vi.mock(
  '@risksmart-app/tenant-configuration/src/adaptors/database/index',
  () => ({
    getTenantConfigFromDynamoDB: vi.fn(),
  })
);

// Mock modules
vi.mock('pg', () => ({
  Pool: vi.fn(() => ({
    end: vi.fn().mockResolvedValue(undefined),
  })),
}));

vi.mock('@aws-sdk/client-dynamodb', () => ({
  DynamoDBClient: vi.fn(() => ({
    send: mockDynamoSend,
  })),
  GetItemCommand: vi.fn(),
}));

vi.mock('@aws-sdk/client-secrets-manager', () => ({
  SecretsManagerClient: vi.fn(() => ({
    send: mockSecretsSend,
  })),
  GetSecretValueCommand: vi.fn(),
}));

vi.mock('./utils/environment.js', () => ({
  getEnv: vi.fn(),
}));

vi.mock('./utils/logger.js', () => ({
  logger: {
    info: vi.fn(),
    error: vi.fn(),
    warn: vi.fn(),
  },
}));

// Mock the tenant-config module
vi.mock('./utils/tenant-config.js', () => ({
  getTenantConfigFromDynamoDB: vi.fn(),
}));

describe('db-utils', () => {
  let mockPool: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    vi.clearAllMocks();
    tenantPools.clear();
    vi.useFakeTimers();

    // Reset mock functions
    mockPool = vi.mocked(pg.Pool);
    vi.mocked(getTenantConfigFromDynamoDB).mockReset();

    // Ensure all mocks return undefined by default to prevent unexpected behaviors
    mockDynamoSend.mockReset();
    mockSecretsSend.mockReset();
  });

  describe('normalizeConnectionString', () => {
    it('should convert sslmode=require to sslmode=verify-full', () => {
      const input =
        'postgresql://user:pass@host:5432/db?sslmode=require&param=value';
      const result = normalizeConnectionString(input);

      expect(result).toContain('sslmode=verify-full');
      expect(result).not.toContain('sslmode=require');
      expect(result).toContain('param=value');
    });

    it('should convert sslmode=prefer to sslmode=verify-full', () => {
      const input = 'postgresql://user:pass@host:5432/db?sslmode=prefer';
      const result = normalizeConnectionString(input);

      expect(result).toContain('sslmode=verify-full');
      expect(result).not.toContain('sslmode=prefer');
    });

    it('should convert sslmode=verify-ca to sslmode=verify-full', () => {
      const input = 'postgresql://user:pass@host:5432/db?sslmode=verify-ca';
      const result = normalizeConnectionString(input);

      expect(result).toContain('sslmode=verify-full');
      expect(result).not.toContain('sslmode=verify-ca');
    });

    it('should not modify sslmode=verify-full', () => {
      const input = 'postgresql://user:pass@host:5432/db?sslmode=verify-full';
      const result = normalizeConnectionString(input);

      expect(result).toBe(input);
    });

    it('should not modify sslmode=disable', () => {
      const input = 'postgresql://user:pass@host:5432/db?sslmode=disable';
      const result = normalizeConnectionString(input);

      expect(result).toBe(input);
    });

    it('should not modify connection string without sslmode', () => {
      const input = 'postgresql://user:pass@host:5432/db?param=value';
      const result = normalizeConnectionString(input);

      expect(result).toBe(input);
    });

    it('should handle connection string without query parameters', () => {
      const input = 'postgresql://user:pass@host:5432/db';
      const result = normalizeConnectionString(input);

      expect(result).toBe(input);
    });

    it('should preserve multiple query parameters when normalizing sslmode', () => {
      const input =
        'postgresql://user:pass@host:5432/db?sslmode=require&connect_timeout=10&application_name=myapp';
      const result = normalizeConnectionString(input);

      expect(result).toContain('sslmode=verify-full');
      expect(result).toContain('connect_timeout=10');
      expect(result).toContain('application_name=myapp');
    });

    it('should return original string if URL parsing fails', () => {
      const input = 'invalid-connection-string';
      const result = normalizeConnectionString(input);

      expect(result).toBe(input);
    });

    it('should handle connection string with encoded characters', () => {
      const input =
        'postgresql://user:p%40ss@host:5432/db?sslmode=require&name=test%20app';
      const result = normalizeConnectionString(input);

      expect(result).toContain('sslmode=verify-full');
      expect(result).toContain('p%40ss');
      // URL class converts %20 to + in query parameters, which is standard behavior
      expect(result).toContain('name=test+app');
    });
  });

  describe('createConnectionPool', () => {
    beforeEach(() => {
      // Reset getEnv mock to avoid interference between tests
      vi.mocked(getEnv).mockReset();
      tenantPools.clear();
      vi.mocked(getEnv).mockImplementation((key) => {
        if (key === 'TENANT_CONFIG_TABLE') {
          return 'tenant-table';
        }
        if (key === 'IS_LOCAL') {
          return 'false';
        }
        if (key === 'AWS_REGION') {
          return 'eu-west-2';
        }

        throw new Error(`Unexpected getEnv call for key: ${key}`);
      });
    });

    it('should create local pool when IS_LOCAL is true', async () => {
      const localConnectionString = 'postgresql://localhost:5432/db';
      vi.mocked(getEnv).mockImplementation((key) => {
        if (key === 'TENANT_CONFIG_TABLE') {
          return 'tenant-table';
        }
        if (key === 'IS_LOCAL') {
          return 'true';
        }
        if (key === 'AWS_REGION') {
          return 'eu-west-2';
        }

        return localConnectionString;
      });

      const result = await createConnectionPool('local-tenant');

      expect(mockPool).toHaveBeenCalledWith({
        connectionString: localConnectionString,
        max: 30,
      });
      expect(tenantPools.get('local-tenant')).toBeDefined();
      expect(result.writer).toBeDefined();
      expect(result.readers).toHaveLength(0);
    });

    it('should reuse existing non-stale pool', async () => {
      vi.stubEnv('IS_LOCAL', 'false');
      const existingConnectionString = 'postgresql://user:pass@host:5432/db';
      const writer = mockPool() as pg.Pool;
      const existingPool: PoolEntry = {
        writer,
        readers: [],
        createdAt: Date.now(),
        writerConnectionString: existingConnectionString,
        readerConnectionStrings: [],
      };
      tenantPools.set('test-tenant', existingPool);

      // Mock the environment variables that would be used if we needed to create a new pool
      vi.mocked(getEnv).mockImplementation((key) => {
        if (key === 'TENANT_CONFIG_TABLE') {
          return 'tenant-table';
        }

        return existingConnectionString;
      });

      const result = await createConnectionPool('test-tenant');

      expect(result).toBe(existingPool);
      expect(mockPool).toHaveBeenCalledTimes(1); // Only called to create the test pool
      expect(mockDynamoSend).not.toHaveBeenCalled();
      expect(mockSecretsSend).not.toHaveBeenCalled();
    });

    it('should create new pool when existing pool is stale', async () => {
      vi.stubEnv('IS_LOCAL', 'false');
      const staleConnectionString = 'postgresql://old:pass@host:5432/db';
      const newConnectionString = 'postgresql://new:pass@host:5432/db';

      // Create a stale pool
      const writerPool = mockPool() as pg.Pool;
      const endSpy = vi.spyOn(writerPool, 'end');
      const stalePool: PoolEntry = {
        writer: writerPool,
        readers: [],
        createdAt: Date.now() - 3700000, // older than 1 hour
        writerConnectionString: staleConnectionString,
        readerConnectionStrings: [],
      };
      tenantPools.set('test-tenant', stalePool);

      // Mock tenant config response
      vi.mocked(getTenantConfigFromDynamoDB).mockResolvedValue({
        tenant: 'test-tenant',
        databases: [
          { secretArn: 'writer-secret-arn', type: 'writer' },
          { secretArn: 'reader-secret-arn', type: 'reader' },
        ],
        region: 'eu-west-2',
      });

      // Mock SecretsManager response
      mockSecretsSend
        .mockResolvedValueOnce({ SecretString: newConnectionString }) // writer
        .mockResolvedValueOnce({ SecretString: 'reader-connection' }); // reader

      const result = await createConnectionPool('test-tenant');

      expect(result).not.toBe(stalePool);
      expect(endSpy).toHaveBeenCalled();
      expect(mockPool).toHaveBeenCalledWith({
        connectionString: 'reader-connection',
      });
      expect(getTenantConfigFromDynamoDB).toHaveBeenCalledWith(
        'test-tenant',
        'eu-west-2'
      );
      expect(mockSecretsSend).toHaveBeenCalled();
    });

    it('should handle missing writer database configuration', async () => {
      // Mock tenant config with only reader databases
      vi.mocked(getTenantConfigFromDynamoDB).mockResolvedValue({
        tenant: 'test-tenant',
        databases: [{ secretArn: 'reader-secret-arn', type: 'reader' }],
        region: 'eu-west-2',
      });

      await expect(createConnectionPool('test-tenant')).rejects.toThrow(
        'No writer database configured for tenant: test-tenant'
      );
    });

    it('should handle secret manager errors', async () => {
      vi.stubEnv('IS_LOCAL', 'false');

      // Mock tenant config response
      vi.mocked(getTenantConfigFromDynamoDB).mockResolvedValue({
        tenant: 'test-tenant',
        databases: [
          { secretArn: 'writer-secret-arn', type: 'writer' },
          { secretArn: 'reader-secret-arn', type: 'reader' },
        ],
        region: 'eu-west-2',
      });

      mockSecretsSend.mockRejectedValue(new Error('Secret not found'));

      await expect(createConnectionPool('test-tenant')).rejects.toThrow(
        'Secret not found'
      );
    });

    it('should handle dynamodb errors', async () => {
      vi.stubEnv('IS_LOCAL', 'false');

      // Mock tenant config to throw an error
      vi.mocked(getTenantConfigFromDynamoDB).mockRejectedValue(
        new Error('DynamoDB error')
      );

      await expect(createConnectionPool('test-tenant')).rejects.toThrow(
        'DynamoDB error'
      );
    });

    it('should create pool with multiple readers', async () => {
      vi.stubEnv('IS_LOCAL', 'false');
      const writerConnectionString = 'postgresql://writer:pass@host:5432/db';
      const readerConnectionStrings = [
        'postgresql://reader1:pass@host:5432/db',
        'postgresql://reader2:pass@host:5432/db',
      ];

      // Mock tenant config with multiple readers
      vi.mocked(getTenantConfigFromDynamoDB).mockResolvedValue({
        tenant: 'test-tenant',
        databases: [
          { secretArn: 'writer-secret-arn', type: 'writer' },
          { secretArn: 'reader1-secret-arn', type: 'reader' },
          { secretArn: 'reader2-secret-arn', type: 'reader' },
        ],
        region: 'eu-west-2',
      });

      mockSecretsSend
        .mockResolvedValueOnce({ SecretString: writerConnectionString })
        .mockResolvedValueOnce({ SecretString: readerConnectionStrings[0] })
        .mockResolvedValueOnce({ SecretString: readerConnectionStrings[1] });

      const result = await createConnectionPool('test-tenant');

      expect(result.writer).toBeDefined();
      expect(result.readers).toHaveLength(2);
      expect(mockPool).toHaveBeenCalledTimes(3); // 1 writer + 2 readers
      expect(mockPool).toHaveBeenCalledWith({
        connectionString: writerConnectionString,
      });
      expect(mockPool).toHaveBeenCalledWith({
        connectionString: readerConnectionStrings[0],
      });
      expect(mockPool).toHaveBeenCalledWith({
        connectionString: readerConnectionStrings[1],
      });
      expect(tenantPools.get('test-tenant')).toBe(result);
    });
  });
});
