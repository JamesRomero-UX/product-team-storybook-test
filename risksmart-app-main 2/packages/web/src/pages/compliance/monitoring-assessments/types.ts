import type { GetComplianceMonitoringAssessmentsQuery } from '@risksmart-app/web-graphql-client/generated/graphql';
import type { LabelledIdArray } from 'src/rbac/types';

import type { CollectionData } from '@/utils/collectionUtils';

export type ComplianceMonitoringAssessmentFields = CollectionData<
  GetComplianceMonitoringAssessmentsQuery['compliance_monitoring_assessment'][number]
>;

export type ComplianceMonitoringAssessmentRegisterFields =
  ComplianceMonitoringAssessmentFields & {
    SequentialIdLabel: null | string;
    Title: string;
    ModifiedBy: string;
    CreatedBy: string;
    Status: string;
    StatusLabelled: string;
    Outcome?: null | number;
    OutcomeLabelled: string;
    allOwners: LabelledIdArray;
    allContributors: LabelledIdArray;
    AssessedItems: null | string;
  };
