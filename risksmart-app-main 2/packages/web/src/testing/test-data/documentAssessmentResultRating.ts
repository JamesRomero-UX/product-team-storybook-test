import type {
  GetLatestComplianceMonitoringAssessmentDocumentAssessmentResultByDocumentIdQuery,
  GetLatestDocumentAssessmentResultByDocumentIdQuery,
  GetLatestInternalAuditReportDocumentAssessmentResultByDocumentIdQuery,
} from '@risksmart-app/web-graphql-client/generated/graphql';
import { randomUUID } from 'crypto';

const defaultDocumentAssessmentResult: GetLatestDocumentAssessmentResultByDocumentIdQuery['document_assessment_result'][number] =
  {
    CustomAttributeData: null,
    Id: '4364abcd-5adc-4157-a2e9-253a8c343c75',
    Rating: 3,
    Rationale: '',
    TestDate: '2024-08-21T00:00:00+00:00',
    parents: [],
    ancestorContributors: [],
    __typename: 'document_assessment_result',
  };

export const buildDocumentAssessmentResultRating = (
  overrides: Partial<
    GetLatestDocumentAssessmentResultByDocumentIdQuery['document_assessment_result'][number]
  >
): GetLatestDocumentAssessmentResultByDocumentIdQuery['document_assessment_result'][number] => {
  return {
    ...defaultDocumentAssessmentResult,
    Id: randomUUID(),
    ...overrides,
  };
};

const defaultDocumentSecondLineResult: GetLatestComplianceMonitoringAssessmentDocumentAssessmentResultByDocumentIdQuery['document_second_line_result'][number] =
  {
    CustomAttributeData: null,
    Id: '4364abcd-5adc-4157-a2e9-253a8c343c75',
    Rating: 3,
    Rationale: '',
    TestDate: '2024-08-21T00:00:00+00:00',
    parents: [],
    ancestorContributors: [],
    __typename: 'document_second_line_result',
  };

export const buildDocumentSecondLineResultRating = (
  overrides: Partial<
    GetLatestComplianceMonitoringAssessmentDocumentAssessmentResultByDocumentIdQuery['document_second_line_result'][number]
  >
): GetLatestComplianceMonitoringAssessmentDocumentAssessmentResultByDocumentIdQuery['document_second_line_result'][number] => {
  return {
    ...defaultDocumentSecondLineResult,
    Id: randomUUID(),
    ...overrides,
  };
};

const defaultDocumentInternalAuditResult: GetLatestInternalAuditReportDocumentAssessmentResultByDocumentIdQuery['document_internal_audit_result'][number] =
  {
    CustomAttributeData: null,
    Id: '4364abcd-5adc-4157-a2e9-253a8c343c75',
    Rating: 3,
    Rationale: '',
    TestDate: '2024-08-21T00:00:00+00:00',
    parents: [],
    ancestorContributors: [],
    __typename: 'document_internal_audit_result',
  };

export const buildDocumentInternalAuditResultRating = (
  overrides: Partial<
    GetLatestInternalAuditReportDocumentAssessmentResultByDocumentIdQuery['document_internal_audit_result'][number]
  >
): GetLatestInternalAuditReportDocumentAssessmentResultByDocumentIdQuery['document_internal_audit_result'][number] => {
  return {
    ...defaultDocumentInternalAuditResult,
    Id: randomUUID(),
    ...overrides,
  };
};
