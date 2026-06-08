import crypto from 'crypto';
import type { DocumentAssessmentResultInsertInput } from 'generated/graphql';
import { AccessTypeEnum, ParentTypeEnum } from 'generated/graphql';
import { BadRequest, Forbidden } from 'http-errors';
import { createScheduleRefresh } from 'src/adapters/create-schedule-refresh';
import { backendRouteHandler } from 'src/backendActionApiHandler';
import { getHasuraBackendClientForAction } from 'src/backendGraphqlClient';
import { insertDocumentAssessmentResult } from 'src/services/assessment-result/assessmentResultService';
import { hasPermission } from 'src/services/role-access/roleAccessService';
import { getSessionData } from 'src/session';

import { getAssessment } from '../../services/assessment/assessmentService';
import { NodeService } from '../../services/node/node.service';
import { DocumentAssessmentResultSchema } from './schema';

export const handler = backendRouteHandler(
  DocumentAssessmentResultSchema,
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
    const nodeIds = [...input.DocumentIds];
    const nodes = await nodeService.findManyByIds(nodeIds);
    if (nodes.length !== nodeIds.length) {
      throw new BadRequest('Object ID(s) not found');
    }

    const allowedParentTypes: ParentTypeEnum[] = [
      ParentTypeEnum.Document,
      ParentTypeEnum.InternalAuditReport,
      ParentTypeEnum.ComplianceMonitoringAssessment,
    ];
    if (
      nodes.filter((c) => !allowedParentTypes.includes(c.ObjectType)).length > 0
    ) {
      throw new Forbidden('Invalid parent type');
    }

    const documentNodes = nodes.filter(
      (c) => c.ObjectType === ParentTypeEnum.Document
    );
    if (documentNodes.length != input.DocumentIds.length) {
      throw new BadRequest('Incorrect number of documents found.');
    }

    const permissionGranted = await hasPermission(hasuraClient, {
      userId: sessionData.userId,
      parentObject: documentNodes,
      objectType: ParentTypeEnum.DocumentAssessmentResult,
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

    const Ids = [];
    const results: DocumentAssessmentResultInsertInput[] = [];
    const hasAssessmentBasedParent = input.AssessmentId;
    for (const documentId of input.DocumentIds) {
      const Id = crypto.randomUUID();
      Ids.push(Id);
      const result: DocumentAssessmentResultInsertInput = {
        Id: Id,
        Rating: input.Rating,
        Rationale: input.Rationale,
        TestDate: input.TestDate,
        CustomAttributeData: input.CustomAttributeData,
        RatingType: hasAssessmentBasedParent ? parentType : 'rating',
        parents: {
          data: [
            {
              ParentId: documentId,
              ParentType: ParentTypeEnum.Document,
              ResultType: ParentTypeEnum.DocumentAssessmentResult,
            },
          ],
        },
      };
      if (hasAssessmentBasedParent) {
        result.parents?.data.push({
          ParentId: input.AssessmentId,
          ParentType: parentType,
          ResultType: ParentTypeEnum.DocumentAssessmentResult,
        });
      }
      results.push(result);
    }
    const result = await insertDocumentAssessmentResult(hasuraClient, {
      results,
    });

    if (result == undefined || result === 0) {
      return {
        statusCode: 400,
        body: JSON.stringify({
          error: `failed to create document rating`,
        }),
      };
    }

    const { ctx, refreshDocumentScheduleState } =
      createScheduleRefresh(sessionData);
    for (const documentId of input.DocumentIds) {
      await refreshDocumentScheduleState(ctx, documentId);
    }

    return {
      statusCode: 200,
      body: JSON.stringify({
        Ids,
      }),
    };
  }
);
