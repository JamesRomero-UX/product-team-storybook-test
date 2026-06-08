import {
  AccessTypeEnum,
  ApprovalStatusEnum,
  ParentTypeEnum,
} from 'generated/graphql';
import { BadRequest, Forbidden } from 'http-errors';
import { backendRouteHandler } from 'src/backendActionApiHandler';
import { getHasuraBackendClientForAction } from 'src/backendGraphqlClient';
import { CUSTOMER_SUPPORT_ROLE } from 'src/repositories/types';
import { ChangeRequestService } from 'src/services/change-request/change-request.service';
import { getNode } from 'src/services/node/nodeService';
import { hasPermission } from 'src/services/role-access/roleAccessService';
import { getSessionData } from 'src/session';
import { z } from 'zod';

const requestSchema = z.object({
  Id: z.string().uuid(),
  Rationale: z.string().min(1),
  Approved: z.boolean(),
});

export const handler = backendRouteHandler(requestSchema, async (body) => {
  const sessionData = getSessionData(body.session_variables);
  const hasuraClient = getHasuraBackendClientForAction(body);
  const changeRequestService = ChangeRequestService({
    tenant: sessionData.tenant,
    orgKey: sessionData.orgKey,
    userId: sessionData.userId,
    userRole: CUSTOMER_SUPPORT_ROLE,
  });
  const input = body.input;

  const parentObject = await getNode(hasuraClient, input.Id);
  const changeRequest = await changeRequestService.findById(input.Id);

  const permissionGranted = await hasPermission(hasuraClient, {
    userId: sessionData.userId,
    parentObject,
    objectType: ParentTypeEnum.ChangeRequest,
    accessType: AccessTypeEnum.Delete,
  });

  if (!permissionGranted) {
    throw new Forbidden('Access denied');
  }

  if (changeRequest.ChangeRequestStatus !== ApprovalStatusEnum.Pending) {
    throw new BadRequest('Only pending change requests can be overridden');
  }

  await changeRequestService.updateStatus(
    changeRequest,
    input.Approved ? ApprovalStatusEnum.Approved : ApprovalStatusEnum.Rejected,
    input.Rationale,
    sessionData.userId
  );

  if (input.Approved) {
    await changeRequestService.merge(changeRequest);
  }

  return {
    statusCode: 200,
    body: JSON.stringify({
      Id: input.Id,
    }),
  };
});
