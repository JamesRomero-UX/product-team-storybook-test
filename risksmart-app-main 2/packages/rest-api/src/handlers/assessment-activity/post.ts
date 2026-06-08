import { randomUUID } from 'crypto';
import { AccessTypeEnum, ParentTypeEnum } from 'generated/graphql';
import { Forbidden } from 'http-errors';
import { backendRouteHandler } from 'src/backendActionApiHandler';
import { getHasuraBackendClientForAction } from 'src/backendGraphqlClient';
import { insertAssessmentActivity } from 'src/services/assessmentActivityService';
import { linkItems } from 'src/services/linked-item/linkedItemService';
import { getNode } from 'src/services/node/nodeService';
import { hasPermission } from 'src/services/role-access/roleAccessService';
import { getSessionData } from 'src/session';

import { AssessmentActivityPostSchema } from './schema';

export const handler = backendRouteHandler(
  AssessmentActivityPostSchema,
  async (body) => {
    const hasuraClient = await getHasuraBackendClientForAction(body);
    const sessionData = getSessionData(body.session_variables);
    const input = body.input;
    const parent = await getNode(hasuraClient, input.ParentId);
    const allowedParentTypes: ParentTypeEnum[] = [
      ParentTypeEnum.Assessment,
      ParentTypeEnum.InternalAuditReport,
      ParentTypeEnum.ComplianceMonitoringAssessment,
    ];
    if (!parent) {
      throw new Forbidden('Access to parent denied');
    }
    if (!allowedParentTypes.includes(parent.ObjectType)) {
      throw new Forbidden('Invalid parent type');
    }

    const permissionGranted = await hasPermission(hasuraClient, {
      userId: sessionData.userId,
      parentObject: parent,
      objectType: ParentTypeEnum.AssessmentActivity,
      accessType: AccessTypeEnum.Insert,
    });
    if (!permissionGranted) {
      throw new Forbidden('Access denied');
    }

    const id = randomUUID();

    const resultId = await insertAssessmentActivity(hasuraClient, {
      Id: id,
      ActivityType: input.ActivityType,
      ParentId: input.ParentId,
      CompletionDate: input.CompletionDate,
      AssignedUser: input.AssignedUser,
      Status: input.Status,
      Summary: input.Summary,
      Title: input.Title,
      CustomAttributeData: input.CustomAttributeData,
      IsRCSA: input.IsRCSA ?? false,
      RiskId: input.RiskId,
      Owners: input.OwnerUserIds.map((UserId) => ({
        UserId,
        ParentId: id,
      })),
      OwnerGroups: input.OwnerGroupIds.map((UserGroupId) => ({
        UserGroupId,
        ParentId: id,
      })),
    });

    if (resultId == undefined) {
      return {
        statusCode: 400,
        body: JSON.stringify({
          error: `failed to create assessment activity`,
        }),
      };
    }

    if (input.LinkedItemIds.length > 0) {
      await linkItems(hasuraClient, {
        Source: resultId,
        Targets: input.LinkedItemIds,
      });
    }

    return {
      statusCode: 200,
      body: JSON.stringify({
        Id: resultId,
      }),
    };
  }
);
