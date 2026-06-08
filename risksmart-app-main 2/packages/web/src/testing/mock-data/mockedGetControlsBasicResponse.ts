import type { MockedResponse } from '@apollo/client/testing';
import type {
  GetControlsBasicQuery,
  GetControlsBasicQueryVariables,
} from '@risksmart-app/web-graphql-client/generated/graphql';
import { GetControlsBasicDocument } from '@risksmart-app/web-graphql-client/generated/graphql';

export const mockedGetControlsBasicResponse: MockedResponse<
  GetControlsBasicQuery,
  GetControlsBasicQueryVariables
> = {
  request: {
    query: GetControlsBasicDocument,
  },
  result: {
    data: {
      control: [],
      node: [],
    },
  },
};
