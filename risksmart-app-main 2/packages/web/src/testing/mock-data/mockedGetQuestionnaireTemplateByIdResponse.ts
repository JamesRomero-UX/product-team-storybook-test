import type { MockedResponse } from '@apollo/client/testing';
import type {
  GetQuestionnaireTemplateByIdQuery,
  GetQuestionnaireTemplateByIdQueryVariables,
} from '@risksmart-app/web-graphql-client/generated/graphql';
import { GetQuestionnaireTemplateByIdDocument } from '@risksmart-app/web-graphql-client/generated/graphql';

export const mockedGetQuestionnaireTemplateByIdResponse = (
  variables: GetQuestionnaireTemplateByIdQueryVariables,
  response: GetQuestionnaireTemplateByIdQuery['questionnaire_template']
): MockedResponse<
  GetQuestionnaireTemplateByIdQuery,
  GetQuestionnaireTemplateByIdQueryVariables
> => ({
  request: {
    query: GetQuestionnaireTemplateByIdDocument,
    variables,
  },
  result: {
    data: {
      questionnaire_template: response
        ? {
            __typename: 'questionnaire_template',
            ...response,
          }
        : null,
    },
  },
});
