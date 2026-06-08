import type { MockedResponse } from '@apollo/client/testing';
import type {
  GetDocumentFileByIdQuery,
  GetDocumentFileByIdQueryVariables,
} from '@risksmart-app/web-graphql-client/generated/graphql';
import { GetDocumentFileByIdDocument } from '@risksmart-app/web-graphql-client/generated/graphql';

export const mockedGetDocumentFileByIdResponse = (
  variables: GetDocumentFileByIdQueryVariables,
  response: GetDocumentFileByIdQuery = {
    document_file: [],
  }
): MockedResponse<
  GetDocumentFileByIdQuery,
  GetDocumentFileByIdQueryVariables
> => ({
  request: {
    query: GetDocumentFileByIdDocument,
    variables,
  },
  result: {
    data: response,
  },
});
