import {
  GetSecretValueCommand,
  SecretsManagerClient,
} from '@aws-sdk/client-secrets-manager';
import type { TenantConfig } from '@risksmart-app/domain/src/types/index';
import { getTenantConfigFromDynamoDB } from '@risksmart-app/tenant-configuration/src/adaptors/database/index';
import * as pg from 'pg';

import { getEnv, logger } from './utils/index';

const isLocal = () => getEnv('IS_LOCAL', true) === 'true';
const awsRegion = () => getEnv('AWS_REGION', false);
const secretsManager = new SecretsManagerClient({});

// Time in milliseconds after which a pool connection should be considered stale
const POOL_TTL = parseInt(process.env.TENANT_POOL_TTL ?? '3600000', 10); // Default 1 hour

export interface PoolEntry {
  writer: pg.Pool;
  readers: pg.Pool[];
  createdAt: number;
  writerConnectionString: string;
  readerConnectionStrings: string[];
}

export const tenantPools = new Map<string, PoolEntry>();

// Cleanup function to close stale connections
const cleanupStalePool = async (
  tenant: string,
  pool: PoolEntry
): Promise<void> => {
  try {
    await pool.writer.end();
    await Promise.all(pool.readers.map((reader) => reader.end()));
    tenantPools.delete(tenant);
    logger.info({ tenant }, 'Closed stale connection pool');
  } catch (error) {
    logger.error({ error, tenant }, 'Error closing stale connection pool');
  }
};

// Check if a pool is stale
const isPoolStale = (pool: PoolEntry): boolean => {
  return Date.now() - pool.createdAt > POOL_TTL;
};

export const normalizeConnectionString = (connectionString: string): string => {
  try {
    const url = new URL(connectionString);
    const sslMode = url.searchParams.get('sslmode');

    // If sslmode is 'prefer', 'require', or 'verify-ca', change it to 'verify-full'
    // to suppress the security warning
    if (sslMode && ['prefer', 'require', 'verify-ca'].includes(sslMode)) {
      url.searchParams.set('sslmode', 'verify-full');

      return url.toString();
    }

    return connectionString;
  } catch (error) {
    // If URL parsing fails, return original connection string
    logger.warn(
      { error, connectionString },
      'Failed to parse connection string for SSL normalization'
    );

    return connectionString;
  }
};

const createLocalPool = (tenant: string): PoolEntry | null => {
  if (!isLocal()) {
    return null;
  }

  const connectionString = getEnv('LOCAL_DATABASE_CONNECTION_STRING');
  const normalizedConnectionString =
    normalizeConnectionString(connectionString);
  const existingPool = tenantPools.get(tenant);

  // Reuse pool if connection string hasn't changed and pool isn't stale
  if (
    existingPool &&
    existingPool.writerConnectionString === normalizedConnectionString &&
    !isPoolStale(existingPool)
  ) {
    return existingPool;
  }

  const pool: PoolEntry = {
    writer: new pg.Pool({
      connectionString: normalizedConnectionString,
      max: 30,
    }),
    readers: [],
    createdAt: Date.now(),
    writerConnectionString: normalizedConnectionString,
    readerConnectionStrings: [],
  };
  tenantPools.set(tenant, pool);

  return pool;
};

const hasConfigurationChanged = async (
  existingPool: PoolEntry,
  tenantConfig: TenantConfig,
  tenant: string
): Promise<boolean> => {
  // Get writer database information
  const writerDb = tenantConfig.databases.find((db) => db.type === 'writer');
  if (!writerDb) {
    throw new Error(`No writer database configured for tenant: ${tenant}`);
  }

  // Get current writer connection string from secret
  const writerConnectionString = await getSecretValue(
    writerDb.secretArn,
    tenant
  );

  // Check if writer connection string has changed
  if (writerConnectionString !== existingPool.writerConnectionString) {
    return true;
  }

  // Get reader database information
  const readerDbs = tenantConfig.databases.filter((db) => db.type === 'reader');

  // Check if reader count has changed
  if (readerDbs.length !== existingPool.readerConnectionStrings.length) {
    return true;
  }

  // Get current reader connection strings from secrets
  const currentReaderStrings: string[] = [];
  for (const readerDb of readerDbs) {
    try {
      const readerConnectionString = await getSecretValue(
        readerDb.secretArn,
        tenant
      );
      if (readerConnectionString) {
        currentReaderStrings.push(readerConnectionString);
      }
    } catch (error) {
      logger.error(
        { error, secretArn: readerDb.secretArn },
        'Error retrieving reader database credential'
      );
    }
  }

  // Check if reader strings have changed (order doesn't matter)
  if (
    currentReaderStrings.length !== existingPool.readerConnectionStrings.length
  ) {
    return true;
  }

  // Check if any strings are different
  for (const currentString of currentReaderStrings) {
    if (!existingPool.readerConnectionStrings.includes(currentString)) {
      return true;
    }
  }

  return false;
};

