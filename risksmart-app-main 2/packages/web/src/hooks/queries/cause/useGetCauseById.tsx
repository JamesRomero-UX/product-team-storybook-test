import type { CauseByIdResponseRow } from '@risksmart-app/trpc/src/types';
import type { GetCauseByIdQuery } from '@risksmart-app/web-graphql-client/generated/graphql';
import { GetCauseByIdDocument } from '@risksmart-app/web-graphql-client/generated/graphql';
import { createQueryHook } from 'src/utils';

type UseGetCauseByIdArgs = {
  causeId: string;
};

export const useGetCauseById = createQueryHook<
  UseGetCauseByIdArgs,
  CauseByIdResponseRow[],
  GetCauseByIdQuery
>({
  trpcQueryOptions: (trpc, { causeId }) =>
    trpc.frontend.cause.getById.queryOptions({ causeId }),
  mapTrpcDataToGraphQL: (data) => ({ cause: data }),
  graphqlDocument: GetCauseByIdDocument,
  graphqlVariables: ({ causeId }) => ({ _eq: causeId }),
});
