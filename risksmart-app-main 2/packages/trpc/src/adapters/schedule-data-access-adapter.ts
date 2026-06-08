import type { ScheduleDataAccess } from '@risksmart-app/schedule-state/src/ports/schedule-data-access';

import {
  dataLayerApiClient,
  DataLayerApiError,
} from '../clients/data-layer-api-client';

/**
 * Returns `null` if the error is a 404, otherwise re-throws.
 */
const nullOn404 = (error: unknown): null => {
  if (error instanceof DataLayerApiError && error.status === 404) {
    return null;
  }
  throw error;
};

/**
 * Creates a ScheduleDataAccess adapter backed by the tRPC data-layer API client.
 * Uses the same V4-signed HTTP client as all other tRPC data-layer calls.
 */
export const createDataLayerScheduleDataAccess = (): ScheduleDataAccess => ({
  getSchedule: async (ctx, id) =>
    dataLayerApiClient
      .getSchedule(ctx, id)
      .then((r) => r.data)
      .catch(nullOn404),

  getScheduleState: async (ctx, id) =>
    dataLayerApiClient
      .getScheduleState(ctx, id)
      .then((r) => r.data)
      .catch(nullOn404),

  upsertScheduleState: async (ctx, id, data) => {
    const { data: result } = await dataLayerApiClient.upsertScheduleState(
      ctx,
      id,
      data
    );

    return result;
  },

  getLatestRiskAssessmentResult: async (ctx, riskId) =>
    dataLayerApiClient
      .getLatestRiskAssessmentResultByRisk(ctx, riskId)
      .then((r) => r.data)
      .catch(nullOn404),

  getAggregationSettings: async (ctx) =>
    dataLayerApiClient
      .getAggregationSettings(ctx)
      .then((r) => r.data)
      .catch(nullOn404),

  getLatestTestResult: async (ctx, controlId) =>
    dataLayerApiClient
      .getLatestTestResultByControl(ctx, controlId)
      .then((r) => r.data)
      .catch(nullOn404),

  getLatestDocumentAssessmentResult: async (ctx, documentId) =>
    dataLayerApiClient
      .getLatestDocumentAssessmentResultByDocument(ctx, documentId)
      .then((r) => r.data)
      .catch(nullOn404),

  getLatestObligationAssessmentResult: async (ctx, obligationId) =>
    dataLayerApiClient
      .getLatestObligationAssessmentResultByObligation(ctx, obligationId)
      .then((r) => r.data)
      .catch(nullOn404),

  getLatestIndicatorResult: async (ctx, indicatorId) =>
    dataLayerApiClient
      .getLatestIndicatorResultByIndicator(ctx, indicatorId)
      .then((r) => r.data)
      .catch(nullOn404),

  getOldestActiveImpactTestDate: async (ctx, riskId) => {
    const { data } =
      await dataLayerApiClient.getOldestActiveImpactTestDateByRisk(ctx, riskId);

    return data;
  },
});
