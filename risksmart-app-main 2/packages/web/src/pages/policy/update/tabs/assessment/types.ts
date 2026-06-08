import type {
  GetComplianceMonitoringAssessmentDocumentAssessmentResultsByDocumentIdQuery,
  GetDocumentAssessmentResultsByParentIdQuery,
  GetInternalAuditReportDocumentAssessmentResultsByDocumentIdQuery,
} from '@risksmart-app/web-graphql-client/generated/graphql';

import type { CollectionData } from '@/utils/collectionUtils';

export type ComplianceDocumentAssessmentResultFlatFields = CollectionData<
  GetComplianceMonitoringAssessmentDocumentAssessmentResultsByDocumentIdQuery['document_second_line_result'][number]
>;

export type ComplianceDocumentAssessmentResultRegisterFields =
  ComplianceDocumentAssessmentResultFlatFields & {
    Title: string;
    ActualCompletionDate?: null | string;
    CompletionDate: string;
    Result: string;
    ResultValue?: null | number;
    TestDate?: null | string;
    Id: string;
    Status: string;
    NextTestDate?: null | string;
  };

export type InternalAuditDocumentAssessmentResultFlatFields = CollectionData<
  GetInternalAuditReportDocumentAssessmentResultsByDocumentIdQuery['document_internal_audit_result'][number]
>;

export type InternalAuditDocumentAssessmentResultRegisterFields =
  InternalAuditDocumentAssessmentResultFlatFields & {
    Title: string;
    ActualCompletionDate?: null | string;
    CompletionDate: string;
    Result: string;
    ResultValue?: null | number;
    TestDate?: null | string;
    Id: string;
    Status: string;
    NextTestDate?: null | string;
  };

export type DocumentAssessmentResultFlatFields = CollectionData<
  GetDocumentAssessmentResultsByParentIdQuery['document_assessment_result'][number]
>;

export type DocumentAssessmentResultRegisterFields =
  DocumentAssessmentResultFlatFields & {
    Title: string;
    ActualCompletionDate?: null | string;
    CompletionDate: string;
    Result: string;
    ResultValue?: null | number;
    TestDate?: null | string;
    AssessmentId?: string;
    Id: string;
    Status: string;
    NextTestDate?: null | string;
  };
