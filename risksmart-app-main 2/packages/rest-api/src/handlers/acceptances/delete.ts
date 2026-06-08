import { hasLengthAtLeast } from '@risksmart-app/shared/typeGuards';
import { getSessionData } from 'src/session';

import { AccessTypeEnum, ParentTypeEnum } from '../../../generated/graphql';
import { workflows } from '../../approval-workflows/workflows';
import { backendRouteHandler } from '../../backendActionApiHandler';
import { CUSTOMER_SUPPORT_ROLE } from '../../repositories/types';
import { AcceptanceService } from '../../services/acceptance/acceptance.service';
import { ChangeRequestService } from '../../services/change-request/change-request.service';
import { isOrgModuleEnabled } from '../../services/orgUtilities';
import { checkPermission } from '../../services/role-access/roleAccessService';
import { DeleteSchema } from './schema';

export const handler = backendRouteHandler(DeleteSchema, async (request) => {
  const sessionData = getSessionData(request.session_variables);
  await checkPermission(
    request,
    ParentTypeEnum.Acceptance,
    AccessTypeEnum.Delete,
    request.input.Ids
  );

  const acceptanceService = AcceptanceService({
    tenant: sessionData.tenant,
    orgKey: sessionData.orgKey,
    userId: sessionData.userId,
    userRole: sessionData.userRole,
  });

  const approvalsEnabled = await isOrgModuleEnabled(
    { orgKey: sessionData.orgKey, tenant: sessionData.tenant },
    'approval'
  );

  // Early return if approvals are not enabled
  if (!approvalsEnabled) {
    await acceptanceService.delete(request.input.Ids);

    return {
      statusCode: 200,
      body: JSON.stringify({
        affected_rows: request.input.Ids.length,
      }),
    };
  }

  // Check for approval requirements
  const changeRequestService = ChangeRequestService({
    tenant: sessionData.tenant,
    orgKey: sessionData.orgKey,
    userId: sessionData.userId,
    userRole: CUSTOMER_SUPPORT_ROLE,
  });

  // Get approval results as a dry-run so that we can create change requests in bulk
  const results = await workflows['delete-acceptance'](
    sessionData.tenant
  ).executeBulkDryRun(request)(
    request.input.Ids.map((id) => ({
      id,
      orgKey: sessionData.orgKey,
      userId: sessionData.userId,
      data: undefined,
    }))
  );

  // Create change requests in bulk
  const changeRequests = results
    .filter((r) => r.result === 'change-request-required')
    .map((r) => {
      if (r.result === 'change-request-required') {
        return r.data;
      }
      throw new Error('this should never happen');
    });

  if (hasLengthAtLeast(changeRequests, 1)) {
    await changeRequestService.create(
      changeRequests.map((c) => c.data),
      changeRequests[0].type
    );
  }

  // Delete controls in bulk
  const deletions = results
    .filter((r) => r.result === 'success')
    .map((r) => {
      if (r.result === 'success') {
        return r.data;
      }
      throw new Error('this should never happen');
    });

  await acceptanceService.delete(deletions.map((d) => d.id));

  return {
    statusCode: 200,
    body: JSON.stringify({
      affected_rows: request.input.Ids.length,
    }),
  };
});
