import type { DB } from '@risksmart-app/drizzle/src/db';
import {
  getActionUpdateByIdQueryConfig,
  getActionUpdatesByParentActionIdQueryConfig,
} from '@risksmart-app/drizzle/src/queries/action.query';
import { action_update } from '@risksmart-app/drizzle/src/schema';
import { eq, inArray } from 'drizzle-orm';

import type {
  GetActionUpdateByIdResponseRow,
  GetActionUpdatesByParentActionIdResponseRow,
} from '../types';
import { getLogger } from '../utils/logger';

const logger = getLogger();

export interface ActionUpdateFilters {
  limit?: number;
  offset?: number;
}

export interface PaginatedActionUpdates {
  items: GetActionUpdatesByParentActionIdResponseRow[];
  total: number;
  limit: number;
  offset: number;
}

export type ActionUpdateRepository = ReturnType<
  typeof createActionUpdateRepository
>;

export function createActionUpdateRepository(db: DB['transaction']) {
  return {
    insert: async (values: typeof action_update.$inferInsert) =>
      await db(async (tx) => {
        try {
          return tx.insert(action_update).values(values).returning();
        } catch (error) {
          logger.error(
            'Failed to insert into action_update table',
            error as Error
          );
          throw error;
        }
      }),

    /**
     * Get a single action update by ID
     * Returns null if update doesn't exist
     * Note: Permit.io filtering should be applied at the processor level
     */
    getById: async (
      updateId: string
    ): Promise<GetActionUpdateByIdResponseRow | null> => {
      try {
        logger.info('Getting action update by ID', {
          updateId,
        });

        const data = await db(async (tx) => {
          return tx.query.action_update.findMany({
            where: {
              Id: updateId,
            },
            ...getActionUpdateByIdQueryConfig,
          });
        });

        if (data.length === 0) {
          logger.info('Action update not found', { updateId });

          return null;
        }

        return data[0]!;
      } catch (error) {
        logger.error('Failed to get action update by ID', {
          error,
          updateId,
        });
        throw error;
      }
    },

    /**
     * Get list of action updates for a parent action
     * Returns all updates for the parent action from database
     * Note: Permit.io filtering and pagination should be applied at the processor level
     */
    getByParentId: async (
      parentActionId: string
    ): Promise<GetActionUpdatesByParentActionIdResponseRow[]> => {
      try {
        logger.info('Getting action updates by parent ID', {
          parentActionId,
        });

        const data = await db(async (tx) => {
          return tx.query.action_update.findMany({
            where: {
              ParentActionId: parentActionId,
            },
            ...getActionUpdatesByParentActionIdQueryConfig,
          });
        });

        logger.info('Retrieved action updates from database', {
          parentActionId,
          count: data.length,
        });

        return data;
      } catch (error) {
        logger.error('Failed to get action updates by parent ID', {
          error,
          parentActionId,
        });
        throw error;
      }
    },

    /**
     * Delete an action update by ID
     * Returns the number of affected rows
     */
    delete: async (updateId: string): Promise<number> => {
      try {
        logger.info('Deleting action update', { updateId });

        const result = await db(async (tx) => {
          return tx
            .delete(action_update)
            .where(eq(action_update.Id, updateId))
            .returning({ Id: action_update.Id });
        });

        logger.info('Deleted action update', {
          updateId,
          affectedRows: result.length,
        });

        return result.length;
      } catch (error) {
        logger.error('Failed to delete action update', {
          error,
          updateId,
        });
        throw error;
      }
    },

    /**
     * Delete multiple action updates by IDs in a single transaction
     * Returns the IDs that were actually deleted
     */
    deleteMany: async (updateIds: string[]): Promise<string[]> => {
      try {
        logger.info('Deleting multiple action updates', {
          updateIds,
          count: updateIds.length,
        });

        const result = await db(async (tx) => {
          return tx
            .delete(action_update)
            .where(inArray(action_update.Id, updateIds))
            .returning({ Id: action_update.Id });
        });

        const deletedIds = result.map((r) => r.Id);

        logger.info('Deleted action updates', {
          requestedIds: updateIds,
          deletedIds,
          affectedRows: result.length,
        });

        return deletedIds;
      } catch (error) {
        logger.error('Failed to delete action updates', {
          error,
          updateIds,
        });
        throw error;
      }
    },
  };
}
