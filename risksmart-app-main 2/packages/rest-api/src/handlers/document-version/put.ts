import { AccessTypeEnum, ParentTypeEnum } from 'generated/graphql';
import { backendRouteHandler } from 'src/backendActionApiHandler';
import { getSessionData } from 'src/session';

import { workflows } from '../../approval-workflows/workflows';
import { checkPermission } from '../../services/role-access/roleAccessService';
import { PutSchema } from './schema';

export const handler = backendRouteHandler(PutSchema, async (request) => {
  const sessionData = getSessionData(request.session_variables);
  await checkPermission(
    request,
    ParentTypeEnum.DocumentFile,
    AccessTypeEnum.Update,
    request.input.Id
  );

  const { Id, ...payload } = request.input;

  await workflows['publish-document-version'](sessionData.tenant).execute(
    request
  )({
    id: Id,
    orgKey: sessionData.orgKey,
    userId: sessionData.userId,
    data: payload,
  });

  return {
    statusCode: 200,
    body: JSON.stringify({ affected_rows: 1 }),
  };
});
