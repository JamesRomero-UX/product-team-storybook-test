import {
  AccessTypeEnum,
  ParentTypeEnum,
  VersionStatusEnum,
} from 'generated/graphql';
import { backendRouteHandler } from 'src/backendActionApiHandler';
import { getSessionData } from 'src/session';

import { DocumentVersionService } from '../../services/document-version/document-version.service';
import { checkPermission } from '../../services/role-access/roleAccessService';
import { PostSchema } from './schema';

export const handler = backendRouteHandler(PostSchema, async (request) => {
  const sessionData = getSessionData(request.session_variables);
  await checkPermission(
    request,
    ParentTypeEnum.DocumentFile,
    AccessTypeEnum.Insert,
    request.input.ParentDocumentId
  );

  const document = await DocumentVersionService({
    tenant: sessionData.tenant,
    orgKey: sessionData.orgKey,
    userId: sessionData.userId,
    userRole: sessionData.userRole,
  }).create({ ...request.input, Status: VersionStatusEnum.Draft });

  return {
    statusCode: 200,
    body: JSON.stringify({
      Id: document.Id,
    }),
  };
});
