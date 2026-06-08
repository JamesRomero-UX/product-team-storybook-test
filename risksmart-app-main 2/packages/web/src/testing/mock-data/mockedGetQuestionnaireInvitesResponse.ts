import type { MockedResponse } from '@apollo/client/testing';
import type {
  GetQuestionnaireInvitesQuery,
  GetQuestionnaireInvitesQueryVariables,
} from '@risksmart-app/web-graphql-client/generated/graphql';
import { GetQuestionnaireInvitesDocument } from '@risksmart-app/web-graphql-client/generated/graphql';

export const mockedGetQuestionnaireInvitesResponse = (
  variables: GetQuestionnaireInvitesQueryVariables
): MockedResponse<
  GetQuestionnaireInvitesQuery,
  GetQuestionnaireInvitesQueryVariables
> => ({
  request: {
    query: GetQuestionnaireInvitesDocument,
    variables,
  },
  result: {
    data: {
      questionnaire_invite: [],
    },
  },
});
