import {
  GetSecretValueCommand,
  SecretsManagerClient,
} from '@aws-sdk/client-secrets-manager';
import type { PoolClient } from 'pg';
import * as pg from 'pg';
import { getEnv, getEnvBoolean } from 'src/environment';
import { getLogger } from 'src/logger';

const logger = getLogger();
const isLocal = getEnvBoolean('IS_LOCAL', true);
/**
 * Retrieves tenant database credentials from secret manager
 * @returns
 */
const getDatabaseCredentials = async (): Promise<string> => {
  if (isLocal) {
    logger.info('Dev mode. Getting database credentials from env param');

    return getEnv('LOCAL_REPORTING_DATABASE_CONNECTION_STRING');
  }
  logger.info('Getting database credentials from secret manager');
  const secretsmanager = new SecretsManagerClient();

  const secretId = getEnv('DATABASE_SECRET_NAME');
  logger.info('Retrieving database credential secret', {
    secretId,
  });
  const getDatabaseConnectionCommand = new GetSecretValueCommand({
    SecretId: secretId,
  });
  const databaseConnectionSecret = await secretsmanager.send(
    getDatabaseConnectionCommand
  );

  return databaseConnectionSecret.SecretString!;
};
let pool: pg.Pool | null = null;

export const getConnectionPool = async () => {
  //create connection pool using secrets manager credentials
  try {
    if (!pool) {
      const connectionString = await getDatabaseCredentials();
      pool = new pg.Pool({
        connectionString,
      });
    }

    return pool;
  } catch (e) {
    logger.error('Failed to setup connection pool', e as Error);
    throw e;
  }
};
export const query = async (
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  execute: (client: PoolClient) => any,
  { orgKey }: { orgKey: string }
) => {
  const pool = await getConnectionPool();
  logger.info('Connecting pool');
  const client = await pool.connect();
  try {
    logger.info('Setting session data');
    await client.query("SELECT set_config('risksmart.org_key', $1, FALSE)", [
      orgKey,
    ]);
    logger.info('Executing query');

    return execute(client);
  } catch (e) {
    logger.error('Database request failed', e as Error);
    throw e;
  } finally {
    logger.info('Returning client to pool');
    await client?.release();
  }
};
