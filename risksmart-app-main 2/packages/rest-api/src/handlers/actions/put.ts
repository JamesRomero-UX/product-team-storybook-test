import { hasLengthAtLeast } from '@risksmart-app/shared/typeGuards';
import { AccessTypeEnum, ParentTypeEnum } from 'generated/graphql';
import { workflows } from 'src/approval-workflows/workflows';
import { backendRouteHandler } from 'src/backendActionApiHandler';
import { CUSTOMER_SUPPORT_ROLE } from 'src/repositories/types';
import { ActionService } from 'src/services/action/action.service';
import { ChangeRequestService } from 'src/services/change-request/change-request.service';
import { checkPermission } from 'src/services/role-access/roleAccessService';
import { getSessionData } from 'src/session';

import { PutSchema } from './schema';

export const handler = backendRouteHandler(PutSchema, async (request) => {
  const sessionData = getSessionData(request.session_variables);
  // IMPORTANT: make sure you use the checkPermission function because the workflow runs in
  // the context of an admin!!
  await checkPermission(
    request,
    ParentTypeEnum.Action,
    AccessTypeEnum.Update,
    request.input.Id
  );

  const { Id, ...payload } = request.input;

  const transformedPayload = {
    Id,
    OwnerIds: payload.OwnerUserIds,
    ContributorIds: payload.ContributorUserIds,
    Contributors: payload.ContributorUserIds.map((cuid) => ({
      ParentId: Id,
      UserId: cuid,
    })),
    Owners: payload.OwnerUserIds.map((ouid) => ({
      ParentId: Id,
      UserId: ouid,
    })),
    ContributorGroups: payload.ContributorGroupIds.map((cg) => ({
      UserGroupId: cg,
      ParentId: Id,
    })),
    OwnerGroups: payload.OwnerGroupIds.map((og) => ({
      UserGroupId: og,
      ParentId: Id,
    })),
    tags: payload.TagTypeIds.map((t) => ({ TagTypeId: t, ParentId: Id })),
    departments: payload.DepartmentTypeIds.map((d) => ({
      DepartmentTypeId: d,
      ParentId: Id,
    })),
    ...payload,
  };

  const closeResults = await workflows['close-action'](
    sessionData.tenant
  ).executeBulkDryRun(request)([
    {
      id: Id,
      orgKey: sessionData.orgKey,
      userId: sessionData.userId,
      data: transformedPayload,
    },
  ]);

  const updateResults = await workflows['update-action-details'](
    sessionData.tenant
  ).executeBulkDryRun(request)([
    {
      id: Id,
      orgKey: sessionData.orgKey,
      userId: sessionData.userId,
      data: transformedPayload,
    },
  ]);

  const updateTargetCloseDateResults = await workflows[
    'update-action-target-close-date'
  ](sessionData.tenant).executeBulkDryRun(request)([
    {
      id: Id,
      orgKey: sessionData.orgKey,
      userId: sessionData.userId,
      data: transformedPayload,
    },
  ]);

  // Check for approval requirements
  const changeRequestService = ChangeRequestService({
    tenant: sessionData.tenant,
    orgKey: sessionData.orgKey,
    userId: sessionData.userId,
    userRole: CUSTOMER_SUPPORT_ROLE,
  });

  // Action closure takes priority over action update
  if (
    hasLengthAtLeast(closeResults, 1) &&
    closeResults[0].result === 'change-request-required'
  ) {
    const result = await changeRequestService.create(
      closeResults[0].data.data,
      closeResults[0].data.type
    );

    return {
      statusCode: 200,
      body: JSON.stringify({
        affected_rows: 1,
        change_request_id: result[0]?.Id,
      }),
    };
  }

  // Update target close date takes priority over action update
  if (
    hasLengthAtLeast(updateTargetCloseDateResults, 1) &&
    updateTargetCloseDateResults[0].result === 'change-request-required'
  ) {
    const result = await changeRequestService.create(
      updateTargetCloseDateResults[0].data.data,
      updateTargetCloseDateResults[0].data.type
    );

    return {
      statusCode: 200,
      body: JSON.stringify({
        affected_rows: 1,
        change_request_id: result[0]?.Id,
      }),
    };
  }

  if (
    hasLengthAtLeast(updateResults, 1) &&
    updateResults[0].result === 'change-request-required'
  ) {
    const result = await changeRequestService.create(
      updateResults[0].data.data,
      updateResults[0].data.type
    );

    return {
      statusCode: 200,
      body: JSON.stringify({
        affected_rows: 1,
        change_request_id: result[0]?.Id,
      }),
    };
  }

  // If no approval required, update
  const service = ActionService({
    tenant: sessionData.tenant,
    orgKey: sessionData.orgKey,
    userId: sessionData.userId,
    userRole: CUSTOMER_SUPPORT_ROLE,
  });

  await service.updateByPk(Id, sessionData.userId, transformedPayload);

  return {
    statusCode: 200,
    body: JSON.stringify({ affected_rows: 1 }),
  };
});
