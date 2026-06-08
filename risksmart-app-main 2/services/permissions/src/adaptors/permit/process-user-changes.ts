import type { Logger } from '@aws-lambda-powertools/logger';
import type { PermitSDK } from '@risksmart-app/permitio/src/types';

import { PermissionsOperation } from '../../types';

export interface ProcessUserChangesParams {
  op: PermissionsOperation.Insert | PermissionsOperation.Delete;
  userId: string;
}

export interface CreateUserChangesProcessorProps {
  logger: Logger;
  tryCreateUser: PermitSDK['tryCreateUser'];
  tryDeleteUser: PermitSDK['tryDeleteUser'];
}

/**
 * Creates a processor for user lifecycle changes.
 *
 * This processor handles:
 * - INSERT: Creates a new user
 * - DELETE: Deletes a user
 *
 * @example
 * const processUserChanges = createUserChangesProcessor({ logger, tryCreateUser, tryDeleteUser });
 * await processUserChanges({
 *   op: PermissionsOperation.Insert,
 *   userId: 'auth0|abc123',
 * });
 */
export const createUserChangesProcessor =
  ({ logger, tryCreateUser, tryDeleteUser }: CreateUserChangesProcessorProps) =>
  async (params: ProcessUserChangesParams) => {
    const { op, userId } = params;
    logger.info('Processing user changes', { op, userId });

    if (op === PermissionsOperation.Insert) {
      logger.info('Processing INSERT operation');

      await tryCreateUser({ key: userId });
      logger.info('User created successfully in Permit', { userId });

      return;
    }

    if (op === PermissionsOperation.Delete) {
      logger.info('Processing DELETE operation');

      await tryDeleteUser({ key: userId });
      logger.info('User deleted successfully in Permit', { userId });

      return;
    }
  };
