import type { MockedResponse } from '@apollo/client/testing';
import type {
  GetDocumentsQuery,
  GetDocumentsQueryVariables,
} from '@risksmart-app/web-graphql-client/generated/graphql';
import { GetDocumentsDocument } from '@risksmart-app/web-graphql-client/generated/graphql';

export const mockedGetDocumentsResponse = (
  variables: GetDocumentsQueryVariables,
  response: GetDocumentsQuery = {
    document: [],
    assessment_result_parent: [],
  }
): MockedResponse<GetDocumentsQuery, GetDocumentsQueryVariables> => ({
  request: {
    query: GetDocumentsDocument,
    variables,
  },
  result: {
    data: response,
  },
});
