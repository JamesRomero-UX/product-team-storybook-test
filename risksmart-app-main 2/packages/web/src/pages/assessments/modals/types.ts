import type { Parent_Type_Enum } from '@risksmart-app/web-graphql-client/generated/graphql';

export type ResultType = Extract<
  Parent_Type_Enum,
  | 'document_assessment_result'
  | 'obligation_assessment_result'
  | 'risk_assessment_result'
>;
