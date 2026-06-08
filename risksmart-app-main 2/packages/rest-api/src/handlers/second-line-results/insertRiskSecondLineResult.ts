import crypto from 'crypto';
import type {
  RiskControlledSecondLineResultInsertInput,
  RiskUncontrolledSecondLineResultInsertInput,
} from 'generated/graphql';
import { AccessTypeEnum, ParentTypeEnum } from 'generated/graphql';
import { BadRequest, Forbidden } from 'http-errors';
import { backendRouteHandler } from 'src/backendActionApiHandler';
import { getHasuraBackendClientForAction } from 'src/backendGraphqlClient';
import { hasPermission } from 'src/services/role-access/roleAccessService';
import {
  insertRiskControlledSecondLineResults,
  insertRiskUncontrolledSecondLineResults,
} from 'src/services/second-line-result/secondLineResultService';
import { getSessionData } from 'src/session';

import { getComplianceMonitoringAssessment } from '../../services/compliance-monitoring-assessment/complianceMonitoringAssessmentService';
import { NodeService } from '../../services/node/node.service';
import { InsertRiskSecondLineResultSchema } from './schema';

export const handler = backendRouteHandler(
  InsertRiskSecondLineResultSchema,
  async (body) => {
    const sessionData = getSessionData(body.session_variables);
    const hasuraClient = await getHasuraBackendClientForAction(body);
    const input = body.input;
    const nodeService = NodeService(sessionData);
    const nodeIds = [...input.RiskIds, input.ComplianceMonitoringAssessmentId];
    const nodes = await nodeService.findManyByIds(nodeIds);
    if (nodes.length !== nodeIds.length) {
      throw new BadRequest('Object ID(s) not found');
    }

    const allowedParentTypes: ParentTypeEnum[] = [
      ParentTypeEnum.ComplianceMonitoringAssessment,
      ParentTypeEnum.Risk,
    ];
    if (
      nodes.filter((c) => !allowedParentTypes.includes(c.ObjectType)).length > 0
    ) {
      throw new Forbidden('Invalid parent type');
    }

    const riskNodes = nodes.filter((c) => c.ObjectType === ParentTypeEnum.Risk);
    if (riskNodes.length != input.RiskIds.length) {
      throw new BadRequest('Incorrect number of risks found.');
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
      objectType: ParentTypeEnum.RiskAssessmentResult,
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
    if (input.ControlType === 'Controlled') {
      const results: RiskControlledSecondLineResultInsertInput[] = [];
      for (const riskId of input.RiskIds) {
        const Id = crypto.randomUUID();
        Ids.push(Id);
        const result: RiskControlledSecondLineResultInsertInput = {
          Id: Id,
          Rating: input.Rating,
          Rationale: input.Rationale,
          TestDate: input.TestDate,
          Impact: input.Impact,
          Likelihood: input.Likelihood,
          CustomAttributeData: input.CustomAttributeData,
          parents: {
            data: [
              {
                ParentId: riskId,
                ParentType: ParentTypeEnum.Risk,
                ResultType: ParentTypeEnum.RiskAssessmentResult,
              },
              {
                ParentId: input.ComplianceMonitoringAssessmentId,
                ParentType: ParentTypeEnum.ComplianceMonitoringAssessment,
                ResultType: ParentTypeEnum.RiskAssessmentResult,
              },
            ],
          },
        };
        results.push(result);
      }
      const result = await insertRiskControlledSecondLineResults(hasuraClient, {
        results,
      });

      if (result == undefined || result === 0) {
        return {
          statusCode: 400,
          body: JSON.stringify({
            error: `failed to create risk rating`,
          }),
        };
      }
    } else {
      const results: RiskUncontrolledSecondLineResultInsertInput[] = [];
      for (const riskId of input.RiskIds) {
        const Id = crypto.randomUUID();
        Ids.push(Id);
        const result: RiskUncontrolledSecondLineResultInsertInput = {
          Id: Id,
          Rating: input.Rating,
          Rationale: input.Rationale,
          TestDate: input.TestDate,
          Impact: input.Impact,
          Likelihood: input.Likelihood,
          CustomAttributeData: input.CustomAttributeData,
          parents: {
            data: [
              {
                ParentId: riskId,
                ParentType: ParentTypeEnum.Risk,
                ResultType: ParentTypeEnum.RiskAssessmentResult,
              },
              {
                ParentId: input.ComplianceMonitoringAssessmentId,
                ParentType: ParentTypeEnum.ComplianceMonitoringAssessment,
                ResultType: ParentTypeEnum.RiskAssessmentResult,
              },
            ],
          },
        };
        results.push(result);
      }
      const result = await insertRiskUncontrolledSecondLineResults(
        hasuraClient,
        {
          results,
        }
      );

      if (result == undefined || result === 0) {
        return {
          statusCode: 400,
          body: JSON.stringify({
            error: `failed to create risk rating`,
          }),
        };
      }
    }

    return {
      statusCode: 200,
      body: JSON.stringify({
        Ids,
      }),
    };
  }
);
