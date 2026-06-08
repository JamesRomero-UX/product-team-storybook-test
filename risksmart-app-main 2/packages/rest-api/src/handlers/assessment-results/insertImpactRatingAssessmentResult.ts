import { notEmpty } from '@risksmart-app/shared/typeGuards';
import type {
  AssessmentResultParentInsertInput,
  ImpactRatingInsertInput,
} from 'generated/graphql';
import { AccessTypeEnum, ParentTypeEnum } from 'generated/graphql';
import { BadRequest, Forbidden } from 'http-errors';
import _ from 'lodash';
import { createScheduleRefresh } from 'src/adapters/create-schedule-refresh';
import { backendRouteHandler } from 'src/backendActionApiHandler';
import { getHasuraBackendClientForAction } from 'src/backendGraphqlClient';
import { insertImpactRatings } from 'src/services/impact-rating/impactRatingService';
import { hasPermission } from 'src/services/role-access/roleAccessService';
import { getSessionData } from 'src/session';

import { getAssessment } from '../../services/assessment/assessmentService';
import { NodeService } from '../../services/node/node.service';
import { ImpactRatingAssessmentResultSchema } from './schema';

export const handler = backendRouteHandler(
  ImpactRatingAssessmentResultSchema,
  async (body) => {
    const sessionData = getSessionData(body.session_variables);
    const hasuraClient = await getHasuraBackendClientForAction(body);
    const input = body.input;
    const nodeService = NodeService({
      tenant: sessionData.tenant,
      orgKey: sessionData.orgKey,
      userId: sessionData.userId,
      userRole: sessionData.userRole,
    });
    const hasAssessmentBasedParent = input.AssessmentId;
    const nodeIds = [
      input.RatedItemId,
      ...input.Ratings.map((c) => c.ImpactId),
    ];
    const nodes = await nodeService.findManyByIds(nodeIds);
    if (!nodes) {
      throw new Forbidden('Access to parent denied');
    }
    if (nodes.length !== nodeIds.length) {
      throw new BadRequest('Object ID(s) not found');
    }
    const allowedParentTypes: ParentTypeEnum[] = [
      ParentTypeEnum.Risk,
      ParentTypeEnum.InternalAuditReport,
      ParentTypeEnum.ComplianceMonitoringAssessment,
      ParentTypeEnum.Impact,
    ];
    if (
      nodes.filter((c) => !allowedParentTypes.includes(c.ObjectType)).length > 0
    ) {
      throw new Forbidden('Invalid parent type');
    }
    const riskNodes = nodes.filter((c) => c.ObjectType === ParentTypeEnum.Risk);
    if (riskNodes.length != 1) {
      throw new BadRequest('Incorrect number of risks found.');
    }

    const permissionGranted = await hasPermission(hasuraClient, {
      userId: sessionData.userId,
      parentObject: riskNodes,
      objectType: ParentTypeEnum.ImpactRating,
      accessType: AccessTypeEnum.Insert,
    });
    if (!permissionGranted) {
      throw new Forbidden('Access denied');
    }

    let parentType: ParentTypeEnum = ParentTypeEnum.Assessment;
    if (input.AssessmentId) {
      const data = await getAssessment(hasuraClient, {
        Id: input.AssessmentId,
      });

      if (!data || data.assessment.length === 0) {
        throw new BadRequest('Assessment not found');
      }

      parentType = ParentTypeEnum.Assessment;
    }

    const records: ImpactRatingInsertInput[] = input.Ratings.map((c) => {
      const parents: AssessmentResultParentInsertInput[] = [
        {
          ParentId: c.ImpactId,
          ParentType: ParentTypeEnum.Impact,
          ResultType: ParentTypeEnum.ImpactRating,
        },
      ];
      if (hasAssessmentBasedParent) {
        parents.push({
          ParentId: input.AssessmentId!,
          ParentType: parentType,
          ResultType: ParentTypeEnum.ImpactRating,
        });
      }

      return {
        Rating: c.Rating,
        TestDate: input.TestDate,
        ImpactId: c.ImpactId,
        RatedItemId: input.RatedItemId,
        CompletedBy: input.CompletedBy,
        CustomAttributeData: input.CustomAttributeData,
        RatingType: parentType,
        Likelihood: input.Likelihood,
        assessmentParents: { data: parents },
      };
    });

    const Ids = await insertImpactRatings(hasuraClient, {
      inputs: records,
    });

    if (Ids == undefined || Ids.length === 0) {
      return {
        statusCode: 400,
        body: JSON.stringify({
          error: `failed to create impact rating`,
        }),
      };
    }
    const { ctx, refreshRiskImpactScheduleState } =
      createScheduleRefresh(sessionData);
    const riskIds = _.uniq(records.map((r) => r.RatedItemId).filter(notEmpty));

    for (const riskId of riskIds) {
      await refreshRiskImpactScheduleState(ctx, riskId);
    }

    return {
      statusCode: 200,
      body: JSON.stringify({
        Ids: Ids.map((c) => c.Id),
      }),
    };
  }
);
