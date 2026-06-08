import type { AssessmentResultsRegisterResponse } from '@risksmart-app/trpc/types';
import type { GetAllAssessmentResultsQuery } from '@risksmart-app/web-graphql-client/generated/graphql';
import { GetAllAssessmentResultsDocument } from '@risksmart-app/web-graphql-client/generated/graphql';
import { createQueryHook } from 'src/utils';

/**
 * Maps TRPC assessment result data to match the GraphQL query structure
 */
export function mapTrpcAssessmentResultsToGraphQL(
  trpcData: AssessmentResultsRegisterResponse
): GetAllAssessmentResultsQuery {
  return {
    document_assessment_result: trpcData.document_assessment_result.map(
      (dar) => ({
        ...dar,
        __typename: 'document_assessment_result',
        assessments: dar.parents
          .filter((p) => p.ParentType === 'assessment')
          .map((p) => ({ assessment: p.assessment })),
        documents: dar.parents
          .filter((p) => p.ParentType === 'document')
          .map((p) => ({
            document: {
              ...p.document!, //pre-filtered non null data - safe to assert not null
              __typename: 'document',
            },
            node: p.node,
          })),
      })
    ),
    obligation_assessment_result: trpcData.obligation_assessment_result.map(
      (oar) => ({
        ...oar,
        __typename: 'obligation_assessment_result',
        assessments: oar.parents
          .filter((p) => p.ParentType === 'assessment')
          .map((p) => ({ assessment: p.assessment })),
        obligations: oar.parents
          .filter((p) => p.ParentType === 'obligation')
          .map((p) => ({
            obligation: {
              ...p.obligation!, //pre-filtered non null data - safe to assert not null
              __typename: 'obligation',
            },
          })),
      })
    ),
    risk_assessment_result: trpcData.risk_assessment_result.map((rar) => ({
      ...rar,
      __typename: 'risk_assessment_result',
      assessments: rar.parents
        .filter((p) => p.ParentType === 'assessment')
        .map((p) => ({ assessment: p.assessment })),
      risks: rar.parents
        .filter((p) => p.ParentType === 'risk')
        .map((p) => ({
          risk: {
            ...p.risk!, //pre-filtered non null data - safe to assert not null
            __typename: 'risk',
          },
        })),
    })),
  };
}

export const useGetAllAssessmentResults = createQueryHook<
  Record<string, never>,
  AssessmentResultsRegisterResponse,
  GetAllAssessmentResultsQuery
>({
  trpcQueryOptions: (trpc) =>
    trpc.frontend.assessment.resultsRegister.queryOptions(),
  mapTrpcDataToGraphQL: mapTrpcAssessmentResultsToGraphQL,
  graphqlDocument: GetAllAssessmentResultsDocument,
});
