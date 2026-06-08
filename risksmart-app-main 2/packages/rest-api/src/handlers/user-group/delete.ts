import { backendRouteHandler } from '../../backendActionApiHandler';
import { getHasuraBackendClientForAction } from '../../backendGraphqlClient';
import { getLogger } from '../../logger';
import { deleteUserGroup } from '../../services/user-group/userGroupService';
import { DeleteSchema } from './schema';

const logger = getLogger();

export const handler = backendRouteHandler(DeleteSchema, async (request) => {
  const hasuraClient = getHasuraBackendClientForAction(request);
  logger.info('Processing user group delete', {
    UserGroupIds: request.input.Ids,
  });
  const result = await deleteUserGroup(hasuraClient, {
    UserGroupIds: request.input.Ids,
  });
  logger.info('user groups deleted', {
    UserGroupCount: result,
  });

  return {
    statusCode: 200,
    body: JSON.stringify({
      affected_rows: result,
    }),
  };
});
