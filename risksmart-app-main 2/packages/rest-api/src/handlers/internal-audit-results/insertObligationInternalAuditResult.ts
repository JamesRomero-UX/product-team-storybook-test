import crypto from 'crypto';
import type { ObligationInternalAuditResultInsertInput } from 'generated/graphql';
import { AccessTypeEnum, ParentTypeEnum } from 'generated/graphql';
import { BadRequest, Forbidden } from 'http-errors';
import { backendRouteHandler } from 'src/backendActionApiHandler';
import { getHasuraBackendClientForAction } from 'src/backendGraphqlClient';
import { insertObligationInternalAuditResult } from 'src/services/internal-audit-result/internalAuditResultService';
import { NodeService } from 'src/services/node/node.service';
import { hasPermission } from 'src/services/role-access/roleAccessService';
import { getSessionData } from 'src/session';

import { getInternalAuditReport } from '../../services/internal-audit-report/internalAuditReportService';
import { ObligationInternalAuditResultSchema } from './schema';

export const handler = backendRouteHandler(
  ObligationInternalAuditResultSchema,
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
    const nodeIds = [...input.ObligationIds, input.InternalAuditReportId];
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

    const parentNodes = nodes.filter(
      (c) => c.ObjectType === ParentTypeEnum.InternalAuditReport
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

    const data = await getInternalAuditReport(hasuraClient, {
      Id: input.InternalAuditReportId,
    });

    if (!data || data.internal_audit_report.length === 0) {
      throw new Forbidden('Internal Audit Report not found');
    }
    const Ids = [];
    const results: ObligationInternalAuditResultInsertInput[] = [];
    for (const obligationId of input.ObligationIds) {
      const Id = crypto.randomUUID();
      Ids.push(Id);
      const result: ObligationInternalAuditResultInsertInput = {
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
              ParentId: input.InternalAuditReportId,
              ParentType: ParentTypeEnum.InternalAuditReport,
              ResultType: ParentTypeEnum.ObligationAssessmentResult,
            },
          ],
        },
      };
      results.push(result);
    }
    const result = await insertObligationInternalAuditResult(hasuraClient, {
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
