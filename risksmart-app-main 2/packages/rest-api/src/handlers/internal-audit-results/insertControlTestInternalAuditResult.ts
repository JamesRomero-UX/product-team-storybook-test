import type { ControlTestInternalAuditResultInsertInput } from 'generated/graphql';
import { AccessTypeEnum, ParentTypeEnum } from 'generated/graphql';
import { BadRequest, Forbidden } from 'http-errors';
import _ from 'lodash';
import { backendRouteHandler } from 'src/backendActionApiHandler';
import { getHasuraBackendClientForAction } from 'src/backendGraphqlClient';
import { insertInternalAuditTestResultWithParents } from 'src/services/internal-audit-test-result/internalAuditTestResultService';
import { hasPermission } from 'src/services/role-access/roleAccessService';
import { getSessionData } from 'src/session';

import { getInternalAuditReport } from '../../services/internal-audit-report/internalAuditReportService';
import { NodeService } from '../../services/node/node.service';
import { ControlTestInternalAuditResultSchema } from './schema';

export const handler = backendRouteHandler(
  ControlTestInternalAuditResultSchema,
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
    const nodeIds = [...input.ControlIds, input.InternalAuditReportId];
    const nodes = await nodeService.findManyByIds(nodeIds);
    if (nodes.length !== nodeIds.length) {
      throw new BadRequest('Object ID(s) not found');
    }

    const allowedParentTypes: ParentTypeEnum[] = [
      ParentTypeEnum.Control,
      ParentTypeEnum.InternalAuditReport,
    ];
    if (
      nodes.filter((c) => !allowedParentTypes.includes(c.ObjectType)).length > 0
    ) {
      throw new Forbidden('Invalid parent type');
    }

    const controlNodes = nodes.filter(
      (c) => c.ObjectType === ParentTypeEnum.Control
    );
    if (controlNodes.length != input.ControlIds.length) {
      throw new BadRequest('Incorrect number of controls found.');
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
      objectType: ParentTypeEnum.TestResult,
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

    const results: ControlTestInternalAuditResultInsertInput[] = [];
    for (const controlId of input.ControlIds) {
      const result: ControlTestInternalAuditResultInsertInput = {
        ParentControlId: controlId,
        Title: input.Title,
        TestType: input.TestType,
        Description: input.Description,
        DesignEffectiveness: input.DesignEffectiveness,
        PerformanceEffectiveness: input.PerformanceEffectiveness,
        OverallEffectiveness: input.OverallEffectiveness,
        Submitter: input.Submitter,
        TestDate: input.TestDate,
        CustomAttributeData: input.CustomAttributeData,
        parents: {
          data: [
            {
              ParentId: controlId,
              ParentType: ParentTypeEnum.Control,
              ResultType: ParentTypeEnum.TestResult,
            },
            {
              ParentId: input.InternalAuditReportId,
              ParentType: ParentTypeEnum.InternalAuditReport,
              ResultType: ParentTypeEnum.TestResult,
            },
          ],
        },
      };

      results.push(result);
    }
    const Ids = await insertInternalAuditTestResultWithParents(hasuraClient, {
      results: results,
    });

    if (Ids == undefined) {
      return {
        statusCode: 400,
        body: JSON.stringify({
          error: `failed to create test results`,
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
