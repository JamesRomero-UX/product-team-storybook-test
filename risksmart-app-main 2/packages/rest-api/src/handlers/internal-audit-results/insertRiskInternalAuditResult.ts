import crypto from 'crypto';
import type {
  RiskControlledInternalAuditResultInsertInput,
  RiskUncontrolledInternalAuditResultInsertInput,
} from 'generated/graphql';
import { AccessTypeEnum, ParentTypeEnum } from 'generated/graphql';
import { BadRequest, Forbidden } from 'http-errors';
import { backendRouteHandler } from 'src/backendActionApiHandler';
import { getHasuraBackendClientForAction } from 'src/backendGraphqlClient';
import {
  insertRiskControlledInternalAuditResults,
  insertRiskUncontrolledInternalAuditResults,
} from 'src/services/internal-audit-result/internalAuditResultService';
import { hasPermission } from 'src/services/role-access/roleAccessService';
import { getSessionData } from 'src/session';

import { getInternalAuditReport } from '../../services/internal-audit-report/internalAuditReportService';
import { NodeService } from '../../services/node/node.service';
import { InsertRiskInternalAuditResultSchema } from './schema';

export const handler = backendRouteHandler(
  InsertRiskInternalAuditResultSchema,
  async (body) => {
    const sessionData = getSessionData(body.session_variables);
    const hasuraClient = await getHasuraBackendClientForAction(body);
    const input = body.input;
    const nodeService = NodeService(sessionData);
    const nodeIds = [...input.RiskIds, input.InternalAuditReportId];
    const nodes = await nodeService.findManyByIds(nodeIds);
    if (nodes.length !== nodeIds.length) {
      throw new BadRequest('Object ID(s) not found');
    }

    const allowedParentTypes: ParentTypeEnum[] = [
      ParentTypeEnum.InternalAuditReport,
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
      (c) => c.ObjectType === ParentTypeEnum.InternalAuditReport
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

    const data = await getInternalAuditReport(hasuraClient, {
      Id: input.InternalAuditReportId,
    });

    if (!data || data.internal_audit_report.length === 0) {
      throw new Forbidden('Internal Audit Report not found');
    }
    const Ids = [];
    if (input.ControlType === 'Controlled') {
      const results: RiskControlledInternalAuditResultInsertInput[] = [];
      for (const riskId of input.RiskIds) {
        const Id = crypto.randomUUID();
        Ids.push(Id);
        const result: RiskControlledInternalAuditResultInsertInput = {
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
                ParentId: input.InternalAuditReportId,
                ParentType: ParentTypeEnum.InternalAuditReport,
                ResultType: ParentTypeEnum.RiskAssessmentResult,
              },
            ],
          },
        };
        results.push(result);
      }
      const result = await insertRiskControlledInternalAuditResults(
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
    } else {
      const results: RiskUncontrolledInternalAuditResultInsertInput[] = [];
      for (const riskId of input.RiskIds) {
        const Id = crypto.randomUUID();
        Ids.push(Id);
        const result: RiskUncontrolledInternalAuditResultInsertInput = {
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
                ParentId: input.InternalAuditReportId,
                ParentType: ParentTypeEnum.InternalAuditReport,
                ResultType: ParentTypeEnum.RiskAssessmentResult,
              },
            ],
          },
        };
        results.push(result);
      }
      const result = await insertRiskUncontrolledInternalAuditResults(
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
