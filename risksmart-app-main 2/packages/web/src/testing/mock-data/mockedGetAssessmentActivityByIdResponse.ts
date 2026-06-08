import type { MockedResponse } from '@apollo/client/testing';
import type {
  GetAssessmentActivityByIdQuery,
  GetAssessmentActivityByIdQueryVariables,
} from '@risksmart-app/web-graphql-client/generated/graphql';
import { GetAssessmentActivityByIdDocument } from '@risksmart-app/web-graphql-client/generated/graphql';

export const mockedGetAssessmentActivityByIdResponse = (
  variables: GetAssessmentActivityByIdQueryVariables,
  response: GetAssessmentActivityByIdQuery
): MockedResponse<
  GetAssessmentActivityByIdQuery,
  GetAssessmentActivityByIdQueryVariables
> => ({
  request: {
    query: GetAssessmentActivityByIdDocument,
    variables,
  },
  result: {
    data: response,
  },
});
