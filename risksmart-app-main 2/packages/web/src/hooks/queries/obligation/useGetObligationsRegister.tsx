import type {
  AssessmentResultParentWithObligationResultsResponseRow,
  ObligationRegisterResponse,
  ObligationRegisterResponseRow,
} from '@risksmart-app/trpc/src/types';
import type { GetObligationsQuery } from '@risksmart-app/web-graphql-client/generated/graphql';
import { GetObligationsDocument } from '@risksmart-app/web-graphql-client/generated/graphql';
import { createQueryHook } from 'src/utils';

function mapTrpcAssessmentResultParentToGraphQL(
  assessment_result_parent: AssessmentResultParentWithObligationResultsResponseRow
): GetObligationsQuery['assessment_result_parent'][number] {
  return {
    ...assessment_result_parent,
  };
}

function mapTrpcObligationToGraphQL(
  obligation: ObligationRegisterResponseRow
): GetObligationsQuery['obligation'][number] {
  return {
    ...obligation,
    Parent: obligation.parent,
    BreachedIssues: obligation.issues,
    CreatedByUser: obligation.CreatedByUser,
    ModifiedByUser: obligation.ModifiedByUser,
    controls_aggregate: {
      aggregate: {
        count: obligation.controls.length,
      },
    },
  };
}

/**
 * Maps TRPC obligation data to match the GraphQL query structure
 */
export function mapTrpcObligationsToGraphQL(
  trpcData: ObligationRegisterResponse | undefined
): GetObligationsQuery | undefined {
  if (!trpcData) {
    return undefined;
  }

  return {
    obligation: trpcData.obligation.map((obligation) =>
      mapTrpcObligationToGraphQL(obligation)
    ),
    assessment_result_parent: trpcData.assessment_result_parent
      ? trpcData.assessment_result_parent.map((parent) =>
          mapTrpcAssessmentResultParentToGraphQL(parent)
        )
      : [],
  };
}

type UseGetObligationsRegisterArgs = Record<string, never>;

export const useGetObligationsRegister = createQueryHook<
  UseGetObligationsRegisterArgs,
  ObligationRegisterResponse,
  GetObligationsQuery
>({
  trpcQueryOptions: (trpc) => trpc.frontend.obligation.register.queryOptions(),
  mapTrpcDataToGraphQL: (data) => ({
    obligation: data.obligation.map((obligation) =>
      mapTrpcObligationToGraphQL(obligation)
    ),
    assessment_result_parent: data.assessment_result_parent
      ? data.assessment_result_parent.map((parent) =>
          mapTrpcAssessmentResultParentToGraphQL(parent)
        )
      : [],
  }),
  graphqlDocument: GetObligationsDocument,
  graphqlVariables: () => ({
    includeAssessmentResultsHistory: true,
  }),
});
