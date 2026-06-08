import type {
  AggregationSettings,
  ApiRequestContext,
  LatestDocumentAssessmentResult,
  LatestIndicatorResult,
  LatestObligationAssessmentResult,
  LatestRiskAssessmentResult,
  LatestTestResult,
  OldestActiveImpactTestDate,
  Schedule,
  ScheduleState,
} from '../types';

export interface ScheduleDataAccess {
  getSchedule(ctx: ApiRequestContext, id: string): Promise<Schedule | null>;

  getScheduleState(
    ctx: ApiRequestContext,
    id: string
  ): Promise<ScheduleState | null>;

  upsertScheduleState(
    ctx: ApiRequestContext,
    id: string,
    data: {
      LatestDate: string | null;
      DueDate: string | null;
      OverdueDate: string | null;
    }
  ): Promise<{ Id: string }>;

  getLatestRiskAssessmentResult(
    ctx: ApiRequestContext,
    riskId: string
  ): Promise<LatestRiskAssessmentResult | null>;

  getAggregationSettings(
    ctx: ApiRequestContext
  ): Promise<AggregationSettings | null>;

  getLatestTestResult(
    ctx: ApiRequestContext,
    controlId: string
  ): Promise<LatestTestResult | null>;

  getLatestDocumentAssessmentResult(
    ctx: ApiRequestContext,
    documentId: string
  ): Promise<LatestDocumentAssessmentResult | null>;

  getLatestObligationAssessmentResult(
    ctx: ApiRequestContext,
    obligationId: string
  ): Promise<LatestObligationAssessmentResult | null>;

  getLatestIndicatorResult(
    ctx: ApiRequestContext,
    indicatorId: string
  ): Promise<LatestIndicatorResult | null>;

  getOldestActiveImpactTestDate(
    ctx: ApiRequestContext,
    riskId: string
  ): Promise<OldestActiveImpactTestDate>;
}

/**
 * The base methods used by the generic schedule refresh logic.
 * Entity-specific factories use this combined with Pick<> for their
 * specific data access methods.
 */
export type BaseScheduleAccess = Pick<
  ScheduleDataAccess,
  'getSchedule' | 'getScheduleState' | 'upsertScheduleState'
>;
