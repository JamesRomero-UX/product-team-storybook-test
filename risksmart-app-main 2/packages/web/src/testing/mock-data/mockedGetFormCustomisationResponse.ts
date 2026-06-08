import type { MockedResponse } from '@apollo/client/testing';
import type {
  GetFormCustomisationQuery,
  GetFormCustomisationQueryVariables,
  Parent_Type_Enum,
} from '@risksmart-app/web-graphql-client/generated/graphql';
import { GetFormCustomisationDocument } from '@risksmart-app/web-graphql-client/generated/graphql';

export const mockedGetFormCustomisationResponse = (
  parentTypes: Parent_Type_Enum[],
  response: GetFormCustomisationQuery = {
    form_field_configuration: [],
    form_configuration: [],
    form_field_ordering: [],
  }
): MockedResponse<
  GetFormCustomisationQuery,
  GetFormCustomisationQueryVariables
> => ({
  request: {
    query: GetFormCustomisationDocument,
    variables: { parentTypes },
  },
  result: {
    data: response,
  },
});
