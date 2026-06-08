import {
  type BuildQueryResult,
  type DBQueryConfig,
  DefaultLogger,
  type LogWriter,
  sql,
} from 'drizzle-orm';
import { drizzle, type NodePgDatabase } from 'drizzle-orm/node-postgres';
import { withReplicas } from 'drizzle-orm/pg-core';

import { createConnectionPool } from './db-utils';
import { relations } from './relations';
import * as dbSchema from './schema';
import { getEnv, logger } from './utils/index';

export interface DrizzleClient {
  admin: DB;
  org: DB['transaction'];
}

type TRSchema = typeof relations;

export type DB = NodePgDatabase<typeof dbSchema, TRSchema>;
export type DBTransaction = DB['transaction'];

export type QueryConfig<TableName extends keyof TRSchema> = DBQueryConfig<
  'one' | 'many',
  TRSchema,
  TRSchema[TableName]
>;

export type InferQueryModel<
  TableName extends keyof TRSchema,
  // eslint-disable-next-line @typescript-eslint/no-empty-object-type
  QBConfig extends QueryConfig<TableName> = {},
> = BuildQueryResult<TRSchema, TRSchema[TableName], QBConfig>;

export type InferInsertModel<TableName extends keyof TRSchema> =
  TRSchema[TableName]['table']['$inferInsert'];

export type InferSelectModel<TableName extends keyof TRSchema> =
  TRSchema[TableName]['table']['$inferSelect'];

export type InferUpdateModel<TableName extends keyof TRSchema> = Partial<
  InferInsertModel<TableName>
>;

class RsLogWriter implements LogWriter {
  write(message: string) {
    logger.info(message);
  }
}

const dsLogger = new DefaultLogger({ writer: new RsLogWriter() });

interface CreateDrizzleOptions {
  userId?: string;
  orgId: string;
  tenant: string;
}

export const createDrizzleClient = async (
  { orgId, tenant, userId }: CreateDrizzleOptions,
  logger = true
): Promise<DrizzleClient> => {
  const pool = await createConnectionPool(tenant);
  const enableQueryLogging =
    logger && !(getEnv('DISABLE_DATABASE_QUERYING_LOGGING', true) === 'true');

  const drizzleOptions = {
    schema: dbSchema,
    relations,
    logger: enableQueryLogging ? dsLogger : false,
  };

  const writerDb = drizzle({
    client: pool.writer,
    ...drizzleOptions,
  });

  const readerDbs = pool.readers.map((reader) =>
    drizzle({
      client: reader,
      ...drizzleOptions,
    })
  );

  const [firstReader, ...restReaders] = readerDbs;
  const clientDb =
    pool.readers.length > 0 && firstReader
      ? withReplicas(writerDb, [firstReader, ...restReaders])
      : writerDb;

  return createDrizzle({
    orgId,
    userId,
    admin: clientDb,
    client: clientDb,
  });
};

const createDrizzle = ({
  userId,
  orgId,
  admin,
  client,
}: {
  userId?: string;
  orgId: string;
  admin: DB;
  client: DB;
}) => {
  return {
    admin,
    // The wrapper injects RLS set_config SQL before delegating to client.transaction.
    // TypeScript can't infer the spread+generic callback signature is compatible with Drizzle's
    // overloaded transaction type, so the assertion is required to expose the correct type to callers.
    org: (async (transaction, ...rest) => {
      return await client.transaction(
        async (tx) => {
          await tx.execute(sql`
              -- set org key for role
              SELECT set_config('risksmart.org_key', '${sql.raw(orgId)}', TRUE);
              -- set current user id
              SELECT set_config('risksmart.user_id', '${sql.raw(userId || '')}', TRUE);
              -- set local role
              set local role 'data_layer';
            `);

          return await transaction(tx);
        },
        ...rest
      );
    }) as typeof client.transaction,
  };
};
