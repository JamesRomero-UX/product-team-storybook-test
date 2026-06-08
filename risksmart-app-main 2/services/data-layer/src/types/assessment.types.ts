import type { InferQueryModel } from '@risksmart-app/drizzle/src/db';
import type { getMyDueItemsAssessmentsQueryConfig } from '@risksmart-app/drizzle/src/queries/assessment.query';

export type getMyDueItemsAssessmentsResponseRow = InferQueryModel<
  'assessment',
  typeof getMyDueItemsAssessmentsQueryConfig
>;
