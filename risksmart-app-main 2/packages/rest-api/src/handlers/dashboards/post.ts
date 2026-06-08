import crypto from 'crypto';
import {
  AccessTypeEnum,
  DashboardSharingTypeEnum,
  ParentTypeEnum,
} from 'generated/graphql';
import { Forbidden } from 'http-errors';
import { backendRouteHandler } from 'src/backendActionApiHandler';
import { getHasuraBackendClientForAction } from 'src/backendGraphqlClient';
import { insertDashboard } from 'src/services/dashboard/dashboardService';
import { hasPermission } from 'src/services/role-access/roleAccessService';
import { getSessionData } from 'src/session';

import { PostSchema } from './schema';

export const handler = backendRouteHandler(PostSchema, async (body) => {
  const userId = getSessionData(body.session_variables).userId;
  const hasuraClient = await getHasuraBackendClientForAction(body);
  const input = body.input;

  const permissionGranted = await hasPermission(hasuraClient, {
    userId: userId,
    objectType: ParentTypeEnum.Dashboard,
    accessType: AccessTypeEnum.Insert,
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
  const Id = crypto.randomUUID();
  const id = await insertDashboard(hasuraClient, {
    Id,
    Name: input.Name,
    Description: input.Description,
    Sharing: input.Sharing,
    Content: input.Content,
    Contributors: input.ContributorUserIds.map((id) => ({
      UserId: id,
      ParentId: Id,
    })),
    ContributorGroups: input.ContributorGroupIds.map((id) => ({
      UserGroupId: id,
      ParentId: Id,
    })),
    // Creator becomes the only owner
    Owners: [{ UserId: userId, ParentId: Id }],
  });

  return {
    statusCode: 200,
    body: JSON.stringify({
      Id: id,
    }),
  };
});
