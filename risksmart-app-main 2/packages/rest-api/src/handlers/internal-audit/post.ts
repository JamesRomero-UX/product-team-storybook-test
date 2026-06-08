import { AccessTypeEnum, ParentTypeEnum } from 'generated/graphql';
import { Forbidden } from 'http-errors';
import { backendRouteHandler } from 'src/backendActionApiHandler';
import { getHasuraBackendClientForAction } from 'src/backendGraphqlClient';
import { insertInternalAudit } from 'src/services/internal-audit/internalAuditService';
import { hasPermission } from 'src/services/role-access/roleAccessService';
import { getSessionData } from 'src/session';

import { InternalAuditPostSchema } from './schema';

export const handler = backendRouteHandler(
  InternalAuditPostSchema,
  async (body) => {
    const hasuraClient = await getHasuraBackendClientForAction(body);
    const sessionData = getSessionData(body.session_variables);
    const input = body.input.Input;

    const permissionGranted = await hasPermission(hasuraClient, {
      userId: sessionData.userId,
      parentObject: undefined,
      objectType: ParentTypeEnum.InternalAuditEntity,
      accessType: AccessTypeEnum.Insert,
    });
    if (!permissionGranted) {
      throw new Forbidden('Access denied');
    }
    const id = await insertInternalAudit(hasuraClient, {
      Title: input.Title,
      Description: input.Description,
      BusinessArea: input.BusinessArea,
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

    return {
      statusCode: 200,
      body: JSON.stringify({
        Id: id,
      }),
    };
  }
);
