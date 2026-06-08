import type { MockedResponse } from '@apollo/client/testing';
import type {
  GetDocumentByIdQuery,
  GetDocumentByIdQueryVariables,
} from '@risksmart-app/web-graphql-client/generated/graphql';
import { GetDocumentByIdDocument } from '@risksmart-app/web-graphql-client/generated/graphql';

export const mockedGetDocumentByIdResponse = (
  variables: GetDocumentByIdQueryVariables,
  response: GetDocumentByIdQuery = {
    document: [],
  }
): MockedResponse<GetDocumentByIdQuery, GetDocumentByIdQueryVariables> => ({
  request: {
    query: GetDocumentByIdDocument,
    variables,
  },
  result: {
    data: response,
  },
});
