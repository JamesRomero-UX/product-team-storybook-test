import type { ObligationChangeRegisterResponseRow } from '@risksmart-app/trpc/src/types';
import type { GetObligationChangeByIdQuery } from '@risksmart-app/web-graphql-client/generated/graphql';
import { GetObligationChangeByIdDocument } from '@risksmart-app/web-graphql-client/generated/graphql';
import { createQueryHook } from 'src/utils';

type UseGetObligationChangeByIdArgs = {
  obligationChangeId: string;
};

export const useGetObligationChangeById = createQueryHook<
  UseGetObligationChangeByIdArgs,
  ObligationChangeRegisterResponseRow[],
  GetObligationChangeByIdQuery
>({
  trpcQueryOptions: (trpc, { obligationChangeId }) =>
    trpc.frontend.obligationChange.getById.queryOptions({
      id: obligationChangeId,
    }),
  mapTrpcDataToGraphQL: (data) => ({ obligation_change: data || [] }),
  graphqlDocument: GetObligationChangeByIdDocument,
  graphqlVariables: ({ obligationChangeId }) => ({ _eq: obligationChangeId }),
});
