import type { DB } from '@risksmart-app/drizzle/src/db';
import { sso_configuration } from '@risksmart-app/drizzle/src/schema';
import { eq } from 'drizzle-orm';

import { getLogger } from '../utils/logger';

const logger = getLogger();

export function createSsoConfigurationRepository(db: DB['transaction']) {
  return {
    insert: async (values: typeof sso_configuration.$inferInsert) =>
      await db(async (tx) => {
        try {
          return await tx.insert(sso_configuration).values(values).returning();
        } catch (error) {
          logger.error(
            'Failed to insert into sso_configuration table',
            error as Error
          );
          throw error;
        }
      }),

    getAll: async () => {
      try {
        logger.info('Getting all SSO configurations for org');

        return await db(async (tx) => {
          return tx.query.sso_configuration.findMany();
        });
      } catch (error) {
        logger.error('Failed to get SSO configurations', error as Error);
        throw error;
      }
    },

    getByConnectionId: async (connectionId: string) => {
      try {
        logger.info('Getting SSO configuration by ConnectionId', {
          connectionId,
        });

        const data = await db(async (tx) => {
          return tx.query.sso_configuration.findMany({
            where: {
              ConnectionId: connectionId,
            },
          });
        });

        if (data.length === 0) {
          logger.info('SSO configuration not found', { connectionId });

          return null;
        }

        return data[0]!;
      } catch (error) {
        logger.error('Failed to get SSO configuration by ConnectionId', {
          error,
          connectionId,
        });
        throw error;
      }
    },

    deleteByConnectionId: async (connectionId: string): Promise<string[]> => {
      try {
        logger.info('Deleting SSO configuration by ConnectionId', {
          connectionId,
        });

        const result = await db(async (tx) => {
          return tx
            .delete(sso_configuration)
            .where(eq(sso_configuration.ConnectionId, connectionId))
            .returning({ Id: sso_configuration.Id });
        });

        const deletedIds = result.map((r) => r.Id);

        logger.info('Deleted SSO configuration', {
          connectionId,
          deletedIds,
          affectedRows: result.length,
        });

        return deletedIds;
      } catch (error) {
        logger.error('Failed to delete SSO configuration', {
          error,
          connectionId,
        });
        throw error;
      }
    },
  };
}

export type SsoConfigurationRepository = ReturnType<
  typeof createSsoConfigurationRepository
>;
