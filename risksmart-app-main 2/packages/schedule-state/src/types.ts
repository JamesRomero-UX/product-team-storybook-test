import type { TestFrequency } from '@risksmart-app/domain/src/types/consts/test-frequency';
import type { UnitOfTime } from '@risksmart-app/domain/src/types/consts/unit-of-time';

export interface ApiRequestContext {
  tenant: string;
  orgKey: string;
  userId: string;
}

export interface Schedule {
  Id: string;
  Frequency: TestFrequency | null;
  ManualDueDate: string | null;
  StartDate: string | null;
  TimeToCompleteValue: number | null;
  TimeToCompleteUnit: UnitOfTime | null;
}

export interface ScheduleState {
  Id: string;
  LatestDate: string | null;
  DueDate: string | null;
  OverdueDate: string | null;
}

export interface LatestRiskAssessmentResult {
  Id: string;
  Impact: number | null;
  Likelihood: number | null;
  Rating: number | null;
  ControlType: string;
  TestDate: string;
}

export interface AggregationSettings {
  RiskScoringModel: string | null;
  Appetite: string | null;
  OrgKey: string;
  Config: unknown;
}

export interface LatestTestResult {
  Id: string;
  TestDate: string;
}

export interface LatestDocumentAssessmentResult {
  Id: string;
  TestDate: string;
}

export interface LatestObligationAssessmentResult {
  Id: string;
  TestDate: string;
}

export interface LatestIndicatorResult {
  Id: string;
  ResultDate: string;
}

export interface OldestActiveImpactTestDate {
  oldestTestDate: string | null;
}
