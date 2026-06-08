import type { AcceptancesByParentRiskIdResponse } from '@risksmart-app/trpc/src/types';
import type { GetAcceptancesByParentRiskIdQuery } from '@risksmart-app/web-graphql-client/generated/graphql';
import { GetAcceptancesByParentRiskIdDocument } from '@risksmart-app/web-graphql-client/generated/graphql';
import { createQueryHook } from 'src/utils';

type UseGetAcceptancesByParentRiskIdArgs = {
  riskId: string;
};

export const useGetAcceptancesByParentRiskId = createQueryHook<
  UseGetAcceptancesByParentRiskIdArgs,
  AcceptancesByParentRiskIdResponse,
  GetAcceptancesByParentRiskIdQuery
>({
  trpcQueryOptions: (trpc, { riskId }) =>
    trpc.frontend.acceptance.getByParentRiskId.queryOptions({ riskId }),
  mapTrpcDataToGraphQL: (data) => ({ acceptance: data.acceptance }),
  graphqlDocument: GetAcceptancesByParentRiskIdDocument,
  graphqlVariables: ({ riskId }) => ({ ParentId: riskId }),
});
