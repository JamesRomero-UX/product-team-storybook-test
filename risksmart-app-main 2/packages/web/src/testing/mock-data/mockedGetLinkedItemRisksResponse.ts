import type { MockedResponse } from '@apollo/client/testing';
import {
  GetLinkedItemRisksDocument,
  type GetLinkedItemRisksQuery,
  type GetLinkedItemRisksQueryVariables,
} from '@risksmart-app/web-graphql-client/generated/graphql';

export const mockedGetLinkedItemRisksResponse = (
  variables: GetLinkedItemRisksQueryVariables
): MockedResponse<
  GetLinkedItemRisksQuery,
  GetLinkedItemRisksQueryVariables
> => ({
  request: {
    query: GetLinkedItemRisksDocument,
    variables,
  },
  result: {
    data: { linked_item: [] },
  },
});
