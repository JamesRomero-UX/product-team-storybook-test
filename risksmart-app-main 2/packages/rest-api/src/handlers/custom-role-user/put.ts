import { backendRouteHandler } from 'src/backendActionApiHandler';
import { getLogger } from 'src/logger';
import { buildUpdateCustomRoleUserCommandHandler } from 'src/services/custom-role-user/update-custom-role-user-command-handler';
import { getSessionData } from 'src/session';

import { CustomRoleUserPutSchema } from './schema';

const logger = getLogger();

export const handler = backendRouteHandler(
  CustomRoleUserPutSchema,
  async (body) => {
    const sessionData = getSessionData(body.session_variables);
    const commandHandler = buildUpdateCustomRoleUserCommandHandler(sessionData);

    const input = body.input.Input;

    logger.info('Updating custom role user', {
      userId: input.UserId,
      customRoleIds: input.CustomRoleIds,
    });

    try {
      const result = await commandHandler.execute({
        userId: input.UserId,
        customRoleIds: input.CustomRoleIds,
      });

      logger.info('Custom role user update completed', {
        affectedRows: result.affectedRows,
      });

      return {
        statusCode: 200,
        body: JSON.stringify({
          affected_rows: result.affectedRows,
        }),
      };
    } catch (error) {
      logger.error('Failed to update custom roles for user', {
        error: error instanceof Error ? error.message : 'Unknown error',
        userId: input.UserId,
      });

      return {
        statusCode: 400,
        body: JSON.stringify({
          error: 'Failed to update custom roles for the user.',
        }),
      };
    }
  }
);
