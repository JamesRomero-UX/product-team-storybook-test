import type { GetAssessmentActivitiesQuery } from '@risksmart-app/web-graphql-client/generated/graphql';
import type { LabelledIdArray } from 'src/rbac/types';

import type { CollectionData } from '@/utils/collectionUtils';

type DefaultFields = {
  StatusLabelled: string;
  ActivityTypeLabelled: string;
  CreatedById: string;
  CreatedByUsername: string;
  CreatedOn: string;
  UpdatedById: string;
  UpdatedByUsername: string;
};

export type AssessmentActivityFields = CollectionData<
  GetAssessmentActivitiesQuery['assessment_activity'][0]
>;

export type AssessmentRCSAActivityFields = CollectionData<
  GetAssessmentActivitiesQuery['assessment_activity'][0]
>;

export type AssessmentActivityRegisterFields = AssessmentActivityFields &
  DefaultFields;

export type AssessmentRCSAActivityRegisterFields =
  AssessmentRCSAActivityFields &
    DefaultFields & {
      RiskSequentialId: null | string | undefined;
      LinkedRisk: null | string | undefined;
      allAssignedUsers: LabelledIdArray;
      LinkedRiskSequentialId: null | number | undefined;
      NextTestDate: string;
      NextTestOverdueDate: string;
    };

export type ActivityItemType = AssessmentActivityFields;
export type RCSAActivityItemType = AssessmentRCSAActivityFields;

export enum DeleteTypeEnum {
  Activity = 'activity',
  RCSA = 'rcsa',
}
