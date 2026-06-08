import type { TestResultInsertInput } from 'generated/graphql';
import { AccessTypeEnum, ParentTypeEnum } from 'generated/graphql';
import { BadRequest, Forbidden } from 'http-errors';
import _ from 'lodash';
import { createScheduleRefresh } from 'src/adapters/create-schedule-refresh';
import { backendRouteHandler } from 'src/backendActionApiHandler';
import { getHasuraBackendClientForAction } from 'src/backendGraphqlClient';
import { hasPermission } from 'src/services/role-access/roleAccessService';
import { insertTestResultWithParents } from 'src/services/test-result/testResultService';
import { getSessionData } from 'src/session';

import { getAssessment } from '../../services/assessment/assessmentService';
import { NodeService } from '../../services/node/node.service';
import { ControlTestAssessmentResultSchema } from './schema';

export const handler = backendRouteHandler(
  ControlTestAssessmentResultSchema,
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
    const nodeIds = [...input.ControlIds];
    const nodes = await nodeService.findManyByIds(nodeIds);
    if (nodes.length !== nodeIds.length) {
      throw new BadRequest('Object ID(s) not found');
    }

    const allowedParentTypes: ParentTypeEnum[] = [
      ParentTypeEnum.Control,
      ParentTypeEnum.InternalAuditReport,
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

    const permissionGranted = await hasPermission(hasuraClient, {
      userId: sessionData.userId,
      parentObject: controlNodes,
      objectType: ParentTypeEnum.TestResult,
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

    const results: TestResultInsertInput[] = [];
    const hasAssessmentBasedParent = input.AssessmentId;
    for (const controlId of input.ControlIds) {
      const result: TestResultInsertInput = {
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
        RatingType: hasAssessmentBasedParent ? parentType : 'rating',
        assessmentParents: {
          data: [
            {
              ParentId: controlId,
              ParentType: ParentTypeEnum.Control,
              ResultType: ParentTypeEnum.TestResult,
            },
          ],
        },
      };

      if (hasAssessmentBasedParent) {
        result.assessmentParents?.data.push({
          ParentId: input.AssessmentId,
          ParentType: parentType,
          ResultType: ParentTypeEnum.TestResult,
        });
      }
      results.push(result);
    }

    const Ids = await insertTestResultWithParents(hasuraClient, {
      results: results,
    });

    const { ctx, refreshControlScheduleState } =
      createScheduleRefresh(sessionData);
    const controlIds = _.uniq(results.map((r) => r.ParentControlId));
    for (const controlId of controlIds) {
      if (!controlId) {
        continue;
      }
      await refreshControlScheduleState(ctx, controlId);
    }

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
