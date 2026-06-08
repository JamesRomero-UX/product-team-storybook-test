import { AccessTypeEnum, ParentTypeEnum } from 'generated/graphql';
import { backendRouteHandler } from 'src/backendActionApiHandler';
import {
  getHasuraBackendClient,
  getHasuraBackendClientForAction,
} from 'src/backendGraphqlClient';
import {
  deleteUnusedBusinessAreas,
  updateInternalAudit,
} from 'src/services/internal-audit/internalAuditService';
import { checkPermission } from 'src/services/role-access/roleAccessService';

import { getSessionData } from '../../session';
import { InternalAuditPutSchema } from './schema';

export const handler = backendRouteHandler(
  InternalAuditPutSchema,
  async (body) => {
    const hasuraClient = await getHasuraBackendClientForAction(body);
    const input = body.input.Input;
    await checkPermission(
      body,
      ParentTypeEnum.InternalAuditEntity,
      AccessTypeEnum.Update,
      input.Id
    );

    const rowsUpdated = await updateInternalAudit(hasuraClient, {
      Id: input.Id,
      Title: input.Title,
      Description: input.Description,
      BusinessArea: input.BusinessArea,
      BusinessAreaId: input.BusinessAreaId,
      OriginalTimestamp: input.OriginalTimestamp,
      CustomAttributeData: input.CustomAttributeData,
      ContributorIds: input.ContributorUserIds,
      Contributors: input.ContributorUserIds.map((UserId) => ({
        ParentId: input.Id,
        UserId,
      })),
      ContributorGroups: input.ContributorGroupIds.map((UserGroupId) => ({
        ParentId: input.Id,
        UserGroupId,
      })),
      ContributorGroupIds: input.ContributorGroupIds,
      OwnerIds: input.OwnerUserIds,
      Owners: input.OwnerUserIds.map((UserId) => ({
        ParentId: input.Id,
        UserId,
      })),
      OwnerGroups: input.OwnerGroupIds.map((UserGroupId) => ({
        ParentId: input.Id,
        UserGroupId,
      })),
      OwnerGroupIds: input.OwnerGroupIds,
      TagTypeIds: input.TagTypeIds,
      Tags: input.TagTypeIds.map((TagTypeId) => ({
        ParentId: input.Id,
        TagTypeId,
      })),
      DepartmentTypeIds: input.DepartmentTypeIds,
      Departments: input.DepartmentTypeIds.map((DepartmentTypeId) => ({
        ParentId: input.Id,
        DepartmentTypeId,
      })),
    });
    if (rowsUpdated !== 1) {
      return {
        statusCode: 400,
        body: JSON.stringify({
          rowsUpdated,
        }),
      };
    }

    const sessionData = getSessionData(body.session_variables);
    // Clean up any unused business areas. This needs to validate all IA entities across the org. Elevating role ensures deletion check works as expected.
    await deleteUnusedBusinessAreas(
      getHasuraBackendClient(
        sessionData.tenant,
        sessionData.orgKey,
        sessionData.userId,
        'RiskManager'
      )
    );

    return {
      statusCode: 200,
      body: JSON.stringify({
        Id: input.Id,
      }),
    };
  }
);
