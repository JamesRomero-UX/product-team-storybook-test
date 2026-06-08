import type { MockedResponse } from '@apollo/client/testing';
import type {
  GetFormConfigurationQuery,
  GetFormConfigurationQueryVariables,
} from '@risksmart-app/web-graphql-client/generated/graphql';
import { GetFormConfigurationDocument } from '@risksmart-app/web-graphql-client/generated/graphql';

export const mockedGetFormConfiguration = (
  variables: GetFormConfigurationQueryVariables,
  response: GetFormConfigurationQuery = {
    form_configuration: [],
  }
): MockedResponse<
  GetFormConfigurationQuery,
  GetFormConfigurationQueryVariables
> => {
  return {
    request: {
      query: GetFormConfigurationDocument,
      variables: variables,
    },

    result: {
      data: response,
    },
  };
};
