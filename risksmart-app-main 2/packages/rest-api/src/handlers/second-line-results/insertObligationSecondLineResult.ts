import crypto from 'crypto';
import type { ObligationSecondLineResultInsertInput } from 'generated/graphql';
import { AccessTypeEnum, ParentTypeEnum } from 'generated/graphql';
import { BadRequest, Forbidden } from 'http-errors';
import { backendRouteHandler } from 'src/backendActionApiHandler';
import { getHasuraBackendClientForAction } from 'src/backendGraphqlClient';
import { NodeService } from 'src/services/node/node.service';
import { hasPermission } from 'src/services/role-access/roleAccessService';
import { insertObligationSecondLineResult } from 'src/services/second-line-result/secondLineResultService';
import { getSessionData } from 'src/session';

import { getComplianceMonitoringAssessment } from '../../services/compliance-monitoring-assessment/complianceMonitoringAssessmentService';
import { ObligationSecondLineResultSchema } from './schema';

export const handler = backendRouteHandler(
  ObligationSecondLineResultSchema,
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
    const nodeIds = [
      ...input.ObligationIds,
      input.ComplianceMonitoringAssessmentId,
    ];
    const nodes = await nodeService.findManyByIds(nodeIds);
    if (nodes.length !== nodeIds.length) {
      throw new BadRequest('Object ID(s) not found');
    }

    const allowedParentTypes: ParentTypeEnum[] = [
      ParentTypeEnum.Obligation,
      ParentTypeEnum.ComplianceMonitoringAssessment,
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

    const parentNodes = nodes.filter(
      (c) => c.ObjectType === ParentTypeEnum.ComplianceMonitoringAssessment
    );
    if (parentNodes.length != 1) {
      throw new BadRequest('Incorrect number of parents found');
    }

    const permissionGranted = await hasPermission(hasuraClient, {
      userId: sessionData.userId,
      parentObject: parentNodes,
      objectType: ParentTypeEnum.ObligationAssessmentResult,
      accessType: AccessTypeEnum.Insert,
    });
    if (!permissionGranted) {
      throw new Forbidden('Access denied');
    }

    const data = await getComplianceMonitoringAssessment(hasuraClient, {
      Id: input.ComplianceMonitoringAssessmentId,
    });

    if (!data || data.compliance_monitoring_assessment.length === 0) {
      throw new Forbidden('Compliance Monitoring Assessment not found');
    }
    const Ids = [];
    const results: ObligationSecondLineResultInsertInput[] = [];
    for (const obligationId of input.ObligationIds) {
      const Id = crypto.randomUUID();
      Ids.push(Id);
      const result: ObligationSecondLineResultInsertInput = {
        Id: Id,
        Rating: input.Rating,
        Rationale: input.Rationale,
        TestDate: input.TestDate,
        CustomAttributeData: input.CustomAttributeData,
        parents: {
          data: [
            {
              ParentId: obligationId,
              ParentType: ParentTypeEnum.Obligation,
              ResultType: ParentTypeEnum.ObligationAssessmentResult,
            },
            {
              ParentId: input.ComplianceMonitoringAssessmentId,
              ParentType: ParentTypeEnum.ComplianceMonitoringAssessment,
              ResultType: ParentTypeEnum.ObligationAssessmentResult,
            },
          ],
        },
      };
      results.push(result);
    }
    const result = await insertObligationSecondLineResult(hasuraClient, {
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

    return {
      statusCode: 200,
      body: JSON.stringify({
        Ids,
      }),
    };
  }
);
