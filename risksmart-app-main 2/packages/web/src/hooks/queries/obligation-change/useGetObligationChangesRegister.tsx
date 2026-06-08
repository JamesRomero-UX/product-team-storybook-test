import type { ObligationChangeRegisterResponseRow } from '@risksmart-app/trpc/src/types';
import type { GetObligationChangesQuery } from '@risksmart-app/web-graphql-client/generated/graphql';
import { GetObligationChangesDocument } from '@risksmart-app/web-graphql-client/generated/graphql';
import { createQueryHook } from 'src/utils';

function mapTrpcObligationChangeToGraphQL(
  row: ObligationChangeRegisterResponseRow
): GetObligationChangesQuery['obligation_change'][number] {
  return {
    ...row,
  };
}

type UseGetObligationChangesRegisterArgs = Record<string, never>;

export const useGetObligationChangesRegister = createQueryHook<
  UseGetObligationChangesRegisterArgs,
  ObligationChangeRegisterResponseRow[],
  GetObligationChangesQuery
>({
  trpcQueryOptions: (trpc) =>
    trpc.frontend.obligationChange.register.queryOptions(),
  mapTrpcDataToGraphQL: (data) => ({
    obligation_change: data.map((row) => mapTrpcObligationChangeToGraphQL(row)),
  }),
  graphqlDocument: GetObligationChangesDocument,
  graphqlVariables: () => ({}),
});
