import type { MockedResponse } from '@apollo/client/testing';
import type {
  GetAssessmentsQuery,
  GetAssessmentsQueryVariables,
} from '@risksmart-app/web-graphql-client/generated/graphql';
import { GetAssessmentsDocument } from '@risksmart-app/web-graphql-client/generated/graphql';

export const mockedGetAssessmentsResponse = (
  response: GetAssessmentsQuery = {
    assessment: [],
  }
): MockedResponse<GetAssessmentsQuery, GetAssessmentsQueryVariables> => ({
  request: {
    query: GetAssessmentsDocument,
    variables: { where: {} },
  },
  result: {
    data: response,
  },
});
