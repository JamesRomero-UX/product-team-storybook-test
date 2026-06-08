import type { PermitClient } from '@risksmart-app/permitio/src/permit-client';
import { Forbidden } from 'http-errors';
import type { ServiceContext } from 'src/types';
import { getLogger } from 'src/utils/logger';

const logger = getLogger();

export interface PermissionCheck {
  /**
   * The object name to check permission for (e.g., 'issue_update', 'action_update')
   */
  objectName: string; //todo: consider using a union type here
  /**
   * The action to check permission for
   */
  action: 'read' | 'delete' | 'insert' | 'update';
  objectId?: string;
}

interface PermissionCheckDependencies {
  permitClient: PermitClient;
}

function isNestedPermissions(
  permissions: PermissionCheck[] | PermissionCheck[][]
): permissions is PermissionCheck[][] {
  return (
    Array.isArray(permissions) &&
    permissions.length > 0 &&
    Array.isArray(permissions[0])
  );
}

export const createCheckPermissions =
  ({ permitClient }: PermissionCheckDependencies) =>
  async ({
    requiredPermissions,
    context,
  }: {
    requiredPermissions: PermissionCheck[] | PermissionCheck[][];
    context: ServiceContext;
  }): Promise<void> => {
    const { userId, orgKey } = context;

    const logPermissionDenied = (permissions: PermissionCheck[]): void => {
      permissions.forEach(({ objectName, action, objectId }) => {
        logger.warn(`Permission denied for ${objectName}:${action}`, {
          userId,
          orgKey,
          objectId,
        });
      });
    };

    if (isNestedPermissions(requiredPermissions)) {
      // Handle nested permissions for bulk operations.
      const results = await Promise.all(
        requiredPermissions.map(async (permissionGroup) => {
          // Map objectName to resourceName for permitClient
          const mappedChecks = permissionGroup.map(
            ({ objectName, objectId, action }) => ({
              resourceName: objectName,
              resourceId: objectId,
              action,
            })
          );
          const permitted = await permitClient.bulkCheck(
            mappedChecks,
            userId,
            orgKey
          );

          // a group passes if at least one permission in the group is granted
          return { permissionGroup, hasPassed: permitted.length > 0 };
        })
      );

      const failedGroups = results.filter(({ hasPassed }) => !hasPassed);

      if (failedGroups.length > 0) {
        failedGroups.forEach(({ permissionGroup }) =>
          logPermissionDenied(permissionGroup)
        );

        throw new Forbidden(
          `Permission denied for bulk operation: ${failedGroups.length} of ${requiredPermissions.length} permission groups failed`
        );
      }

      return;
    }

    // Map objectName to resourceName for permitClient
    const mappedChecks = requiredPermissions.map(
      ({ objectName, objectId, action }) => ({
        resourceName: objectName,
        resourceId: objectId,
        action,
      })
    );
    const permitted = await permitClient.bulkCheck(
      mappedChecks,
      userId,
      orgKey
    );

    if (permitted.length === 0) {
      logPermissionDenied(requiredPermissions);

      throw new Forbidden(
        `Permission denied: ${requiredPermissions.map((c) => `${c.action} ${c.objectName}`).join(', ')}`
      );
    }
  };
