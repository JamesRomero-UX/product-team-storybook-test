import type { GetObligationImpactsByParentIdResponseRow } from '@risksmart-app/trpc/src/types';
import type { GetObligationImpactsByParentIdQuery } from '@risksmart-app/web-graphql-client/generated/graphql';
import { GetObligationImpactsByParentIdDocument } from '@risksmart-app/web-graphql-client/generated/graphql';
import { createQueryHook } from 'src/utils';

type UseGetObligationImpactsByParentIdArgs = { parentId: string };

export const useGetObligationImpactsByParentId = createQueryHook<
  UseGetObligationImpactsByParentIdArgs,
  GetObligationImpactsByParentIdResponseRow[],
  GetObligationImpactsByParentIdQuery
>({
  trpcQueryOptions: (trpc, { parentId }) =>
    trpc.frontend.obligationImpact.getByParentId.queryOptions({ parentId }),
  mapTrpcDataToGraphQL: (data) => ({ obligation_impact: data || [] }),
  graphqlDocument: GetObligationImpactsByParentIdDocument,
  graphqlVariables: ({ parentId }) => ({ _eq: parentId }),
  graphqlFetchPolicy: 'no-cache',
});
