import type { DB } from '@risksmart-app/drizzle/src/db';
import {
  getActionByIdQueryConfig,
  getActionsRegisterQueryConfig,
} from '@risksmart-app/drizzle/src/queries/action.query';
import {
  action,
  action_parent,
  contributor,
  contributor_group,
  department,
  owner,
  owner_group,
  tag,
} from '@risksmart-app/drizzle/src/schema';

import type {
  ActionRegisterResponseRow,
  GetActionByIdResponseRow,
  ServiceContext,
} from '../types';
import { getLogger } from '../utils/logger';

const logger = getLogger();

export interface ActionFilters {
  parentId?: string;
  departmentTypeIds?: string[];
  tagTypeIds?: string[];
  limit?: number;
  offset?: number;
}

export interface PaginatedActions {
  items: ActionRegisterResponseRow[];
  total: number;
  limit: number;
  offset: number;
}

export type ActionRepository = ReturnType<typeof createActionRepository>;

export interface ActionRelationships {
  parentId: string | null;
  ownerUserIds: string[];
  ownerGroupIds: string[];
  contributorUserIds: string[];
  contributorGroupIds: string[];
  tagTypeIds: string[];
  departmentTypeIds: string[];
}

export function createActionRepository(db: DB['transaction']) {
  return {
    /**
     * Get a single action by ID
     * Returns null if action doesn't exist
     * Note: Permit.io filtering should be applied at the processor level
     */
    getById: async (
      actionId: string
    ): Promise<GetActionByIdResponseRow | null> => {
      try {
        logger.info('Getting action by ID', { actionId });

        const data = await db(async (tx) => {
          return tx.query.action.findMany({
            where: {
              Id: actionId,
            },
            ...getActionByIdQueryConfig,
          });
        });

        if (data.length === 0) {
          logger.info('Action not found', { actionId });

          return null;
        }

        return data[0]!;
      } catch (error) {
        logger.error('Failed to get action by ID', {
          error,
          actionId,
        });
        throw error;
      }
    },

    /**
     * Get list of actions with optional filters
     * Returns all matching actions from database
     * Note: Permit.io filtering and pagination should be applied at the processor level
     */
    getRegister: async (
      filters: ActionFilters = {}
    ): Promise<ActionRegisterResponseRow[]> => {
      const { parentId, departmentTypeIds, tagTypeIds } = filters;

      try {
        logger.info('Getting actions register', {
          filters,
        });

        const data = await db(async (tx) => {
          return tx.query.action.findMany({
            where: {
              ...(tagTypeIds && {
                tags: {
                  TagTypeId: { in: tagTypeIds },
                },
              }),
              ...(departmentTypeIds && {
                departments: {
                  DepartmentTypeId: { in: departmentTypeIds },
                },
              }),
              ...(parentId && {
                parents: {
                  ParentId: parentId,
                },
              }),
            },
            ...getActionsRegisterQueryConfig,
          });
        });

        logger.info('Retrieved actions from database', {
          count: data.length,
        });

        return data;
      } catch (error) {
        logger.error('Failed to get actions register', {
          error,
          filters,
        });
        throw error;
      }
    },

    /**
     * Insert an action with all relationships in a single transaction
     * Handles action_parent, owners, contributors, tags, departments
     */
    insertWithRelationships: async (
      values: typeof action.$inferInsert,
      relationships: ActionRelationships,
      context: ServiceContext
    ) =>
      await db(async (tx) => {
        try {
          const [insertedAction] = await tx
            .insert(action)
            .values(values)
            .returning();

          if (!insertedAction?.Id) {
            throw new Error('Failed to retrieve inserted action ID');
          }

          const actionId = insertedAction.Id;
          const { userId, orgKey } = context;
          const relationBase = {
            ParentId: actionId,
            OrgKey: orgKey,
            CreatedByUser: userId,
            ModifiedByUser: userId,
          };

          // Insert action_parent relationship (only if parentId is provided)
          if (relationships.parentId) {
            // Look up the parent node's ObjectType for the ParentType field
            const parentNode = await tx.query.node.findFirst({
              where: { Id: relationships.parentId },
              columns: { ObjectType: true },
            });

            if (!parentNode) {
              throw new Error(
                `Parent node not found: ${relationships.parentId}`
              );
            }

            await tx.insert(action_parent).values({
              ActionId: actionId,
              ParentId: relationships.parentId,
              ParentType: parentNode.ObjectType,
              OrgKey: orgKey,
              CreatedByUser: userId,
              ModifiedByUser: userId,
            });
          }

          await Promise.all([
            relationships.ownerUserIds.length > 0
              ? tx.insert(owner).values(
                  relationships.ownerUserIds.map((userId) => ({
                    ...relationBase,
                    UserId: userId,
                  }))
                )
              : Promise.resolve(),
            relationships.ownerGroupIds.length > 0
              ? tx.insert(owner_group).values(
                  relationships.ownerGroupIds.map((userGroupId) => ({
                    ...relationBase,
                    UserGroupId: userGroupId,
                  }))
                )
              : Promise.resolve(),
            relationships.contributorUserIds.length > 0
              ? tx.insert(contributor).values(
                  relationships.contributorUserIds.map((userId) => ({
                    ...relationBase,
                    UserId: userId,
                  }))
                )
              : Promise.resolve(),
            relationships.contributorGroupIds.length > 0
              ? tx.insert(contributor_group).values(
                  relationships.contributorGroupIds.map((userGroupId) => ({
                    ...relationBase,
                    UserGroupId: userGroupId,
                  }))
                )
              : Promise.resolve(),
            relationships.tagTypeIds.length > 0
              ? tx.insert(tag).values(
                  relationships.tagTypeIds.map((tagTypeId) => ({
                    ...relationBase,
                    TagTypeId: tagTypeId,
                  }))
                )
              : Promise.resolve(),
            relationships.departmentTypeIds.length > 0
              ? tx.insert(department).values(
                  relationships.departmentTypeIds.map((departmentTypeId) => ({
                    ...relationBase,
                    DepartmentTypeId: departmentTypeId,
                  }))
                )
              : Promise.resolve(),
          ]);

          return insertedAction;
        } catch (error) {
          logger.error(
            'Failed to insert action with relationships',
            error as Error
          );
          throw error;
        }
      }),
  };
}
