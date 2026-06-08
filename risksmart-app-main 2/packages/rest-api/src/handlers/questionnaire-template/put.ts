import { AccessTypeEnum, ParentTypeEnum } from 'generated/graphql';
import { backendRouteHandler } from 'src/backendActionApiHandler';
import { getHasuraBackendClientForAction } from 'src/backendGraphqlClient';
import { getRisksmartApiClient } from 'src/repositories/getRisksmartApiClient';
import { checkPermission } from 'src/services/role-access/roleAccessService';

import { PutSchema } from './schema';

export const handler = backendRouteHandler(PutSchema, async (body) => {
  const hasuraClient = await getHasuraBackendClientForAction(body);
  const apiClient = getRisksmartApiClient(hasuraClient);
  const input = body.input.object;

  await checkPermission(
    body,
    ParentTypeEnum.QuestionnaireTemplate,
    AccessTypeEnum.Update,
    body.input.object.Id
  );

  const result = await apiClient.updateQuestionnaireTemplate({
    Id: input.Id,
    ownerIds: input.OwnerUserIds,
    contributorIds: input.ContributorUserIds,

    ownerGroupIds: input.OwnerGroupIds,
    contributorGroupIds: input.ContributorGroupIds,
    TagTypeIds: input.TagTypeIds,
    DepartmentTypeIds: input.DepartmentTypeIds,
    tags: input.TagTypeIds.map((TagTypeId) => ({
      TagTypeId,
      ParentId: input.Id,
    })),
    departments: input.DepartmentTypeIds.map((DepartmentTypeId) => ({
      DepartmentTypeId,
      ParentId: input.Id,
    })),
    contributors: input.ContributorUserIds.map((UserId) => ({
      UserId,
      ParentId: input.Id,
    })),
    owners: input.OwnerUserIds.map((UserId) => ({
      UserId,
      ParentId: input.Id,
    })),
    contributorGroups: input.ContributorGroupIds.map((UserGroupId) => ({
      UserGroupId,
      ParentId: input.Id,
    })),
    ownerGroups: input.OwnerGroupIds.map((UserGroupId) => ({
      UserGroupId,
      ParentId: input.Id,
    })),
    object: {
      Title: input.Title,
      Description: input.Description,
      CustomAttributeData: input.CustomAttributeData,
    },
  });
  const id = result.update_questionnaire_template_by_pk?.Id;
  if (!id) {
    throw new Error('Missing questionnaire template id');
  }

  return {
    statusCode: 200,
    body: JSON.stringify({
      Id: id,
    }),
  };
});
