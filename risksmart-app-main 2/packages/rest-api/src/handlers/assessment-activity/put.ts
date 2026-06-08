import { AccessTypeEnum, ParentTypeEnum } from 'generated/graphql';
import { Forbidden } from 'http-errors';
import { backendRouteHandler } from 'src/backendActionApiHandler';
import { getHasuraBackendClientForAction } from 'src/backendGraphqlClient';
import { ModifiedSinceLastViewError } from 'src/errors/ModifiedSinceLastViewError';
import {
  getAssessmentActivityWithLinkedItemsById,
  updateAssessmentActivity,
} from 'src/services/assessmentActivityService';
import {
  linkItems,
  unlinkItems,
} from 'src/services/linked-item/linkedItemService';
import { getNode } from 'src/services/node/nodeService';
import { hasPermission } from 'src/services/role-access/roleAccessService';
import { getSessionData } from 'src/session';

import { AssessmentActivityPutSchema } from './schema';

export const handler = backendRouteHandler(
  AssessmentActivityPutSchema,
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

    const assessmentActivities = await getAssessmentActivityWithLinkedItemsById(
      hasuraClient,
      {
        AssessmentActivityId: input.Id,
      }
    );
    const assessmentActivity = assessmentActivities.assessment_activity[0];
    if (
      assessmentActivity == undefined ||
      assessmentActivity?.ParentId !== input.ParentId
    ) {
      return {
        statusCode: 400,
        body: JSON.stringify({
          error: `assessment activity is not linked to the provided assessment ID`,
        }),
      };
    }

    const originalTimestamp = input.IsWizardAction
      ? assessmentActivity.ModifiedAtTimestamp
      : input.OriginalTimestamp;

    if (!originalTimestamp) {
      throw new Error('OriginalTimestamp is required');
    }

    if (
      new Date(assessmentActivity.ModifiedAtTimestamp).valueOf() !==
        new Date(originalTimestamp).valueOf() &&
      !input.IsWizardAction
    ) {
      throw new ModifiedSinceLastViewError();
    }

    let title = input.Title;
    let summary = input.Summary;
    let owners = input.OwnerUserIds;

    if (input.IsWizardAction) {
      title = assessmentActivity.Title;
      summary = assessmentActivity.Summary;
      owners = [
        ...owners,
        ...assessmentActivity.owners.map((owners) => owners.UserId),
      ];
    }

    const affectedRows = await updateAssessmentActivity(hasuraClient, {
      ActivityType: input.ActivityType,
      OriginalTimestamp: originalTimestamp,
      Id: input.Id,
      CompletionDate: input.CompletionDate,
      AssignedUser: input.AssignedUser,
      Status: input.Status,
      Summary: summary ?? '',
      Title: title ?? '',
      CustomAttributeData: input.CustomAttributeData,
      Owners: owners.map((UserId) => ({
        UserId,
        ParentId: input.Id,
      })),
      OwnerUserIds: input.OwnerUserIds,
      OwnerGroups: input.OwnerGroupIds.map((UserGroupId) => ({
        UserGroupId,
        ParentId: input.Id,
      })),
      OwnerGroupIds: input.OwnerGroupIds,
    });

    if (affectedRows == undefined || affectedRows === 0) {
      return {
        statusCode: 400,
        body: JSON.stringify({
          error: `failed to update assessment activity`,
        }),
      };
    }

    const idsToLink: string[] = input.LinkedItemIds.filter(
      (c) => !assessmentActivities.linked_item.map((d) => d.Target).includes(c)
    );
    const idsToUnLink: string[] = assessmentActivities.linked_item
      .filter((c) => !input.LinkedItemIds.includes(c.Target))
      .map((c) => c.Id);

    if (idsToLink.length > 0) {
      await linkItems(hasuraClient, {
        Source: input.Id,
        Targets: idsToLink,
      });
    }

    if (idsToUnLink.length > 0) {
      await unlinkItems(hasuraClient, {
        Ids: idsToUnLink,
      });
    }

    return {
      statusCode: 200,
      body: JSON.stringify({
        Id: input.Id,
      }),
    };
  }
);
