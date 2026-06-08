import type { ApolloClient } from '@apollo/client';
import type { ScheduleDataAccess } from '@risksmart-app/schedule-state';
import { getRisksmartApiClient } from 'src/repositories/getRisksmartApiClient';

import { getOldestActiveImpactTestDate } from '../services/impactRatingService';

/**
 * Creates a ScheduleDataAccess adapter backed by the GraphQL SDK (Hasura).
 * Used by rest-api handlers during the transition period.
 * When rest-api is retired, this adapter is deleted — no changes needed in
 * the schedule-state package.
 */
export function createGraphQLScheduleDataAccess(
  hasuraClient: ApolloClient<unknown>,
  orgKey: string
): ScheduleDataAccess {
  const apiClient = getRisksmartApiClient(hasuraClient);

  return {
    async getSchedule(_ctx, id) {
      const { schedule_by_pk: schedule } = await apiClient.getSchedule({
        Id: id,
      });
      if (!schedule) {
        return null;
      }

      return {
        Id: schedule.Id,
        Frequency: schedule.Frequency ?? null,
        ManualDueDate: schedule.ManualDueDate ?? null,
        StartDate: schedule.StartDate ?? null,
        TimeToCompleteValue: schedule.TimeToCompleteValue ?? null,
        TimeToCompleteUnit: schedule.TimeToCompleteUnit ?? null,
      };
    },

    async getScheduleState(_ctx, id) {
      const { schedule_state_by_pk: state } = await apiClient.getScheduleState({
        Id: id,
      });
      if (!state) {
        return null;
      }

      return {
        Id: state.Id,
        LatestDate: state.LatestDate ?? null,
        DueDate: state.DueDate ?? null,
        OverdueDate: state.OverdueDate ?? null,
      };
    },

    async upsertScheduleState(_ctx, id, data) {
      await apiClient.upsertScheduleState({
        Id: id,
        DueDate: data.DueDate,
        OverdueDate: data.OverdueDate,
        LatestDate: data.LatestDate,
        ModifiedByUser: 'SYSTEM',
        OrgKey: orgKey,
        ModifiedAtTimestamp: new Date(Date.now()).toISOString(),
      });

      return { Id: id };
    },

    async getLatestRiskAssessmentResult(_ctx, riskId) {
      const { risk_assessment_result: results } =
        await apiClient.getLatestRiskAssessmentResultByParentId({ Id: riskId });
      const result = results[0];
      if (!result?.TestDate) {
        return null;
      }

      return {
        Id: result.Id,
        Impact: result.Impact ?? null,
        Likelihood: result.Likelihood ?? null,
        Rating: result.Rating ?? null,
        ControlType: String(result.ControlType),
        TestDate: result.TestDate,
      };
    },

    async getAggregationSettings(_ctx) {
      const { aggregation_org } = await apiClient.getAggregationSettingsForOrg({
        OrgKey: orgKey,
      });
      const settings = aggregation_org?.[0];
      if (!settings) {
        return null;
      }

      return {
        RiskScoringModel: settings.RiskScoringModel ?? null,
        Appetite: settings.Appetite ?? null,
        OrgKey: settings.OrgKey,
        Config: settings.Config,
      };
    },

    async getLatestTestResult(_ctx, controlId) {
      const { test_result: results } =
        await apiClient.getLatestTestResultByParentControlId({ Id: controlId });
      const result = results[0];
      if (!result?.TestDate) {
        return null;
      }

      return { Id: result.Id, TestDate: result.TestDate };
    },

    async getLatestDocumentAssessmentResult(_ctx, documentId) {
      const { document_assessment_result: results } =
        await apiClient.getLatestRatingDocumentAssessmentResultByParentId({
          Id: documentId,
        });
      const result = results[0];
      if (!result?.TestDate) {
        return null;
      }

      return { Id: result.Id, TestDate: result.TestDate };
    },

    async getLatestObligationAssessmentResult(_ctx, obligationId) {
      const { obligation_assessment_result: results } =
        await apiClient.getLatestRatingObligationAssessmentResultsByParentId({
          Id: obligationId,
        });
      const result = results[0];
      if (!result?.TestDate) {
        return null;
      }

      return { Id: result.Id, TestDate: result.TestDate };
    },

    async getLatestIndicatorResult(_ctx, indicatorId) {
      const { indicator_result: results } =
        await apiClient.getLatestIndicatorResult({ IndicatorId: indicatorId });
      const result = results[0];
      if (!result) {
        return null;
      }

      return { Id: result.Id, ResultDate: result.ResultDate };
    },

    async getOldestActiveImpactTestDate(_ctx, riskId) {
      const { impact: impacts } =
        await apiClient.getImpactsWithLatestDatedRiskRating({
          RatedItemId: riskId,
          OrgKey: orgKey,
        });
      const oldestTestDate = getOldestActiveImpactTestDate(impacts);

      return { oldestTestDate };
    },
  };
}
