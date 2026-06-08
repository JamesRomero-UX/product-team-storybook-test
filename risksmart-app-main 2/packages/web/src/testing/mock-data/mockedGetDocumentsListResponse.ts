import type { MockedResponse } from '@apollo/client/testing';
import type {
  GetDocumentListQuery,
  GetDocumentListQueryVariables,
} from '@risksmart-app/web-graphql-client/generated/graphql';
import { GetDocumentListDocument } from '@risksmart-app/web-graphql-client/generated/graphql';

export const mockedGetDocumentListResponse = (
  variables: GetDocumentListQueryVariables,
  response: GetDocumentListQuery = {
    document: [],
  }
): MockedResponse<GetDocumentListQuery, GetDocumentListQueryVariables> => ({
  request: {
    query: GetDocumentListDocument,
    variables,
  },
  result: {
    data: response,
  },
});
