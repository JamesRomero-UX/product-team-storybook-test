import type { MockedResponse } from '@apollo/client/testing';
import type {
  GetAllFormsCustomisationQuery,
  GetFormCustomisationQuery,
  GetFormCustomisationQueryVariables,
} from '@risksmart-app/web-graphql-client/generated/graphql';
import { GetAllFormsCustomisationDocument } from '@risksmart-app/web-graphql-client/generated/graphql';

export const mockedGetAllFormCustomisationResponse = (
  response: GetAllFormsCustomisationQuery = {
    form_field_configuration: [],
    form_configuration: [],
    form_field_ordering: [],
  }
): MockedResponse<
  GetFormCustomisationQuery,
  GetFormCustomisationQueryVariables
> => ({
  request: {
    query: GetAllFormsCustomisationDocument,
  },
  result: {
    data: response,
  },
});
