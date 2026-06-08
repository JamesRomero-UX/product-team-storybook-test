import type { InferQueryModel } from '@risksmart-app/drizzle/src/db';
import type { getAssessmentListQueryConfig } from '@risksmart-app/drizzle/src/queries/assessment.query';

import type { GetAssessmentByIdResponseRow } from '../../assessment.types';
import type { GetFormConfigurationResponseRow } from '../../form-configuration.types';

export type AssessmentListResponseRow = InferQueryModel<
  'assessment',
  typeof getAssessmentListQueryConfig
>;

export interface AssessmentByIdResponse {
  assessment: GetAssessmentByIdResponseRow;
  form_configuration?: GetFormConfigurationResponseRow | null;
}
