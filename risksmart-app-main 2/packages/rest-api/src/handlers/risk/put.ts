import { AccessTypeEnum, ParentTypeEnum } from 'generated/graphql';
import { workflows } from 'src/approval-workflows/workflows';
import { backendRouteHandler } from 'src/backendActionApiHandler';
import { checkPermission } from 'src/services/role-access/roleAccessService';
import { getSessionData } from 'src/session';

import { PutSchema } from './schema';

export const handler = backendRouteHandler(PutSchema, async (body) => {
  const sessionData = getSessionData(body.session_variables);
  const { Id, ...input } = body.input.object;

  await checkPermission(body, ParentTypeEnum.Risk, AccessTypeEnum.Update, Id);

  // Run the workflow using the `.execute` function.
  await workflows['update-risk-details'](sessionData.tenant).execute(body)({
    id: Id,
    orgKey: sessionData.orgKey,
    userId: sessionData.userId,
    data: {
      Id,
      ParentRiskId: input.ParentRiskId,
      Title: input.Title,
      Tier: input.Tier,
      Status: input.Status,
      Treatment: input.Treatment,

      Description: input.Description,
      CustomAttributeData: input.CustomAttributeData,

      Owners: input.OwnerUserIds.map((UserId) => ({ UserId, ParentId: Id })),
      OwnerIds: input.OwnerUserIds,
      Contributors: input.ContributorUserIds.map((UserId) => ({
        UserId,
        ParentId: Id,
      })),
      ContributorIds: input.ContributorUserIds,
      OwnerGroups: input.OwnerGroupIds.map((UserGroupId) => ({
        UserGroupId,
        ParentId: Id,
      })),
      OwnerGroupIds: input.OwnerGroupIds,
      ContributorGroups: input.ContributorGroupIds.map((UserGroupId) => ({
        UserGroupId,
        ParentId: Id,
      })),
      ContributorGroupIds: input.ContributorGroupIds,
      tags: input.TagTypeIds.map((TagTypeId) => ({
        TagTypeId,
        ParentId: Id,
      })),
      TagTypeIds: input.TagTypeIds,
      departments: input.DepartmentTypeIds.map((DepartmentTypeId) => ({
        DepartmentTypeId,
        ParentId: Id,
      })),
      DepartmentTypeIds: input.DepartmentTypeIds,
      schedule: {
        ...input.schedule,
        Id: Id,
      },
    },
  });

  return {
    statusCode: 200,
    body: JSON.stringify({
      Id,
    }),
  };
});
