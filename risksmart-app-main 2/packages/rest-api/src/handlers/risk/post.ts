import { randomUUID } from 'crypto';
import { AccessTypeEnum, ParentTypeEnum } from 'generated/graphql';
import { Forbidden } from 'http-errors';
import { createScheduleRefresh } from 'src/adapters/create-schedule-refresh';
import { backendRouteHandler } from 'src/backendActionApiHandler';
import { getHasuraBackendClientForAction } from 'src/backendGraphqlClient';
import { getRisksmartApiClient } from 'src/repositories/getRisksmartApiClient';
import { getNode } from 'src/services/node/nodeService';
import { isOrgModuleEnabled } from 'src/services/orgUtilities';
import type { ObjectWithContributors } from 'src/services/role-access/roleAccessService';
import { hasPermission } from 'src/services/role-access/roleAccessService';
import { getSessionData } from 'src/session';

import { PostSchema } from './schema';

export const handler = backendRouteHandler(PostSchema, async (body) => {
  const hasuraClient = await getHasuraBackendClientForAction(body);
  const apiClient = getRisksmartApiClient(hasuraClient);

  const sessionData = getSessionData(body.session_variables);
  let parent: ObjectWithContributors | null | undefined = null;
  const input = body.input.object;
  if (input.ParentRiskId) {
    const parentNode = await getNode(hasuraClient, input.ParentRiskId);

    const allowedParentTypes: ParentTypeEnum[] = [ParentTypeEnum.Risk];
    if (!parentNode) {
      throw new Forbidden('Access to parent denied');
    }
    if (!allowedParentTypes.includes(parentNode.ObjectType)) {
      throw new Forbidden('Invalid parent type');
    }
    parent = parentNode;
  }

  const permissionGranted = await hasPermission(hasuraClient, {
    userId: sessionData.userId,
    parentObject: parent,
    objectType: ParentTypeEnum.Risk,
    accessType: AccessTypeEnum.Insert,
  });
  if (!permissionGranted) {
    throw new Forbidden('Access denied');
  }

  if (input.Tier === 1) {
    const canInsertTier1Risk = await hasPermission(hasuraClient, {
      userId: sessionData.userId,
      objectType: ParentTypeEnum.RiskTier_1,
      accessType: AccessTypeEnum.Insert,
    });
    if (!canInsertTier1Risk) {
      throw new Forbidden('Access denied');
    }
  }
  const id = randomUUID();

  const result = await apiClient.insertChildRisk({
    Id: id,
    ParentRiskId: input.ParentRiskId,
    Title: input.Title,
    Tier: input.Tier,
    Status: input.Status,
    Description: input.Description,
    Treatment: input.Treatment,
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
    schedule: {
      ...input.schedule,
      Id: id,
    },
  });
  const riskId = result.insert_risk_one?.Id;
  if (!riskId) {
    throw new Error('Missing risk id');
  }

  const { ctx, refreshRiskScheduleState } = createScheduleRefresh(sessionData);
  const useImpacts = await isOrgModuleEnabled(
    { orgKey: sessionData.orgKey, tenant: sessionData.tenant },
    'risk.subModules.impact'
  );
  await refreshRiskScheduleState(ctx, riskId, { useImpacts });

  return {
    statusCode: 200,
    body: JSON.stringify({
      Id: result.insert_risk_one?.Id,
    }),
  };
});
