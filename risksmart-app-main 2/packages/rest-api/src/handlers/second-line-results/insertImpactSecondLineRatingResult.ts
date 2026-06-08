import type { ImpactSecondLineRatingInsertInput } from 'generated/graphql';
import { AccessTypeEnum, ParentTypeEnum } from 'generated/graphql';
import { BadRequest, Forbidden } from 'http-errors';
import _ from 'lodash';
import { backendRouteHandler } from 'src/backendActionApiHandler';
import { getHasuraBackendClientForAction } from 'src/backendGraphqlClient';
import { insertImpactRatings } from 'src/services/impact-rating/impactRatingService';
import { hasPermission } from 'src/services/role-access/roleAccessService';
import { getSessionData } from 'src/session';

import { getComplianceMonitoringAssessment } from '../../services/compliance-monitoring-assessment/complianceMonitoringAssessmentService';
import { NodeService } from '../../services/node/node.service';
import { ImpactRatingSecondLineResultSchema } from './schema';

export const handler = backendRouteHandler(
  ImpactRatingSecondLineResultSchema,
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
      input.RatedItemId,
      ...input.Ratings.map((c) => c.ImpactId),
      input.ComplianceMonitoringAssessmentId,
    ];
    const nodes = await nodeService.findManyByIds(nodeIds);
    if (!nodes) {
      throw new Forbidden('Access to parent denied');
    }
    if (nodes.length !== nodeIds.length) {
      throw new BadRequest('Object ID(s) not found');
    }
    const allowedParentTypes: ParentTypeEnum[] = [
      ParentTypeEnum.ComplianceMonitoringAssessment,
      ParentTypeEnum.Impact,
      ParentTypeEnum.Risk,
    ];
    if (
      nodes.filter((c) => !allowedParentTypes.includes(c.ObjectType)).length > 0
    ) {
      throw new Forbidden('Invalid parent type');
    }
    const riskNodes = nodes.filter((c) => c.ObjectType === ParentTypeEnum.Risk);
    if (riskNodes.length != 1) {
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
      objectType: ParentTypeEnum.ImpactRating,
      accessType: AccessTypeEnum.Insert,
    });
    if (!permissionGranted) {
      throw new Forbidden('Access denied');
    }

    const data = await getComplianceMonitoringAssessment(hasuraClient, {
      Id: input.ComplianceMonitoringAssessmentId,
    });

    if (!data || data.compliance_monitoring_assessment.length === 0) {
      throw new BadRequest('Compliance Monitoring Assessment not found');
    }

    const records: ImpactSecondLineRatingInsertInput[] = input.Ratings.map(
      (c) => {
        return {
          Rating: c.Rating,
          TestDate: input.TestDate,
          ImpactId: c.ImpactId,
          RatedItemId: input.RatedItemId,
          CompletedBy: input.CompletedBy,
          CustomAttributeData: input.CustomAttributeData,
          Likelihood: input.Likelihood,
          assessmentParents: {
            data: [
              {
                ParentId: c.ImpactId,
                ParentType: ParentTypeEnum.Impact,
                ResultType: ParentTypeEnum.ImpactRating,
              },
              {
                ParentId: input.ComplianceMonitoringAssessmentId,
                ParentType: ParentTypeEnum.ComplianceMonitoringAssessment,
                ResultType: ParentTypeEnum.ImpactRating,
              },
            ],
          },
        };
      }
    );

    const Ids = await insertImpactRatings(hasuraClient, {
      inputs: records,
    });

    if (Ids == undefined || Ids.length === 0) {
      return {
        statusCode: 400,
        body: JSON.stringify({
          error: `failed to create impact rating`,
        }),
      };
    }

    return {
      statusCode: 200,
      body: JSON.stringify({
        Ids: Ids.map((c) => c.Id),
      }),
    };
  }
);
