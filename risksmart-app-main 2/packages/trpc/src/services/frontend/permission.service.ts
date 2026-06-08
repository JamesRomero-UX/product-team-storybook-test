import type { ParentType } from '@risksmart-app/domain/src/types/consts/index';
import { createDrizzleClient } from '@risksmart-app/drizzle/src/db';
import { bulkCheck } from '@risksmart-app/permitio/src/permit';
import { ROOT_RESOURCE_ID } from '@risksmart-app/permitio/src/types';

import { NAVIGATION_PARENT_TYPES } from '../../types/index';
import { logger } from '../../utils/logger';
import type { PermissionService, ServiceContext } from '../service.types';
export class PermissionServiceImpl implements PermissionService {
  async checkNavigationVisibility(
    ctx: ServiceContext,
    parentTypes: ParentType[]
  ): Promise<{ parentType: ParentType; visible: boolean }[]> {
    const db = await createDrizzleClient(ctx);
    const user = await db.org((tx) => {
      return tx.query.user.findFirst({
        where: {
          Id: ctx.userId,
        },
        with: {
          userRoles: true,
        },
      });
    });
    if (!user || user.userRoles.length === 0) {
      logger.warn(
        { userId: ctx.userId, orgId: ctx.orgId },
        'User not found or has no roles'
      );

      return parentTypes.map((parentType) => ({
        parentType: parentType,
        visible: false,
      }));
    }

    return await processParentTypesWithConcurrency(ctx, parentTypes, 5);
  }
  async bulkCheck(
    ctx: ServiceContext,
    checks: {
      resourceName: string;
      resourceId?: string | undefined;
      action: 'read' | 'delete' | 'insert' | 'update';
      rootResourceCheck?: boolean | undefined;
    }[]
  ): Promise<
    {
      resourceName: string;
      resourceId?: string | undefined;
      action: 'read' | 'delete' | 'insert' | 'update';
    }[]
  > {
    const updatedChecked = checks.map((check) => {
      if (check.rootResourceCheck) {
        return {
          ...check,
          resourceName: 'rs_node',
          resourceId: ROOT_RESOURCE_ID(check.resourceName, ctx.orgId),
        };
      }

      return check;
    });

    return await bulkCheck(updatedChecked, ctx.userId, ctx.orgId);
  }
}

/**
 * Optimistic filter that returns true as soon as any item with read permission is found.
 * This is more efficient than filtering all items when we only need to know if any exist.
 */
const filterWithEarlyReturn = async <T>(options: {
  items: T[];
  resourceName: string;
  resourceId: (item: T) => string;
  userId: string;
  orgKey: string;
  chunkSize?: number;
  maxConcurrentChunks?: number;
}): Promise<boolean> => {
  const {
    items,
    resourceName,
    resourceId,
    userId,
    orgKey,
    chunkSize = 100,
    maxConcurrentChunks = 5,
  } = options;

  if (items.length === 0) {
    return false;
  }

  logger.debug(
    {
      resourceName,
      userId,
      orgKey,
      itemCount: items.length,
      chunkSize,
      maxConcurrentChunks,
    },
    'Starting optimistic permission filter with early return'
  );

  const chunks: T[][] = [];
  for (let i = 0; i < items.length; i += chunkSize) {
    chunks.push(items.slice(i, i + chunkSize));
  }

  // Process chunks in batches to avoid overwhelming the permit service
  for (let i = 0; i < chunks.length; i += maxConcurrentChunks) {
    const currentBatch = chunks.slice(i, i + maxConcurrentChunks);

    const batchPromises = currentBatch.map(async (chunk) => {
      const startTime = performance.now();

      try {
        const permitted = await bulkCheck(
          chunk.map((item) => ({
            resourceName,
            resourceId: resourceId(item),
            action: 'read' as const,
          })),
          userId,
          orgKey
        );

        const endTime = performance.now();
        logger.debug(
          {
            chunkSize: chunk.length,
            permittedCount: permitted.length,
            executionTime: endTime - startTime,
          },
          'Completed permission check for chunk'
        );

        return permitted.length > 0;
      } catch (error) {
        logger.error(
          { error, resourceName, userId, orgKey, chunkSize: chunk.length },
          'Failed to process chunk in optimistic filter'
        );
        throw error;
      }
    });

    // Wait for all chunks in this batch to complete
    const batchResults = await Promise.all(batchPromises);

    // Return immediately if any chunk found allowed items
    if (batchResults.some((hasAllowed) => hasAllowed)) {
      logger.debug(
        {
          resourceName,
          userId,
          orgKey,
          processedChunks: i + currentBatch.length,
          totalChunks: chunks.length,
        },
        'Found allowed item, returning early'
      );

      return true;
    }
  }

  logger.debug(
    {
      resourceName,
      userId,
      orgKey,
      processedChunks: chunks.length,
    },
    'No allowed items found after checking all chunks'
  );

  return false;
};

