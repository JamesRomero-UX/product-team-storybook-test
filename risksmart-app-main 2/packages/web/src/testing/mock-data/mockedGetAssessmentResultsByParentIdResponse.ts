import type { MockedResponse } from '@apollo/client/testing';
import type {
  GetAssessmentResultsByParentIdQuery,
  GetAssessmentResultsByParentIdQueryVariables,
} from '@risksmart-app/web-graphql-client/generated/graphql';
import { GetAssessmentResultsByParentIdDocument } from '@risksmart-app/web-graphql-client/generated/graphql';

export const mockedGetAssessmentResultsByParentIdResponse = (
  variables: GetAssessmentResultsByParentIdQueryVariables,
  response: GetAssessmentResultsByParentIdQuery
): MockedResponse<
  GetAssessmentResultsByParentIdQuery,
  GetAssessmentResultsByParentIdQueryVariables
> => ({
  request: {
    query: GetAssessmentResultsByParentIdDocument,
    variables,
  },
  result: {
    data: response,
  },
});
