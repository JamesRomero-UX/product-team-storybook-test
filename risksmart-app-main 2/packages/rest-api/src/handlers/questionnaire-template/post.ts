import { AccessTypeEnum, ParentTypeEnum } from 'generated/graphql';
import { Forbidden } from 'http-errors';
import { backendRouteHandler } from 'src/backendActionApiHandler';
import { getHasuraBackendClientForAction } from 'src/backendGraphqlClient';
import { getRisksmartApiClient } from 'src/repositories/getRisksmartApiClient';
import { hasPermission } from 'src/services/role-access/roleAccessService';
import { getSessionData } from 'src/session';

import { PostSchema } from './schema';

export const handler = backendRouteHandler(PostSchema, async (body) => {
  const hasuraClient = await getHasuraBackendClientForAction(body);
  const apiClient = getRisksmartApiClient(hasuraClient);
  const sessionData = getSessionData(body.session_variables);
  const input = body.input.object;

  const permissionGranted = await hasPermission(hasuraClient, {
    userId: sessionData.userId,
    objectType: ParentTypeEnum.QuestionnaireTemplate,
    accessType: AccessTypeEnum.Insert,
  });
  if (!permissionGranted) {
    throw new Forbidden('Access denied');
  }

  const result = await apiClient.insertQuestionnaireTemplate({
    Title: input.Title,
    Description: input.Description,
    CustomAttributeData: input.CustomAttributeData,
    Owners: input.OwnerUserIds.map((UserId) => ({ UserId })),
    Contributors: input.ContributorUserIds.map((UserId) => ({
      UserId,
    })),
    OwnerGroups: input.OwnerGroupIds.map((UserGroupId) => ({
      UserGroupId,
    })),
    ContributorGroups: input.ContributorGroupIds.map((UserGroupId) => ({
      UserGroupId,
    })),
    Tags: input.TagTypeIds.map((TagTypeId) => ({ TagTypeId })),
    Departments: input.DepartmentTypeIds.map((DepartmentTypeId) => ({
      DepartmentTypeId,
    })),
  });
  const id = result.insert_questionnaire_template_one?.Id;
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
