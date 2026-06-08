import type { MockedResponse } from '@apollo/client/testing';
import type {
  GetTagsQuery,
  GetTagsQueryVariables,
} from '@risksmart-app/web-graphql-client/generated/graphql';
import { GetTagsDocument } from '@risksmart-app/web-graphql-client/generated/graphql';

export const mockedTagsResponse: MockedResponse<
  GetTagsQuery,
  GetTagsQueryVariables
> = {
  request: {
    query: GetTagsDocument,
  },
  result: {
    data: {
      tag_type: [],
    },
  },
};
