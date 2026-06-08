import type { CreateRiskAssessmentResultRequest } from '@risksmart-app/events/src/types/request-types';
import { createRefreshRiskScheduleState } from '@risksmart-app/schedule-state/src/refresh-risk-schedule-state';

import { createDataLayerScheduleDataAccess } from '../../adapters/schedule-data-access-adapter';
import { executeAsyncRequest } from '../../clients/async-request';
import { toApiContext } from '../../clients/client-utils';
import { dataLayerApiClient } from '../../clients/data-layer-api-client';
import { logger } from '../../utils/logger';
import type { ServiceContext } from '../service.types';

export class RiskAssessmentResultServiceImpl {
  async insertRiskAssessmentResult(
    ctx: ServiceContext,
    input: CreateRiskAssessmentResultRequest,
    options: { useImpacts: boolean }
  ) {
    const result = await executeAsyncRequest(ctx, input, {
      requestType: 'CREATE_RISK_ASSESSMENT_RESULT',
      buildRequestBody: (input) => ({
        RiskIds: input.RiskIds,
        ControlType: input.ControlType,
        Rating: input.Rating ?? null,
        Likelihood: input.Likelihood ?? null,
        Impact: input.Impact ?? null,
        AssessmentId: input.AssessmentId ?? null,
        CustomAttributeData: input.CustomAttributeData ?? null,
        TestDate: input.TestDate ?? null,
        Rationale: input.Rationale ?? null,
      }),
      apiCall: (ctx, input, correlationId) =>
        dataLayerApiClient.createRiskAssessmentResult(
          toApiContext(ctx),
          input,
          correlationId
        ),
      errorMessages: {
        403: 'You do not have permission to create risk assessment results',
        404: 'Risk(s) not found',
      },
    });

    // Refresh schedule state for each affected risk
    const refreshRiskScheduleState = createRefreshRiskScheduleState(
      createDataLayerScheduleDataAccess()
    );
    for (const riskId of input.RiskIds) {
      try {
        await refreshRiskScheduleState(toApiContext(ctx), riskId, {
          useImpacts: options.useImpacts,
        });
      } catch (error) {
        logger.warn(
          { riskId, error },
          'Failed to refresh schedule state after risk assessment result insert'
        );
      }
    }

    return result;
  }
}

export const createRiskAssessmentResultService = () =>
  new RiskAssessmentResultServiceImpl();
