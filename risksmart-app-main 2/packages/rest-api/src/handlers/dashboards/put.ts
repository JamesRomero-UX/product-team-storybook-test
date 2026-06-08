import {
  AccessTypeEnum,
  DashboardSharingTypeEnum,
  ParentTypeEnum,
} from 'generated/graphql';
import { Forbidden } from 'http-errors';
import { backendRouteHandler } from 'src/backendActionApiHandler';
import { getHasuraBackendClientForAction } from 'src/backendGraphqlClient';
import { updateDashboard } from 'src/services/dashboard/dashboardService';
import { getNode } from 'src/services/node/nodeService';
import { hasPermission } from 'src/services/role-access/roleAccessService';
import { getSessionData } from 'src/session';

import { PutSchema } from './schema';

export const handler = backendRouteHandler(PutSchema, async (body) => {
  const userId = getSessionData(body.session_variables).userId;
  const hasuraClient = await getHasuraBackendClientForAction(body);
  const input = body.input;

  const dashboard = await getNode(hasuraClient, input.Id);

  const permissionGranted = await hasPermission(hasuraClient, {
    userId: userId,
    objectType: ParentTypeEnum.Dashboard,
    accessType: AccessTypeEnum.Update,
    parentObject: dashboard,
  });
  if (!permissionGranted) {
    throw new Forbidden('Access denied');
  }

  const organisationPermissionGranted = await hasPermission(hasuraClient, {
    userId: userId,
    objectType: ParentTypeEnum.OrganisationDashboard,
    accessType: AccessTypeEnum.Insert,
  });
  if (
    !organisationPermissionGranted &&
    input.Sharing === DashboardSharingTypeEnum.Organisation
  ) {
    throw new Forbidden('Access denied');
  }

  const id = await updateDashboard(hasuraClient, {
    Id: input.Id,
    Name: input.Name,
    Description: input.Description,
    Sharing: input.Sharing,
    Content: input.Content,
    contributors: input.ContributorUserIds.map((id) => ({
      UserId: id,
      ParentId: input.Id,
    })),
    contributorIds: input.ContributorUserIds,
    contributorGroups: input.ContributorGroupIds.map((id) => ({
      UserGroupId: id,
      ParentId: input.Id,
    })),
    contributorGroupIds: input.ContributorGroupIds,
  });

  return {
    statusCode: 200,
    body: JSON.stringify({
      Id: id,
    }),
  };
});
