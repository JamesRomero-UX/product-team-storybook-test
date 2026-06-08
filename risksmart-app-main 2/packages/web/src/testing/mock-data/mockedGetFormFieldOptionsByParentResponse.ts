import type { MockedResponse } from '@apollo/client/testing';
import type {
  GetFormFieldOptionsByParentTypeQuery,
  GetFormFieldOptionsByParentTypeQueryVariables,
  Parent_Type_Enum,
} from '@risksmart-app/web-graphql-client/generated/graphql';
import { GetFormFieldOptionsByParentTypeDocument } from '@risksmart-app/web-graphql-client/generated/graphql';

export const mockedGetFormFieldOptionsByParentResponse = (
  parentTypes: Parent_Type_Enum[],
  response: GetFormFieldOptionsByParentTypeQuery = {
    form_field_configuration: [],
  }
): MockedResponse<
  GetFormFieldOptionsByParentTypeQuery,
  GetFormFieldOptionsByParentTypeQueryVariables
> => ({
  request: {
    query: GetFormFieldOptionsByParentTypeDocument,
    variables: { parentTypes },
  },
  result: {
    data: response,
  },
});
