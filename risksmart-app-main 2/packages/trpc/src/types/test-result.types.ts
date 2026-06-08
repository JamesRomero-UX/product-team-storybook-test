import type { InferQueryModel } from '@risksmart-app/drizzle/src/db';
import type {
  getComplianceMonitoringAssessmentTestResultsByControlIdQueryConfig,
  getInternalAuditReportTestResultsByControlIdQueryConfig,
  getTestResultByIdQueryConfig,
  getTestResultsByControlIdQueryConfig,
  getTestResultsQueryConfig,
} from '@risksmart-app/drizzle/src/queries/test-result.query';

import type { GetFormConfigurationResponseRow } from './form-configuration.types';

export interface CreateControlTestResultResponse {
  Ids: string[];
}

export interface UpdateTestResultResponse {
  Id: string;
}

export type TestResultsResponseRow = InferQueryModel<
  'test_result',
  typeof getTestResultsQueryConfig
>;

export interface TestResultsItem extends TestResultsResponseRow {
  files_aggregate: {
    aggregate: {
      count: number;
    };
  };
}

export interface TestResultsResponse {
  test_result: TestResultsItem[];
  form_configuration?: GetFormConfigurationResponseRow | null | undefined;
}

export type TestResultByIdResponseRow = InferQueryModel<
  'test_result',
  typeof getTestResultByIdQueryConfig
>;

export type TestResultsByControlIdResponseRow = InferQueryModel<
  'test_result',
  typeof getTestResultsByControlIdQueryConfig
>;

export interface TestResultsByControlIdResponse {
  test_result: TestResultsByControlIdResponseRow[];
  form_configuration?: GetFormConfigurationResponseRow | null | undefined;
}

export type InternalAuditReportTestResultsByControlIdResponseRow =
  InferQueryModel<
    'control_test_internal_audit_result',
    typeof getInternalAuditReportTestResultsByControlIdQueryConfig
  >;

export interface InternalAuditReportTestResultsByControlIdResponse {
  control_test_internal_audit_result: InternalAuditReportTestResultsByControlIdResponseRow[];
  form_configuration?: GetFormConfigurationResponseRow | null | undefined;
}
export type ComplianceMonitoringAssessmentTestResultsByControlIdResponseRow =
  InferQueryModel<
    'control_test_second_line_result',
    typeof getComplianceMonitoringAssessmentTestResultsByControlIdQueryConfig
  >;

export interface ComplianceMonitoringAssessmentTestResultsByControlIdResponse {
  control_test_second_line_result: ComplianceMonitoringAssessmentTestResultsByControlIdResponseRow[];
  form_configuration?: GetFormConfigurationResponseRow | null | undefined;
}
