import crypto from 'crypto';
import type { ObligationAssessmentResultInsertInput } from 'generated/graphql';
import { AccessTypeEnum, ParentTypeEnum } from 'generated/graphql';
import { BadRequest, Forbidden } from 'http-errors';
import { createScheduleRefresh } from 'src/adapters/create-schedule-refresh';
import { backendRouteHandler } from 'src/backendActionApiHandler';
import { getHasuraBackendClientForAction } from 'src/backendGraphqlClient';
import { getAssessment } from 'src/services/assessment/assessmentService';
import { insertObligationAssessmentResult } from 'src/services/assessment-result/assessmentResultService';
import { NodeService } from 'src/services/node/node.service';
import { hasPermission } from 'src/services/role-access/roleAccessService';
import { getSessionData } from 'src/session';

import { ObligationAssessmentResultSchema } from './schema';

export const handler = backendRouteHandler(
  ObligationAssessmentResultSchema,
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
    const nodeIds = [...input.ObligationIds];
    const nodes = await nodeService.findManyByIds(nodeIds);
    if (nodes.length !== nodeIds.length) {
      throw new BadRequest('Object ID(s) not found');
    }

    const allowedParentTypes: ParentTypeEnum[] = [
      ParentTypeEnum.Obligation,
      ParentTypeEnum.InternalAuditReport,
      ParentTypeEnum.ComplianceMonitoringAssessment,
    ];
    if (
      nodes.filter((c) => !allowedParentTypes.includes(c.ObjectType)).length > 0
    ) {
      throw new Forbidden('Invalid parent type');
    }

    const obligationNodes = nodes.filter(
      (c) => c.ObjectType === ParentTypeEnum.Obligation
    );
    if (obligationNodes.length != input.ObligationIds.length) {
      throw new BadRequest('Incorrect number of obligations found.');
    }

    const permissionGranted = await hasPermission(hasuraClient, {
      userId: sessionData.userId,
      parentObject: obligationNodes,
      objectType: ParentTypeEnum.ObligationAssessmentResult,
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
        throw new Forbidden('Assessment not found');
      }

      parentType = ParentTypeEnum.Assessment;
    }

    const hasAssessmentBasedParent = input.AssessmentId;
    const Ids = [];
    const results: ObligationAssessmentResultInsertInput[] = [];
    for (const obligationId of input.ObligationIds) {
      const Id = crypto.randomUUID();
      Ids.push(Id);
      const result: ObligationAssessmentResultInsertInput = {
        Id: Id,
        Rating: input.Rating,
        Rationale: input.Rationale,
        TestDate: input.TestDate,
        CustomAttributeData: input.CustomAttributeData,
        RatingType: hasAssessmentBasedParent ? parentType : 'rating',
        parents: {
          data: [
            {
              ParentId: obligationId,
              ParentType: ParentTypeEnum.Obligation,
              ResultType: ParentTypeEnum.ObligationAssessmentResult,
            },
          ],
        },
      };

      if (hasAssessmentBasedParent) {
        result.parents?.data.push({
          ParentId: input.AssessmentId,
          ParentType: parentType,
          ResultType: ParentTypeEnum.ObligationAssessmentResult,
        });
      }
      results.push(result);
    }
    const result = await insertObligationAssessmentResult(hasuraClient, {
      results,
    });

    if (result == undefined || result === 0) {
      return {
        statusCode: 400,
        body: JSON.stringify({
          error: `failed to create obligation rating`,
        }),
      };
    }

    const { ctx, refreshObligationScheduleState } =
      createScheduleRefresh(sessionData);
    for (const obligationId of input.ObligationIds) {
      await refreshObligationScheduleState(ctx, obligationId);
    }

    return {
      statusCode: 200,
      body: JSON.stringify({
        Ids,
      }),
    };
  }
);
