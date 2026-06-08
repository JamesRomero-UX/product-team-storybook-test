import type { RiskByIdResponseRow } from '@risksmart-app/trpc/src/types';
import type { GetRiskByIdQuery } from '@risksmart-app/web-graphql-client/generated/graphql';
import { GetRiskByIdDocument } from '@risksmart-app/web-graphql-client/generated/graphql';
import { createQueryHook } from 'src/utils';

type UseGetRiskByIdArgs = { riskId: string };

export const useGetRiskById = createQueryHook<
  UseGetRiskByIdArgs,
  RiskByIdResponseRow[],
  GetRiskByIdQuery
>({
  trpcQueryOptions: (trpc, { riskId }) =>
    trpc.frontend.risk.riskById.queryOptions({ riskId }),
  mapTrpcDataToGraphQL: (data) => ({ risk: data }),
  graphqlDocument: GetRiskByIdDocument,
  graphqlVariables: ({ riskId }) => ({ _eq: riskId }),
});
