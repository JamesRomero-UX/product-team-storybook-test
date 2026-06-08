import type { InferQueryModel } from '@risksmart-app/drizzle/src/db';
import type {
  getAssessmentActivitiesByParentIdConfig,
  getAssessmentActivitiesRegisterQueryConfig,
  getAssessmentRCSAActivitiesByAssessmentIdQueryConfig,
} from '@risksmart-app/drizzle/src/queries/assessment-activity.query';

export type AssessmentActivityRegisterResponseRow = InferQueryModel<
  'assessment_activity',
  typeof getAssessmentActivitiesRegisterQueryConfig
>;

export type AssessmentRCSAActivityByAssessmentIdResponseRow = InferQueryModel<
  'assessment_activity',
  typeof getAssessmentRCSAActivitiesByAssessmentIdQueryConfig
>;

export type AssessmentActivitiesByParentIdResponseRow = InferQueryModel<
  'assessment_activity',
  typeof getAssessmentActivitiesByParentIdConfig
>;
