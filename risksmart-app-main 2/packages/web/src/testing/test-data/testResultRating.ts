import type {
  GetLatestComplianceMonitoringAssessmentTestResultsByControlIdQuery,
  GetLatestInternalAuditReportTestResultsByControlIdQuery,
  GetLatestTestResultsByControlIdQuery,
} from '@risksmart-app/web-graphql-client/generated/graphql';
import { randomUUID } from 'crypto';

const defaultTestResult: GetLatestTestResultsByControlIdQuery['test_result'][number] =
  {
    CreatedAtTimestamp: '2024-07-21T00:00:00+00:00',
    CreatedByUser: 'user',
    Description: 'Desc',
    ModifiedAtTimestamp: '2024-07-20T00:00:00+00:00',
    ModifiedByUser: '1',
    ParentControlId: 'Id',
    SequentialId: 0,
    Submitter: 'Test',
    TestType: '1st',
    files: [],
    submitter: {
      FriendlyName: 'Test User',
      __typename: 'user',
    },
    CustomAttributeData: null,
    Id: '4364abcd-5adc-4157-a2e9-253a8c343c75',
    OverallEffectiveness: 3,
    DesignEffectiveness: 2,
    PerformanceEffectiveness: 1,
    Title: 'Test 1',
    TestDate: '2024-08-21T00:00:00+00:00',
    assessmentParents: [],
    __typename: 'test_result',
  };

export const buildTestResultRating = (
  overrides: Partial<
    GetLatestTestResultsByControlIdQuery['test_result'][number]
  >
): GetLatestTestResultsByControlIdQuery['test_result'][number] => {
  return {
    ...defaultTestResult,
    Id: randomUUID(),
    ...overrides,
  };
};

const defaultSecondLineTestResult: GetLatestComplianceMonitoringAssessmentTestResultsByControlIdQuery['control_test_second_line_result'][number] =
  {
    CreatedAtTimestamp: '2024-07-21T00:00:00+00:00',
    CreatedByUser: 'user',
    Description: 'Desc',
    ModifiedAtTimestamp: '2024-07-20T00:00:00+00:00',
    ModifiedByUser: '1',
    ParentControlId: 'Id',
    SequentialId: 0,
    Submitter: 'Test',
    TestType: '1st',
    files: [],
    submitter: {
      FriendlyName: 'Test User',
      __typename: 'user',
    },
    CustomAttributeData: null,
    Id: '4364abcd-5adc-4157-a2e9-253a8c343c75',
    OverallEffectiveness: 3,
    DesignEffectiveness: 2,
    PerformanceEffectiveness: 1,
    Title: 'Test 1',
    TestDate: '2024-08-21T00:00:00+00:00',
    parents: [],
    __typename: 'control_test_second_line_result',
  };

export const buildSecondLineTestResultRating = (
  overrides: Partial<
    GetLatestComplianceMonitoringAssessmentTestResultsByControlIdQuery['control_test_second_line_result'][number]
  >
): GetLatestComplianceMonitoringAssessmentTestResultsByControlIdQuery['control_test_second_line_result'][number] => {
  return {
    ...defaultSecondLineTestResult,
    Id: randomUUID(),
    ...overrides,
  };
};

const defaultInternalAuditTestResult: GetLatestInternalAuditReportTestResultsByControlIdQuery['control_test_internal_audit_result'][number] =
  {
    CreatedAtTimestamp: '2024-07-21T00:00:00+00:00',
    CreatedByUser: 'user',
    Description: 'Desc',
    ModifiedAtTimestamp: '2024-07-20T00:00:00+00:00',
    ModifiedByUser: '1',
    ParentControlId: 'Id',
    SequentialId: 0,
    Submitter: 'Test',
    TestType: '1st',
    files: [],
    submitter: {
      FriendlyName: 'Test User',
      __typename: 'user',
    },
    CustomAttributeData: null,
    Id: '4364abcd-5adc-4157-a2e9-253a8c343c75',
    OverallEffectiveness: 3,
    DesignEffectiveness: 2,
    PerformanceEffectiveness: 1,
    Title: 'Test 1',
    TestDate: '2024-08-21T00:00:00+00:00',
    parents: [],
    __typename: 'control_test_internal_audit_result',
  };

export const buildInternalAuditTestResultRating = (
  overrides: Partial<
    GetLatestInternalAuditReportTestResultsByControlIdQuery['control_test_internal_audit_result'][number]
  >
): GetLatestInternalAuditReportTestResultsByControlIdQuery['control_test_internal_audit_result'][number] => {
  return {
    ...defaultInternalAuditTestResult,
    Id: randomUUID(),
    ...overrides,
  };
};
