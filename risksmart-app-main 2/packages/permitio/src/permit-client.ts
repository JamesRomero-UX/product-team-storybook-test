import { Permit } from 'permitio';

import { chunk, processBatchesWithResults } from './utils/batch';
import { logger } from './utils/logger';

/**
 * Creates a permit client instance that can be used for permission checks
 * This is an instantiatable version of the global permit functions
 */
export const createPermitClient = (token: string, endpoint: string) => {
  const permit = new Permit({
    pdp: endpoint,
    token,
  });
  const filterChunk = async <T>(
    chunk: T[],
    resourceName: string,
    resourceId: (item: T) => string,
    userId: string,
    orgKey: string
  ) => {
    logger.info(
      {
        resourceName,
        userId,
        orgKey,
        itemCount: chunk.length,
      },
      'Starting permit filter chunk'
    );
    const startTime = performance.now();
    const permitted = await permit.bulkCheck(
      chunk.map((item) => ({
        user: {
          key: userId,
        },
        action: 'read',
        resource: {
          type: resourceName,
          key: resourceId(item),
          tenant: orgKey,
        },
      }))
    );
    const endTime = performance.now();
    logger.info(
      {
        executionTime: endTime - startTime,
      },
      'Completed permit filter chunk'
    );

    return chunk.filter((item, index) => permitted[index]);
  };

  const preFilterChunk = async (
    resourceName: string,
    userId: string,
    orgKey: string,
    resources: string[] | undefined
  ) => {
    const res = await permit.getUserPermissions(
      { key: userId },
      [orgKey],
      resources,
      [resourceName]
    );

    const ids: string[] = [];
    for (const [k] of Object.entries(res)) {
      const keyParts = k.split(':');
      if (keyParts.length === 2) {
        ids.push(keyParts[1]!);
      }
    }

    return ids;
  };

  return {
    getRoles: async (
      userId: string,
      orgKey: string,
      rolesToCheck: string[]
    ) => {
      logger.info(
        {
          userId,
          orgKey,
          rolesToCheck,
        },
        'Getting roles for user'
      );
      const startTime = performance.now();
      const roles = await permit.api.roleAssignments.list({
        user: userId,
        tenant: orgKey,
        roles: rolesToCheck,
      });
      const endTime = performance.now();
      logger.info(
        {
          userId,
          orgKey,
          executionTime: endTime - startTime,
          roles,
        },
        'Completed getting roles for user'
      );

      return roles;
    },

    preFilter: async (
      resourceName: string,
      userId: string,
      orgKey: string,
      resources: string[]
    ): Promise<string[]> => {
      const startTime = performance.now();
      const chunks = chunk(resources, 100);

      // Process chunks in batches of 5 concurrently
      const results = await processBatchesWithResults(
        chunks,
        async (c) => {
          try {
            return await preFilterChunk(resourceName, userId, orgKey, c);
          } catch (error) {
            logger.error(
              {
                error,
                resourceName,
                userId,
                orgKey,
                chunkSize: c.length,
              },
              'Failed to process chunk in preFilter'
            );
            throw error;
          }
        },
        5
      );

      // Flatten the results
      const ids = results.flat();

      const endTime = performance.now();
      logger.info(
        {
          executionTime: endTime - startTime,
        },
        'Completed permit filter'
      );

      return ids;
    },

    bulkCheck: async (
      checks: {
        resourceName: string;
        resourceId?: string;
        action: 'read' | 'delete' | 'insert' | 'update';
      }[],
      userId: string,
      orgKey: string
    ) => {
      try {
        logger.info(
          {
            userId,
            orgKey,
            itemCount: checks.length,
          },
          'Starting permit bulk check'
        );
        const startTime = performance.now();
        const permitted = await permit.bulkCheck(
          checks.map((c) => ({
            user: {
              key: userId,
            },
            action: c.action,
            resource: {
              type: c.resourceName,
              key: c.resourceId,
              tenant: orgKey,
            },
          }))
        );
        const endTime = performance.now();
        logger.info(
          {
            executionTime: endTime - startTime,
          },
          'Completed permit bulk check'
        );

        return checks.filter((check, index) => permitted[index]);
      } catch (error) {
        logger.error(
          {
            error,
            userId,
            orgKey,
            checkCount: checks.length,
          },
          'Failed permit bulk check'
        );
        throw error;
      }
    },

    filter: async <T>(
      items: T[],
      resourceName: string,
      resourceId: (item: T) => string,
      userId: string,
      orgKey: string,
      mode: 'batch-parallel' | 'batch-sequential' | 'single' = 'batch-parallel'
    ): Promise<T[]> => {
      const startTime = performance.now();

      const allowedItems: T[] = [];
      logger.info(
        {
          resourceName,
          userId,
          orgKey,
          itemCount: items.length,
          mode,
        },
        'Starting permit filter'
      );

      switch (mode) {
        case 'single':
          allowedItems.push(
            ...(await filterChunk(
              items,
              resourceName,
              resourceId,
              userId,
              orgKey
            ))
          );
          break;
        case 'batch-sequential':
          for (const c of chunk(items, 100)) {
            allowedItems.push(
              ...(await filterChunk(
                c,
                resourceName,
                resourceId,
                userId,
                orgKey
              ))
            );
          }
          break;
        case 'batch-parallel':
          allowedItems.push(
            ...(
              await processBatchesWithResults(
                chunk(items, 500),
                async (c: T[]) => {
                  try {
                    return await filterChunk(
                      c,
                      resourceName,
                      resourceId,
                      userId,
                      orgKey
                    );
                  } catch (error) {
                    logger.error(
                      {
                        error,
                        resourceName,
                        userId,
                        orgKey,
                        chunkSize: c.length,
                      },
                      'Failed to process chunk in filter'
                    );
                    throw error;
                  }
                },
                30
              )
            ).flat()
          );
          break;

        default:
          throw new Error('Unknown mode');
      }
      const endTime = performance.now();
      logger.info(
        {
          executionTime: endTime - startTime,
        },
        'Completed permit filter'
      );

      return allowedItems;
    },
  };
};

export type PermitClient = ReturnType<typeof createPermitClient>;
