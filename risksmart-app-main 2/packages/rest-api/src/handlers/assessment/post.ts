import { randomUUID } from 'node:crypto';

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
    objectType: ParentTypeEnum.Assessment,
    accessType: AccessTypeEnum.Insert,
  });
  if (!permissionGranted) {
    throw new Forbidden('Access denied');
  }
  const id = randomUUID();
  const result = await apiClient.insertAssessment({
    Id: id,
    Title: input.Title,
    Summary: input.Summary,
    ActualCompletionDate: input.ActualCompletionDate,
    NextTestDate: input.NextTestDate,
    StartDate: input.StartDate,
    TargetCompletionDate: input.TargetCompletionDate,
    CompletedByUser: input.CompletedByUser,
    Status: input.Status,
    CustomAttributeData: input.CustomAttributeData,
    Outcome: input.Outcome,
    OriginatingItemId: input.OriginatingItemId,
    Owners: input.OwnerUserIds.map((UserId) => ({ UserId, ParentId: id })),
    Contributors: input.ContributorUserIds.map((UserId) => ({
      UserId,
      ParentId: id,
    })),
    OwnerGroups: input.OwnerGroupIds.map((UserGroupId) => ({
      UserGroupId,
      ParentId: id,
    })),
    ContributorGroups: input.ContributorGroupIds.map((UserGroupId) => ({
      UserGroupId,
      ParentId: id,
    })),
    Tags: input.TagTypeIds.map((TagTypeId) => ({ TagTypeId, ParentId: id })),
    Departments: input.DepartmentTypeIds.map((DepartmentTypeId) => ({
      DepartmentTypeId,
      ParentId: id,
    })),
  });
  const assessmentId = result.insert_assessment_one?.Id;
  if (!assessmentId) {
    throw new Error('Missing assessment id');
  }

  return {
    statusCode: 200,
    body: JSON.stringify({
      Id: assessmentId,
    }),
  };
});
