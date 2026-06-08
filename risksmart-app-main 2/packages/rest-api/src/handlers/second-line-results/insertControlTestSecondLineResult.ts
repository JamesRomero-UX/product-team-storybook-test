import type { ControlTestSecondLineResultInsertInput } from 'generated/graphql';
import { AccessTypeEnum, ParentTypeEnum } from 'generated/graphql';
import { BadRequest, Forbidden } from 'http-errors';
import _ from 'lodash';
import { backendRouteHandler } from 'src/backendActionApiHandler';
import { getHasuraBackendClientForAction } from 'src/backendGraphqlClient';
import { hasPermission } from 'src/services/role-access/roleAccessService';
import { insertSecondLineTestResultWithParents } from 'src/services/second-line-test-result/secondLineTestResultService';
import { getSessionData } from 'src/session';

import { getComplianceMonitoringAssessment } from '../../services/compliance-monitoring-assessment/complianceMonitoringAssessmentService';
import { NodeService } from '../../services/node/node.service';
import { ControlTestSecondLineResultSchema } from './schema';

export const handler = backendRouteHandler(
  ControlTestSecondLineResultSchema,
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
      ...input.ControlIds,
      input.ComplianceMonitoringAssessmentId,
    ];
    const nodes = await nodeService.findManyByIds(nodeIds);
    if (nodes.length !== nodeIds.length) {
      throw new BadRequest('Object ID(s) not found');
    }

    const allowedParentTypes: ParentTypeEnum[] = [
      ParentTypeEnum.Control,
      ParentTypeEnum.ComplianceMonitoringAssessment,
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
      (c) => c.ObjectType === ParentTypeEnum.ComplianceMonitoringAssessment
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

    const data = await getComplianceMonitoringAssessment(hasuraClient, {
      Id: input.ComplianceMonitoringAssessmentId,
    });

    if (!data || data.compliance_monitoring_assessment.length === 0) {
      throw new Forbidden('Compliance Monitoring Assessment not found');
    }

    const results: ControlTestSecondLineResultInsertInput[] = [];
    for (const controlId of input.ControlIds) {
      const result: ControlTestSecondLineResultInsertInput = {
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
              ParentId: input.ComplianceMonitoringAssessmentId,
              ParentType: ParentTypeEnum.ComplianceMonitoringAssessment,
              ResultType: ParentTypeEnum.TestResult,
            },
          ],
        },
      };

      results.push(result);
    }
    const Ids = await insertSecondLineTestResultWithParents(hasuraClient, {
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
