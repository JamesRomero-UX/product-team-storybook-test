import { AccessTypeEnum, ParentTypeEnum } from 'generated/graphql';
import { Forbidden } from 'http-errors';
import { backendRouteHandler } from 'src/backendActionApiHandler';
import { getHasuraBackendClientForAction } from 'src/backendGraphqlClient';
import { getRisksmartApiClient } from 'src/repositories/getRisksmartApiClient';
import { hasPermission } from 'src/services/role-access/roleAccessService';
import { getSessionData } from 'src/session';

import { PostSchema } from './schema';

export const handler = backendRouteHandler(PostSchema, async (body) => {
  const sessionData = getSessionData(body.session_variables);
  const hasuraClient = await getHasuraBackendClientForAction(body);
  const input = body.input.object;
  const apiClient = getRisksmartApiClient(hasuraClient);
  const permissionGranted = await hasPermission(hasuraClient, {
    userId: sessionData.userId,
    objectType: ParentTypeEnum.Impact,
    accessType: AccessTypeEnum.Insert,
  });
  if (!permissionGranted) {
    throw new Forbidden('Access denied');
  }
  const result = await apiClient.insertImpact({
    CustomAttributeData: input.CustomAttributeData,
    Owners: input.OwnerUserIds.map((id) => ({
      UserId: id,
    })),
    OwnerGroups: input.OwnerGroupIds.map((id) => ({
      UserGroupId: id,
    })),
    Name: input.Name,
    LikelihoodAppetite: input.LikelihoodAppetite,
    Rationale: input.Rationale,
    RatingGuidance: input.RatingGuidance,
  });

  return {
    statusCode: 200,
    body: JSON.stringify({
      Id: result.insert_impact_one?.Id,
    }),
  };
});
