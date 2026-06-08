import type {
  GetLatestComplianceMonitoringAssessmentRiskAssessmentResultsByRiskIdQuery,
  GetLatestInternalAuditReportRiskAssessmentResultsByRiskIdQuery,
  GetRiskScoresByRiskIdQuery,
} from '@risksmart-app/web-graphql-client/generated/graphql';
import { randomUUID } from 'crypto';

const defaultRiskAssessmentResult: GetRiskScoresByRiskIdQuery['inherent'][number] =
  {
    ControlType: 'Uncontrolled',
    CustomAttributeData: null,
    Id: '4364abcd-5adc-4157-a2e9-253a8c343c75',
    Impact: 3,
    Likelihood: 3,
    Rating: 3,
    Rationale: '',
    TestDate: '2024-08-21T00:00:00+00:00',
    ancestorContributors: [],
    parents: [],
    __typename: 'risk_assessment_result',
  };

export const buildRiskAssessmentResultRating = (
  overrides: Partial<GetRiskScoresByRiskIdQuery['inherent'][number]>
): GetRiskScoresByRiskIdQuery['inherent'][number] => {
  return {
    ...defaultRiskAssessmentResult,
    Id: randomUUID(),
    ...overrides,
  };
};

const defaultControlledInternalAuditRiskAssessmentResult: GetLatestInternalAuditReportRiskAssessmentResultsByRiskIdQuery['controlled'][number] =
  {
    CustomAttributeData: null,
    Id: '4364abcd-5adc-4157-a2e9-253a8c343c75',
    Impact: 3,
    Likelihood: 3,
    Rating: 3,
    Rationale: '',
    TestDate: '2024-08-21T00:00:00+00:00',
    parents: [],
    ancestorContributors: [],
  };

const defaultUncontrolledInternalAuditRiskAssessmentResult: GetLatestInternalAuditReportRiskAssessmentResultsByRiskIdQuery['uncontrolled'][number] =
  {
    CustomAttributeData: null,
    Id: '4364abcd-5adc-4157-a2e9-253a8c343c75',
    Impact: 3,
    Likelihood: 3,
    Rating: 3,
    Rationale: '',
    TestDate: '2024-08-21T00:00:00+00:00',
    parents: [],
    ancestorContributors: [],
  };

export const buildUncontrolledInternalAuditRiskAssessmentResultRating = (
  overrides: Partial<
    GetLatestInternalAuditReportRiskAssessmentResultsByRiskIdQuery['uncontrolled'][number]
  >
): GetLatestInternalAuditReportRiskAssessmentResultsByRiskIdQuery['uncontrolled'][number] => {
  return {
    ...defaultUncontrolledInternalAuditRiskAssessmentResult,
    Id: randomUUID(),
    ...overrides,
  };
};

export const buildControlledInternalAuditRiskAssessmentResultRating = (
  overrides: Partial<
    GetLatestInternalAuditReportRiskAssessmentResultsByRiskIdQuery['controlled'][number]
  >
): GetLatestInternalAuditReportRiskAssessmentResultsByRiskIdQuery['controlled'][number] => {
  return {
    ...defaultControlledInternalAuditRiskAssessmentResult,
    Id: randomUUID(),
    ...overrides,
  };
};

const defaultControlledSecondLineRiskAssessmentResult: GetLatestComplianceMonitoringAssessmentRiskAssessmentResultsByRiskIdQuery['controlled'][number] =
  {
    CustomAttributeData: null,
    Id: '4364abcd-5adc-4157-a2e9-253a8c343c75',
    Impact: 3,
    Likelihood: 3,
    Rating: 3,
    Rationale: '',
    TestDate: '2024-08-21T00:00:00+00:00',
    parents: [],
    ancestorContributors: [],
  };

const defaultUncontrolledSecondLineRiskAssessmentResult: GetLatestComplianceMonitoringAssessmentRiskAssessmentResultsByRiskIdQuery['uncontrolled'][number] =
  {
    CustomAttributeData: null,
    Id: '4364abcd-5adc-4157-a2e9-253a8c343c75',
    Impact: 3,
    Likelihood: 3,
    Rating: 3,
    Rationale: '',
    TestDate: '2024-08-21T00:00:00+00:00',
    parents: [],
    ancestorContributors: [],
  };
export const buildUncontrolledSecondLineRiskAssessmentResultRating = (
  overrides: Partial<
    GetLatestComplianceMonitoringAssessmentRiskAssessmentResultsByRiskIdQuery['uncontrolled'][number]
  >
): GetLatestComplianceMonitoringAssessmentRiskAssessmentResultsByRiskIdQuery['uncontrolled'][number] => {
  return {
    ...defaultUncontrolledSecondLineRiskAssessmentResult,
    Id: randomUUID(),
    ...overrides,
  };
};

export const buildControlledSecondLineRiskAssessmentResultRating = (
  overrides: Partial<
    GetLatestComplianceMonitoringAssessmentRiskAssessmentResultsByRiskIdQuery['controlled'][number]
  >
): GetLatestComplianceMonitoringAssessmentRiskAssessmentResultsByRiskIdQuery['controlled'][number] => {
  return {
    ...defaultControlledSecondLineRiskAssessmentResult,
    Id: randomUUID(),
    ...overrides,
  };
};
