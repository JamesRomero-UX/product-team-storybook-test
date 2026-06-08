import type { MockedResponse } from '@apollo/client/testing';
import type {
  Parent_Type_Enum,
  UpdateRibbonItemsByParentTypeMutation,
  UpdateRibbonItemsByParentTypeMutationVariables,
} from '@risksmart-app/web-graphql-client/generated/graphql';
import { UpdateRibbonItemsByParentTypeDocument } from '@risksmart-app/web-graphql-client/generated/graphql';

export const mockedUpdateRibbonItemsByParentTypeMutationResponse = (
  id: string,
  parentType: Parent_Type_Enum,
  filters: string,
  originalTimestamp: string,
  response: UpdateRibbonItemsByParentTypeMutation = {
    update_custom_ribbon: {
      affected_rows: 1,
    },
  }
): MockedResponse<
  UpdateRibbonItemsByParentTypeMutation,
  UpdateRibbonItemsByParentTypeMutationVariables
> => ({
  request: {
    query: UpdateRibbonItemsByParentTypeDocument,
    variables: { id, parentType, filters, originalTimestamp },
  },
  result: {
    data: response,
  },
});
