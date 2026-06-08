import type { InferQueryModel } from '@risksmart-app/drizzle/src/db';
import type {
  getAssessmentByIdQueryConfig,
  getAssessmentsRegisterQueryConfig,
} from '@risksmart-app/drizzle/src/queries/assessment.query';

export type AssessmentRegisterResponseRow = InferQueryModel<
  'assessment',
  typeof getAssessmentsRegisterQueryConfig
>;

export type GetAssessmentByIdResponseRow = InferQueryModel<
  'assessment',
  typeof getAssessmentByIdQueryConfig
>;

export interface CreateAssessmentResponse {
  Id: string;
}

export interface UpdateAssessmentResponse {
  Id: string;
}
