import type { InferQueryModel } from '@risksmart-app/drizzle/src/db';
import type { getMyDueItemsAssessmentActivitiesConfig } from '@risksmart-app/drizzle/src/queries/assessment-activity.query';

export type GetMyDueItemsAssessmentActivitiesResponseRow = InferQueryModel<
  'assessment_activity',
  typeof getMyDueItemsAssessmentActivitiesConfig
>;
