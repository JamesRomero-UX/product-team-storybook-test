import type { MockedResponse } from '@apollo/client/testing';
import type {
  GetRibbonItemsByParentTypeQuery,
  GetRibbonItemsByParentTypeQueryVariables,
  Parent_Type_Enum,
} from '@risksmart-app/web-graphql-client/generated/graphql';
import { GetRibbonItemsByParentTypeDocument } from '@risksmart-app/web-graphql-client/generated/graphql';

export const mockedGetRibbonItemsByParentTypeResponse = (
  parentType: Parent_Type_Enum,
  response: GetRibbonItemsByParentTypeQuery = {
    custom_ribbon: [],
  }
): MockedResponse<
  GetRibbonItemsByParentTypeQuery,
  GetRibbonItemsByParentTypeQueryVariables
> => ({
  request: {
    query: GetRibbonItemsByParentTypeDocument,
    variables: { parentType },
  },
  result: {
    data: response,
  },
});
