import type { MockedResponse } from '@apollo/client/testing';
import type {
  InsertRibbonItemsByParentTypeMutation,
  InsertRibbonItemsByParentTypeMutationVariables,
  Parent_Type_Enum,
} from '@risksmart-app/web-graphql-client/generated/graphql';
import { InsertRibbonItemsByParentTypeDocument } from '@risksmart-app/web-graphql-client/generated/graphql';

export const mockedInsertRibbonItemsByParentTypeMutationResponse = (
  parentType: Parent_Type_Enum,
  filters: string,
  response: InsertRibbonItemsByParentTypeMutation = {
    insert_custom_ribbon_one: {
      Id: 'random-cool-uuid',
    },
  }
): MockedResponse<
  InsertRibbonItemsByParentTypeMutation,
  InsertRibbonItemsByParentTypeMutationVariables
> => ({
  request: {
    query: InsertRibbonItemsByParentTypeDocument,
    variables: { parentType, filters },
  },
  result: {
    data: response,
  },
});
