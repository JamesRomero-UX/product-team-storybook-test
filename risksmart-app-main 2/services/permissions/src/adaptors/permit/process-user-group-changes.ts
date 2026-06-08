import type { Logger } from '@aws-lambda-powertools/logger';
import type { PermitSDK } from '@risksmart-app/permitio/src/types';

import { PermissionsOperation } from '../../types';

export interface ProcessUserGroupChangesParams {
  op: PermissionsOperation.Insert;
  userGroupId: string;
  orgKey: string;
}

export interface CreateUserGroupChangesProcessorProps {
  logger: Logger;
  tryCreateUserGroup: PermitSDK['tryCreateUserGroup'];
}

/**
 * Creates a processor for user group lifecycle changes.
 *
 * This processor handles:
 * - INSERT: Creates a new user group
 *
 * @example
 * const processUserGroupChanges = createUserGroupChangesProcessor({ logger, tryCreateUserGroup });
 * await processUserGroupChanges({
 *   op: PermissionsOperation.Insert,
 *   userGroupId: 'a1b2c3d4-uuid',
 *   orgKey: 'org_abc123',
 * });
 */
export const createUserGroupChangesProcessor =
  ({ logger, tryCreateUserGroup }: CreateUserGroupChangesProcessorProps) =>
  async (params: ProcessUserGroupChangesParams) => {
    const { op, userGroupId, orgKey } = params;
    logger.info('Processing user group changes', { op, userGroupId, orgKey });

    if (op === PermissionsOperation.Insert) {
      logger.info('Processing INSERT operation');

      await tryCreateUserGroup(userGroupId, orgKey);
      logger.info('User group created successfully in Permit', {
        userGroupId,
        orgKey,
      });

      return;
    }
  };
