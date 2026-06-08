import { AccessTypeEnum, ParentTypeEnum } from 'generated/graphql';
import { workflows } from 'src/approval-workflows/workflows';
import { backendRouteHandler } from 'src/backendActionApiHandler';
import type { UpdateByPkInput } from 'src/repositories/control/control.repository';
import { checkPermission } from 'src/services/role-access/roleAccessService';
import { getSessionData } from 'src/session';

import { PutSchema } from './schema';

export const handler = backendRouteHandler(PutSchema, async (request) => {
  const sessionData = getSessionData(request.session_variables);
  // IMPORTANT: make sure you use the checkPermission function because the workflow runs in
  // the context of an admin!!
  await checkPermission(
    request,
    ParentTypeEnum.Control,
    AccessTypeEnum.Update,
    request.input.object.Id
  );
  const { Id, ...payload } = request.input.object;

  const transformedPayload: UpdateByPkInput = {
    Id,
    CustomAttributeData: payload.CustomAttributeData,
    Title: payload.Title,
    Description: payload.Description,
    Type: payload.Type,
    OriginalTimestamp: payload.OriginalTimestamp,
    ContributorGroupIds: payload.ContributorGroupIds,
    TagTypeIds: payload.TagTypeIds,
    DepartmentTypeIds: payload.DepartmentTypeIds,
    OwnerGroupIds: payload.OwnerGroupIds,
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
    schedule: {
      ...payload.schedule,
      Id,
    },
  };

  await workflows['update-control-details'](sessionData.tenant).execute(
    request
  )({
    id: Id,
    orgKey: sessionData.orgKey,
    userId: sessionData.userId,
    data: transformedPayload,
  });

  return {
    statusCode: 200,
    body: JSON.stringify({ affected_rows: 1 }),
  };
});
