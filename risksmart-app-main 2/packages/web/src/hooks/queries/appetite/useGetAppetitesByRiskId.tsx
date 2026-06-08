import type { AppetiteRegisterResponse } from '@risksmart-app/trpc/src/types';
import type { GetAppetitesByRiskIdQuery } from '@risksmart-app/web-graphql-client/generated/graphql';
import { GetAppetitesByRiskIdDocument } from '@risksmart-app/web-graphql-client/generated/graphql';
import { createQueryHook } from 'src/utils';

type UseGetAppetitesByRiskIdArgs = {
  riskId: string;
};

/**
 * Maps TRPC appetite data to match the GraphQL query structure
 */
function mapTrpcAppetitesToGraphQL(
  trpcData: AppetiteRegisterResponse
): GetAppetitesByRiskIdQuery {
  return {
    appetite_parent: trpcData.appetite_parent,
  };
}

export const useGetAppetitesByRiskId = createQueryHook<
  UseGetAppetitesByRiskIdArgs,
  AppetiteRegisterResponse,
  GetAppetitesByRiskIdQuery
>({
  trpcQueryOptions: (trpc, { riskId }) =>
    trpc.frontend.appetite.appetitesByRiskId.queryOptions({ riskId }),
  mapTrpcDataToGraphQL: mapTrpcAppetitesToGraphQL,
  graphqlDocument: GetAppetitesByRiskIdDocument,
  graphqlVariables: ({ riskId }) => ({ riskId }),
});
