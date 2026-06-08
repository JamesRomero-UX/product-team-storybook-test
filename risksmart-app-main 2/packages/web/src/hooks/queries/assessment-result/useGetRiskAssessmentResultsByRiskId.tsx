import type { RiskAssessmentResultsByRiskIdResponseRow } from '@risksmart-app/trpc/src/types';
import type { GetRiskAssessmentResultsByRiskIdQuery } from '@risksmart-app/web-graphql-client/generated/graphql';
import { GetRiskAssessmentResultsByRiskIdDocument } from '@risksmart-app/web-graphql-client/generated/graphql';
import { createQueryHook } from 'src/utils';

type UseGetRiskAssessmentResultsByRiskIdArgs = {
  riskId: string;
};

export const useGetRiskAssessmentResultsByRiskId = createQueryHook<
  UseGetRiskAssessmentResultsByRiskIdArgs,
  RiskAssessmentResultsByRiskIdResponseRow[],
  GetRiskAssessmentResultsByRiskIdQuery
>({
  trpcQueryOptions: (trpc, { riskId }) =>
    trpc.frontend.assessment.riskAssessmentResultsByRiskId.queryOptions({
      riskId,
    }),
  mapTrpcDataToGraphQL: (data) => ({ risk_assessment_result: data }),
  graphqlDocument: GetRiskAssessmentResultsByRiskIdDocument,
  graphqlVariables: ({ riskId }) => ({ RiskId: riskId }),
});
