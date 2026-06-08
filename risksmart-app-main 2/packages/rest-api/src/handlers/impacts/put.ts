import { AccessTypeEnum, ParentTypeEnum } from 'generated/graphql';
import { Forbidden } from 'http-errors';
import { backendRouteHandler } from 'src/backendActionApiHandler';
import { getHasuraBackendClientForAction } from 'src/backendGraphqlClient';
import { getRisksmartApiClient } from 'src/repositories/getRisksmartApiClient';
import { hasPermission } from 'src/services/role-access/roleAccessService';
import { getSessionData } from 'src/session';

import { PutSchema } from './schema';

export const handler = backendRouteHandler(PutSchema, async (body) => {
  const sessionData = getSessionData(body.session_variables);
  const hasuraClient = await getHasuraBackendClientForAction(body);
  const apiClient = getRisksmartApiClient(hasuraClient);
  const input = body.input.object;

  const permissionGranted = await hasPermission(hasuraClient, {
    userId: sessionData.userId,
    objectType: ParentTypeEnum.Impact,
    accessType: AccessTypeEnum.Update,
  });
  if (!permissionGranted) {
    throw new Forbidden('Access denied');
  }
  const result = await apiClient.updateImpact({
    CustomAttributeData: input.CustomAttributeData,
    owners: input.OwnerUserIds.map((id) => ({
      UserId: id,
      ParentId: input.Id,
    })),
    ownerGroups: input.OwnerGroupIds.map((id) => ({
      UserGroupId: id,
      ParentId: input.Id,
    })),
    Name: input.Name,
    LikelihoodAppetite: input.LikelihoodAppetite,
    Rationale: input.Rationale,
    RatingGuidance: input.RatingGuidance,
    Id: input.Id,
    ownerIds: input.OwnerUserIds,
    ownerGroupIds: input.OwnerGroupIds,
  });

  return {
    statusCode: 200,
    body: JSON.stringify({
      affected_rows: result.update_impact?.affected_rows,
    }),
  };
});
