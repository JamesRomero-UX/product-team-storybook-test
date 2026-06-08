import type { Parent_Type_Enum } from '@risksmart-app/web-graphql-client/generated/graphql';

export type FormType = 'action' | 'issue' | 'rating';

export type RatingResultType = Extract<
  Parent_Type_Enum,
  | 'document_assessment_result'
  | 'impact_rating'
  | 'obligation_assessment_result'
  | 'risk_assessment_result'
  | 'test_result'
>;
