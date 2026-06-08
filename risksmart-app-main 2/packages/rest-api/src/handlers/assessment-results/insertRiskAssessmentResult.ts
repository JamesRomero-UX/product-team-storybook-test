import crypto from 'crypto';
import type { RiskAssessmentResultInsertInput } from 'generated/graphql';
import { AccessTypeEnum, ParentTypeEnum } from 'generated/graphql';
import { BadRequest, Forbidden } from 'http-errors';
import { createScheduleRefresh } from 'src/adapters/create-schedule-refresh';
import { backendRouteHandler } from 'src/backendActionApiHandler';
import { getHasuraBackendClientForAction } from 'src/backendGraphqlClient';
import { getBackendRestApiClient } from 'src/repositories/getBackendRestApiClient';
import { insertRiskAssessmentResults } from 'src/services/assessment-result/assessmentResultService';
import { hasPermission } from 'src/services/role-access/roleAccessService';
import type { SessionData } from 'src/session';
import { getSessionData } from 'src/session';

import { getAssessment } from '../../services/assessment/assessmentService';
import { NodeService } from '../../services/node/node.service';
import { calculateImpact } from './impactCalculation';
import type {
  InsertRiskAssessmentResultInput,
  InsertRiskAssessmentResultWithAssessmentInput,
  InsertRiskAssessmentResultWithImpactsInput,
} from './schema';
import { InsertRiskAssessmentResultSchema } from './schema';

export const handler = backendRouteHandler(
  InsertRiskAssessmentResultSchema,
  async (body) => {
    const input = body.input;

    const sessionData = getSessionData(body.session_variables);
    const nodes = await findNodes(sessionData, input);

    if (nodes.filter((c) => c.ObjectType !== ParentTypeEnum.Risk).length > 0) {
      throw new Forbidden('Invalid parent type');
    }

    const riskNodes = nodes.filter((c) => c.ObjectType === ParentTypeEnum.Risk);
    if (riskNodes.length != input.RiskIds.length) {
      throw new BadRequest('Incorrect number of risks found');
    }

    const hasuraClient = getHasuraBackendClientForAction(body);

    const permissionGranted = await hasPermission(hasuraClient, {
      userId: sessionData.userId,
      parentObject: riskNodes,
      objectType: ParentTypeEnum.RiskAssessmentResult,
      accessType: AccessTypeEnum.Insert,
    });

    if (!permissionGranted) {
      throw new Forbidden('Access denied');
    }

    if (hasAssessment(input)) {
      const data = await getAssessment(hasuraClient, {
        Id: input.AssessmentId,
      });

      if (!data || data.assessment.length === 0) {
        throw new Forbidden('Assessment not found');
      }
    }

    const apiClient = getBackendRestApiClient(sessionData);
    const configResult = await apiClient.getLatestRiskAssessmentResultConfig();
    const configId = configResult.risk_assessment_result_config[0]?.Id ?? null;

    const results = await buildRiskAssessmentResults(
      sessionData,
      input,
      configId
    );

    const rows = await insertRiskAssessmentResults(hasuraClient, {
      results,
    });

    const { ctx, refreshRiskRatingScheduleState } =
      createScheduleRefresh(sessionData);
    for (const riskId of input.RiskIds) {
      await refreshRiskRatingScheduleState(ctx, riskId);
    }

    if (rows === undefined || rows === 0) {
      return {
        statusCode: 400,
        body: JSON.stringify({
          error: `Failed to create risk rating`,
        }),
      };
    }

    return {
      statusCode: 200,
      body: JSON.stringify({
        Ids: results.map((r) => r.Id),
      }),
    };
  }
);

const findNodes = async (
  sessionData: SessionData,
  input: InsertRiskAssessmentResultInput
) => {
  const nodeService = NodeService(sessionData);
  const nodeIds = [...input.RiskIds];
  const nodes = await nodeService.findManyByIds(nodeIds);

  if (nodes.length !== nodeIds.length) {
    throw new BadRequest('Object ID(s) not found');
  }

  return nodes;
};

const hasMultipleImpacts = (
  input: InsertRiskAssessmentResultInput
): input is InsertRiskAssessmentResultWithImpactsInput => {
  return (
    input.Impacts !== undefined &&
    input.Impacts !== null &&
    input.Impacts.length > 0
  );
};

const hasAssessment = (
  input: InsertRiskAssessmentResultInput
): input is InsertRiskAssessmentResultWithAssessmentInput => {
  return input.AssessmentId !== undefined && input.AssessmentId !== null;
};

const buildRiskAssessmentResults = async (
  sessionData: SessionData,
  input: InsertRiskAssessmentResultInput,
  configId: string | null
): Promise<RiskAssessmentResultInsertInput[]> => {
  const results: RiskAssessmentResultInsertInput[] = [];

  let impact = input.Impact;

  if (hasMultipleImpacts(input)) {
    impact = await calculateImpact(sessionData, input.Impacts);
  }

  for (const riskId of input.RiskIds) {
    const result: RiskAssessmentResultInsertInput = {
      Id: crypto.randomUUID(),
      Rating: input.Rating,
      Rationale: input.Rationale,
      TestDate: input.TestDate,
      Impact: impact,
      Likelihood: input.Likelihood,
      ControlType: input.ControlType,
      CustomAttributeData: input.CustomAttributeData,
      RatingType: hasAssessment(input) ? ParentTypeEnum.Assessment : 'rating',
      ConfigId: configId,
      parents: {
        data: [
          {
            ParentId: riskId,
            ParentType: ParentTypeEnum.Risk,
            ResultType: ParentTypeEnum.RiskAssessmentResult,
          },
        ],
      },
    };

    if (hasMultipleImpacts(input)) {
      result.impacts = {
        data: input.Impacts.map((impact) => ({
          Label: impact.Label,
          Value: impact.Value,
        })),
      };
    }

    if (hasAssessment(input)) {
      result.parents?.data.push({
        ParentId: input.AssessmentId,
        ParentType: ParentTypeEnum.Assessment,
        ResultType: ParentTypeEnum.RiskAssessmentResult,
      });
    }

    results.push(result);
  }

  return results;
};
