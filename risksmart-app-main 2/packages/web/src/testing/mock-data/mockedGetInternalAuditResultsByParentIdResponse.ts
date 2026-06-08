import type { MockedResponse } from '@apollo/client/testing';
import type {
  GetInternalAuditResultsByParentIdQuery,
  GetInternalAuditResultsByParentIdQueryVariables,
} from '@risksmart-app/web-graphql-client/generated/graphql';
import { GetInternalAuditResultsByParentIdDocument } from '@risksmart-app/web-graphql-client/generated/graphql';

export const mockedGetInternalAuditResultsByParentIdResponse = (
  variables: GetInternalAuditResultsByParentIdQueryVariables,
  response: GetInternalAuditResultsByParentIdQuery
): MockedResponse<
  GetInternalAuditResultsByParentIdQuery,
  GetInternalAuditResultsByParentIdQueryVariables
> => ({
  request: {
    query: GetInternalAuditResultsByParentIdDocument,
    variables,
  },
  result: {
    data: response,
  },
});
