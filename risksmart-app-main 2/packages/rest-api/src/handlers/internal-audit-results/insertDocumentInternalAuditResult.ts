import crypto from 'crypto';
import type { DocumentInternalAuditResultInsertInput } from 'generated/graphql';
import { AccessTypeEnum, ParentTypeEnum } from 'generated/graphql';
import { BadRequest, Forbidden } from 'http-errors';
import { createScheduleRefresh } from 'src/adapters/create-schedule-refresh';
import { backendRouteHandler } from 'src/backendActionApiHandler';
import { getHasuraBackendClientForAction } from 'src/backendGraphqlClient';
import { insertDocumentInternalAuditResult } from 'src/services/internal-audit-result/internalAuditResultService';
import { hasPermission } from 'src/services/role-access/roleAccessService';
import { getSessionData } from 'src/session';

import { getInternalAuditReport } from '../../services/internal-audit-report/internalAuditReportService';
import { NodeService } from '../../services/node/node.service';
import { DocumentInternalAuditResultSchema } from './schema';

export const handler = backendRouteHandler(
  DocumentInternalAuditResultSchema,
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
    const nodeIds = [...input.DocumentIds, input.InternalAuditReportId];
    const nodes = await nodeService.findManyByIds(nodeIds);
    if (nodes.length !== nodeIds.length) {
      throw new BadRequest('Object ID(s) not found');
    }

    const allowedParentTypes: ParentTypeEnum[] = [
      ParentTypeEnum.Document,
      ParentTypeEnum.InternalAuditReport,
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

    const parentNodes = nodes.filter(
      (c) => c.ObjectType === ParentTypeEnum.InternalAuditReport
    );
    if (parentNodes.length != 1) {
      throw new BadRequest('Incorrect number of parents found');
    }

    const permissionGranted = await hasPermission(hasuraClient, {
      userId: sessionData.userId,
      parentObject: parentNodes,
      objectType: ParentTypeEnum.DocumentAssessmentResult,
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
    const results: DocumentInternalAuditResultInsertInput[] = [];
    for (const documentId of input.DocumentIds) {
      const Id = crypto.randomUUID();
      Ids.push(Id);
      const result: DocumentInternalAuditResultInsertInput = {
        Id: Id,
        Rating: input.Rating,
        Rationale: input.Rationale,
        TestDate: input.TestDate,
        CustomAttributeData: input.CustomAttributeData,
        parents: {
          data: [
            {
              ParentId: documentId,
              ParentType: ParentTypeEnum.Document,
              ResultType: ParentTypeEnum.DocumentAssessmentResult,
            },
            {
              ParentId: input.InternalAuditReportId,
              ParentType: ParentTypeEnum.InternalAuditReport,
              ResultType: ParentTypeEnum.DocumentAssessmentResult,
            },
          ],
        },
      };
      results.push(result);
    }
    const result = await insertDocumentInternalAuditResult(hasuraClient, {
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
