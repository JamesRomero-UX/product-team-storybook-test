import type { VariablesOf } from '@graphql-typed-document-node/core';
import { hasLengthAtLeast } from '@risksmart-app/shared/typeGuards';
import type {
  AssessmentResultParentInsertInput,
  RiskAssessmentResultImpactInsertInput,
  UpdateRiskAssessmentResultDocument,
} from 'generated/graphql';
import { ParentTypeEnum } from 'generated/graphql';
import { BadRequest } from 'http-errors';
import { NotFound } from 'http-errors';
import { backendRouteHandler } from 'src/backendActionApiHandler';
import { getHasuraBackendClientForAction } from 'src/backendGraphqlClient';
import { getLogger } from 'src/logger';
import {
  getRiskAssessmentResult,
  updateRiskAssessmentResult,
} from 'src/services/assessment-result/assessmentResultService';
import { getSessionData } from 'src/session';
import { NIL } from 'uuid';

import { calculateImpact } from './impactCalculation';
import type {
  UpdateRiskAssessmentResultInput,
  UpdateRiskAssessmentResultWithImpactsInput,
} from './schema';
import { UpdateRiskAssessmentResultSchema } from './schema';

const logger = getLogger();

export const handler = backendRouteHandler(
  UpdateRiskAssessmentResultSchema,
  async (body) => {
    logger.appendKeys({ riskAssessmentId: body.input.Id });
    const hasuraClient = await getHasuraBackendClientForAction(body);
    const riskAssessmentResults = await getRiskAssessmentResult(hasuraClient, {
      Id: body.input.Id,
    });
    if (!hasLengthAtLeast(riskAssessmentResults, 1)) {
      throw new NotFound();
    }
    const riskAssessmentResult = riskAssessmentResults[0];
    let ratingType = riskAssessmentResult.RatingType;
    const parents: AssessmentResultParentInsertInput[] = [];
    switch (riskAssessmentResult.RatingType) {
      case 'rating':
      case 'assessment':
        ratingType = body.input.AssessmentId ? 'assessment' : 'rating';
        if (body.input.AssessmentId) {
          parents.push({
            ParentType: ParentTypeEnum.Assessment,
            ResultType: ParentTypeEnum.RiskAssessmentResult,
            ParentId: body.input.AssessmentId,
            Id: body.input.Id,
          });
        }
        break;
      case 'internal_audit_report':
        if (body.input.AssessmentId) {
          throw new BadRequest(
            'Cannot associate an internal audit report result with an assessment'
          );
        }
        break;
      case 'compliance_monitoring_assessment':
        if (body.input.AssessmentId) {
          throw new BadRequest(
            'Cannot associate a compliance monitoring result with an assessment'
          );
        }
        break;
      default:
        throw new Error(
          `Unsupported RatingType ${riskAssessmentResult.RatingType}`
        );
    }

    let impact = body.input.Impact;
    let impacts: RiskAssessmentResultImpactInsertInput[] = [];

    if (hasMultipleImpacts(body.input)) {
      const sessionData = getSessionData(body.session_variables);
      impact = await calculateImpact(sessionData, body.input.Impacts);
      impacts = body.input.Impacts.map((i) => ({
        RiskAssessmentResultId: body.input.Id,
        Label: i.Label,
        Value: i.Value,
      }));
    }

    const results: VariablesOf<typeof UpdateRiskAssessmentResultDocument> = {
      Id: body.input.Id,
      CustomAttributeData: body.input.CustomAttributeData,
      Impact: impact,
      Impacts: impacts,
      TestDate: body.input.TestDate,
      Rationale: body.input.Rationale,
      Likelihood: body.input.Likelihood,
      Rating: body.input.Rating,
      AssessmentId: body.input.AssessmentId || NIL,
      RatingType: ratingType,
      Parents: parents,
    };

    const rows = await updateRiskAssessmentResult(hasuraClient, results);

    // TODO: refresh risk schedule data if we want to see the results updated in register straight away

    return {
      statusCode: 200,
      body: JSON.stringify({
        affected_rows: rows,
      }),
    };
  }
);

const hasMultipleImpacts = (
  input: UpdateRiskAssessmentResultInput
): input is UpdateRiskAssessmentResultWithImpactsInput => {
  return (
    input.Impacts !== undefined &&
    input.Impacts !== null &&
    input.Impacts.length > 0
  );
};
