import { AccessTypeEnum, ParentTypeEnum } from 'generated/graphql';
import { backendRouteHandler } from 'src/backendActionApiHandler';
import { checkPermission } from 'src/services/role-access/roleAccessService';
import { getSessionData } from 'src/session';

import { workflows } from '../../approval-workflows/workflows';
import { PutSchema } from './schema';

export const handler = backendRouteHandler(PutSchema, async (request) => {
  const sessionData = getSessionData(request.session_variables);
  await checkPermission(
    request,
    ParentTypeEnum.Acceptance,
    AccessTypeEnum.Update,
    request.input.Id
  );

  const { Id, ...payload } = request.input;

  await workflows['open-acceptance'](sessionData.tenant).execute(request)({
    id: Id,
    orgKey: sessionData.orgKey,
    userId: sessionData.userId,
    data: payload,
  });

  return {
    statusCode: 200,
    body: JSON.stringify({
      affected_rows: 1,
    }),
  };
});
