import {
  AcceptanceStatusEnum,
  AccessTypeEnum,
  ParentTypeEnum,
} from 'generated/graphql';
import { backendRouteHandler } from 'src/backendActionApiHandler';
import { checkPermission } from 'src/services/role-access/roleAccessService';
import { getSessionData } from 'src/session';

import { workflows } from '../../approval-workflows/workflows';
import { CUSTOMER_SUPPORT_ROLE, SYSTEM_USER } from '../../repositories/types';
import { AcceptanceService } from '../../services/acceptance/acceptance.service';
import { ApprovalService } from '../../services/approval/approval.service';
import { PostSchema } from './schema';

export const handler = backendRouteHandler(PostSchema, async (request) => {
  const sessionData = getSessionData(request.session_variables);

  const acceptanceService = AcceptanceService({
    tenant: sessionData.tenant,
    orgKey: sessionData.orgKey,
    userId: sessionData.userId,
    userRole: sessionData.userRole,
  });
  const approvalService = ApprovalService({
    tenant: sessionData.tenant,
    orgKey: sessionData.orgKey,
    userId: SYSTEM_USER,
    userRole: CUSTOMER_SUPPORT_ROLE,
  });

  await checkPermission(
    request,
    ParentTypeEnum.Acceptance,
    AccessTypeEnum.Insert,
    request.input.ParentId
  );

  const approvalsEnabled = await approvalService.enabledForOrg();

  const { ParentId, ...data } = request.input;

  const acceptance = await acceptanceService.create(ParentId, {
    ...data,
    Status: approvalsEnabled ? AcceptanceStatusEnum.Pending : data.Status,
  });

  if (approvalsEnabled) {
    await workflows['open-acceptance'](sessionData.tenant).execute(
      request,
      true
    )({
      id: acceptance.Id,
      orgKey: sessionData.orgKey,
      userId: sessionData.userId,
      data: {
        Status: AcceptanceStatusEnum.Open,
      },
    });
  }

  return {
    statusCode: 200,
    body: JSON.stringify({
      Id: acceptance.Id,
    }),
  };
});
