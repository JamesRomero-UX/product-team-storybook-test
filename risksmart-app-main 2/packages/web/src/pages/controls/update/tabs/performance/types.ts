import type {
  GetComplianceMonitoringAssessmentTestResultsByControlIdQuery,
  GetInternalAuditReportTestResultsByControlIdQuery,
  GetTestResultsByControlIdQuery,
} from '@risksmart-app/web-graphql-client/generated/graphql';

import type { CollectionData } from '@/utils/collectionUtils';

export type PerformanceFlatFields = CollectionData<
  GetTestResultsByControlIdQuery['test_result'][number]
>;

type SharedAdditionalFields = {
  SubmitterName: null | string;
  FriendlyID: string;
  OverallEffectivenessLabelled: string;
  TestTypeLabelled: string;
};

export type PerformanceRegisterFields = PerformanceFlatFields &
  SharedAdditionalFields & {
    AssessmentTitle: string;
  };

export type ComplianceMonitoringPerformanceFlatFields = CollectionData<
  GetComplianceMonitoringAssessmentTestResultsByControlIdQuery['control_test_second_line_result'][number]
>;

export type ComplianceMonitoringPerformanceRegisterFields =
  ComplianceMonitoringPerformanceFlatFields &
    SharedAdditionalFields & {
      ComplianceMonitoringAssessmentTitle: string;
    };

export type InternalAuditPerformanceFlatFields = CollectionData<
  GetInternalAuditReportTestResultsByControlIdQuery['control_test_internal_audit_result'][number]
>;

export type InternalAuditPerformanceRegisterFields =
  InternalAuditPerformanceFlatFields &
    SharedAdditionalFields & {
      InternalAuditReportTitle: string;
    };