const handleExistingPool = async (
  tenant: string,
  existingPool: PoolEntry
): Promise<PoolEntry | null> => {
  if (!isPoolStale(existingPool)) {
    return existingPool;
  }
  const tenantConfig = await getTenantConfigFromDynamoDB(tenant, awsRegion());
  const configChanged = await hasConfigurationChanged(
    existingPool,
    tenantConfig,
    tenant
  );

  if (configChanged) {
    logger.info(
      { tenant },
      'Tenant configuration has changed, cleaning up stale pool'
    );
    await cleanupStalePool(tenant, existingPool);

    return null;
  }

  logger.info(
    { tenant },
    'Reusing stale pool since tenant configuration has not changed'
  );
  // Reset the createdAt timestamp to extend the TTL
  existingPool.createdAt = Date.now();
  tenantPools.set(tenant, existingPool);

  return existingPool;
};

const createNewPool = async (
  tenant: string,
  tenantConfig: TenantConfig
): Promise<PoolEntry> => {
  const writerDb = tenantConfig.databases.find((db) => db.type === 'writer');
  if (!writerDb) {
    throw new Error(`No writer database configured for tenant: ${tenant}`);
  }

  const writerConnectionString = await getSecretValue(
    writerDb.secretArn,
    tenant
  );
  const normalizedWriterConnectionString = normalizeConnectionString(
    writerConnectionString
  );
  const pool = new pg.Pool({
    connectionString: normalizedWriterConnectionString,
  });

  const readerDbPools: pg.Pool[] = [];
  const readerConnectionStrings: string[] = [];
  const readerDbs = tenantConfig.databases.filter((db) => db.type === 'reader');

  // Process all reader databases
  await Promise.all(
    readerDbs.map(async (readerDb) => {
      try {
        const readerConnectionString = await getSecretValue(
          readerDb.secretArn,
          tenant
        );
        const normalizedReaderConnectionString = normalizeConnectionString(
          readerConnectionString
        );
        readerConnectionStrings.push(normalizedReaderConnectionString);
        readerDbPools.push(
          new pg.Pool({
            connectionString: normalizedReaderConnectionString,
          })
        );
      } catch (error) {
        logger.error(
          { error, secretArn: readerDb.secretArn },
          'Error retrieving reader database credential'
        );
        // Continue with other readers even if one fails
      }
    })
  );

  const poolEntry: PoolEntry = {
    writer: pool,
    readers: readerDbPools,
    createdAt: Date.now(),
    writerConnectionString: normalizedWriterConnectionString,
    readerConnectionStrings,
  };
  tenantPools.set(tenant, poolEntry);
  logger.info({ tenant }, 'Created connection pool');

  return poolEntry;
};

export const createConnectionPool = async (
  tenant: string
): Promise<{ writer: pg.Pool; readers: pg.Pool[] }> => {
  try {
    // Try to create local pool first
    const localPool = createLocalPool(tenant);
    if (localPool) {
      return localPool;
    }

    // Handle production environment
    const existingPool = tenantPools.get(tenant);

    if (existingPool) {
      const handledPool = await handleExistingPool(tenant, existingPool);
      if (handledPool) {
        return handledPool;
      }
    }
    const tenantConfig = await getTenantConfigFromDynamoDB(tenant, awsRegion());

    return await createNewPool(tenant, tenantConfig);
  } catch (error) {
    logger.error({ error, tenant }, 'Error creating connection pool');
    throw error;
  }
};

const getSecretValue = async (secretArn: string, tenant: string) => {
  logger.info({ secretArn }, 'Retrieving database credential secret');

  const getDatabaseConnectionCommand = new GetSecretValueCommand({
    SecretId: secretArn,
  });

  const databaseConnectionSecret = await secretsManager.send(
    getDatabaseConnectionCommand
  );

  if (!databaseConnectionSecret.SecretString) {
    throw new Error(`Secret string is empty for tenant: ${tenant}`);
  }

  return databaseConnectionSecret.SecretString;
};