const canViewAnyNode = async (ctx: ServiceContext, nodeTypes: ParentType[]) => {
  //check direct read permissions for parent types
  const directReadChecks = nodeTypes.map((type) => ({
    resourceName: 'rs_node',
    resourceId: ROOT_RESOURCE_ID(getRootType(type), ctx.orgId),
    action: 'read' as const,
  }));
  const directReadResults = await bulkCheck(
    directReadChecks,
    ctx.userId,
    ctx.orgId
  );
  if (directReadResults.some((result) => result.action === 'read')) {
    logger.debug(
      {
        nodeTypes,
      },
      'User has direct read permission for at least one node type'
    );

    return true;
  }

  //if no direct read permissions, check if user has access to any nodes of the given types

  const db = await createDrizzleClient(ctx);
  const nodes = await db.org((tx) => {
    return tx.query.node.findMany({
      where: {
        ObjectType: {
          in: nodeTypes,
        },
      },
    });
  });
  logger.debug(
    {
      userId: ctx.userId,
      orgId: ctx.orgId,
      nodeTypes,
      nodeCount: nodes.length,
    },
    'Got nodes for permission check'
  );

  // Use optimistic filtering that returns early when first allowed node is found
  const hasAnyAllowedNode = await filterWithEarlyReturn<(typeof nodes)[0]>({
    items: nodes,
    resourceName: 'rs_node',
    resourceId: (item: (typeof nodes)[0]) => item.Id,
    userId: ctx.userId,
    orgKey: ctx.orgId,
  });

  logger.debug(
    {
      userId: ctx.userId,
      orgId: ctx.orgId,
      nodeTypes,
      hasAnyAllowedNode,
    },
    'Completed optimistic permission check'
  );

  return hasAnyAllowedNode;
};

// Process domains in parallel with max concurrency of 5
// to avoid overwhelming the database with too many requests at once
// but still get results quickly
const processParentTypesWithConcurrency = async (
  ctx: ServiceContext,
  parentTypes: ParentType[],
  maxConcurrency: number = 5
): Promise<{ parentType: ParentType; visible: boolean }[]> => {
  const results: { parentType: ParentType; visible: boolean }[] = [];

  for (let i = 0; i < parentTypes.length; i += maxConcurrency) {
    const batch = parentTypes.slice(i, i + maxConcurrency);
    const batchPromises = batch.map(async (parentType) => {
      logger.debug(
        {
          parentType,
          userId: ctx.userId,
          orgId: ctx.orgId,
        },
        'Checking visibility for parentType'
      );
      const canView = await canViewAnyNode(ctx, [parentType]);
      logger.debug(
        {
          parentType,
          userId: ctx.userId,
          orgId: ctx.orgId,
          canView,
        },
        'ParentType visibility check complete'
      );

      return { parentType, visible: canView };
    });

    const batchResults = await Promise.all(batchPromises);
    results.push(...batchResults);
  }

  return results;
};

const getRootType = (parentType: ParentType): ParentType => {
  const mappedType = NAVIGATION_PARENT_TYPES[parentType];
  if (mappedType) {
    logger.debug(
      {
        parentType,
        mappedType,
      },
      'Mapped parent type to navigation parent type'
    );

    return mappedType;
  }

  return parentType;
};
