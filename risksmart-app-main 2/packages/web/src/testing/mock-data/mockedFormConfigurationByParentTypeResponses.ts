import type { MockedResponse } from '@apollo/client/testing';
import type {
  GetFormConfigurationByParentTypeQuery,
  GetFormConfigurationByParentTypeQueryVariables,
  Parent_Type_Enum,
} from '@risksmart-app/web-graphql-client/generated/graphql';
import { GetFormConfigurationByParentTypeDocument } from '@risksmart-app/web-graphql-client/generated/graphql';

export const mockedFormConfigurationByParentTypeResponse = (
  parentTypes: Parent_Type_Enum[],
  response: GetFormConfigurationByParentTypeQuery = {
    form_configuration: [],
  }
): MockedResponse<
  GetFormConfigurationByParentTypeQuery,
  GetFormConfigurationByParentTypeQueryVariables
> => ({
  request: {
    query: GetFormConfigurationByParentTypeDocument,
    variables: { parentTypes },
  },
  result: {
    data: response,
  },
});
