import type { RiskScoresByRiskIdResponse } from '@risksmart-app/trpc/src/types';
import type { GetRiskScoresByRiskIdQuery } from '@risksmart-app/web-graphql-client/generated/graphql';
import { GetRiskScoresByRiskIdDocument } from '@risksmart-app/web-graphql-client/generated/graphql';
import { createQueryHook } from 'src/utils';

type UseGetRiskScoresByRiskIdArgs = { riskId: string };

export const useGetRiskScoresByRiskId = createQueryHook<
  UseGetRiskScoresByRiskIdArgs,
  RiskScoresByRiskIdResponse,
  GetRiskScoresByRiskIdQuery
>({
  trpcQueryOptions: (trpc, { riskId }) =>
    trpc.frontend.risk.riskScoresByRiskId.queryOptions({ riskId }),
  mapTrpcDataToGraphQL: (data) => data,
  graphqlDocument: GetRiskScoresByRiskIdDocument,
  graphqlVariables: ({ riskId }) => ({ RiskId: riskId }),
});
