import type { MockedResponse } from '@apollo/client/testing';
import type {
  GetObligationAssessmentResultsByObligationIdQuery,
  GetObligationAssessmentResultsByObligationIdQueryVariables,
} from '@risksmart-app/web-graphql-client/generated/graphql';
import { GetObligationAssessmentResultsByObligationIdDocument } from '@risksmart-app/web-graphql-client/generated/graphql';

export const mockedGetDocumentAssessmentResultsByObligationIdResponse = (
  variables: GetObligationAssessmentResultsByObligationIdQueryVariables,
  response: GetObligationAssessmentResultsByObligationIdQuery = {
    obligation_assessment_result: [],
  }
): MockedResponse<
  GetObligationAssessmentResultsByObligationIdQuery,
  GetObligationAssessmentResultsByObligationIdQueryVariables
> => ({
  request: {
    query: GetObligationAssessmentResultsByObligationIdDocument,
    variables,
  },
  result: {
    data: response,
  },
});
