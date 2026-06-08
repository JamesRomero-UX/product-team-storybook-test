import type { InferQueryModel } from '@risksmart-app/drizzle/src/db';
import type { myDueActionsQueryConfig } from '@risksmart-app/drizzle/src/queries/action.query';
import type { myDueAssessmentsQueryConfig } from '@risksmart-app/drizzle/src/queries/assessment.query';
import type { myDueAssessmentActivitiesQueryConfig } from '@risksmart-app/drizzle/src/queries/assessment-activity.query';
import type { myDueAttestationRecordsQueryConfig } from '@risksmart-app/drizzle/src/queries/attestation-record.query';
import type { getMyDueItemsChangeRequestsQueryConfig } from '@risksmart-app/drizzle/src/queries/change-request.query';
import type { myDueControlsQueryConfig } from '@risksmart-app/drizzle/src/queries/control.query';
import type { myDueDocumentsQueryConfig } from '@risksmart-app/drizzle/src/queries/document.query';
import type { myDueIndicatorsQueryConfig } from '@risksmart-app/drizzle/src/queries/indicator.query';
import type { myDueIssuesQueryConfig } from '@risksmart-app/drizzle/src/queries/issue.query';
import type { myDueObligationsQueryConfig } from '@risksmart-app/drizzle/src/queries/obligation.query';
import type { myDueRisksQueryConfig } from '@risksmart-app/drizzle/src/queries/risk.query';

export type MyDueActionsResponseRow = InferQueryModel<
  'action',
  typeof myDueActionsQueryConfig
>;

export type MyDueAssessmentsResponseRow = InferQueryModel<
  'assessment',
  typeof myDueAssessmentsQueryConfig
>;

export type MyDueControlsResponseRow = InferQueryModel<
  'control',
  typeof myDueControlsQueryConfig
>;

export type MyDueDocumentsResponseRow = InferQueryModel<
  'document',
  typeof myDueDocumentsQueryConfig
>;

export type MyDueIndicatorsResponseRow = InferQueryModel<
  'indicator',
  typeof myDueIndicatorsQueryConfig
>;

export type MyDueIssuesResponseRow = InferQueryModel<
  'issue',
  typeof myDueIssuesQueryConfig
>;

export type MyDueObligationsResponseRow = InferQueryModel<
  'obligation',
  typeof myDueObligationsQueryConfig
>;

export type MyDueRisksResponseRow = InferQueryModel<
  'risk',
  typeof myDueRisksQueryConfig
>;

export type MyDueAssessmentActivitiesResponseRow = InferQueryModel<
  'assessment_activity',
  typeof myDueAssessmentActivitiesQueryConfig
>;

export type MyDueAttestationRecordsResponseRow = InferQueryModel<
  'attestation_record',
  typeof myDueAttestationRecordsQueryConfig
>;

type ChangeRequestQueryResult = InferQueryModel<
  'change_request',
  typeof getMyDueItemsChangeRequestsQueryConfig
>;

export type MyDueChangeRequestsResponseRow = ChangeRequestQueryResult & {
  currentUserOwnerList: {
    UserId: string | null;
  }[];
};

export interface MyDueItemsResponse {
  obligation: MyDueObligationsResponseRow[];
  risk: MyDueRisksResponseRow[];
  action: MyDueActionsResponseRow[];
  control: MyDueControlsResponseRow[];
  indicator: MyDueIndicatorsResponseRow[];
  issue: MyDueIssuesResponseRow[];
  document: MyDueDocumentsResponseRow[];
  assessment: MyDueAssessmentsResponseRow[];
  assessmentActivity: MyDueAssessmentActivitiesResponseRow[];
  attestationRecord: MyDueAttestationRecordsResponseRow[];
  changeRequest: MyDueChangeRequestsResponseRow[];
}
