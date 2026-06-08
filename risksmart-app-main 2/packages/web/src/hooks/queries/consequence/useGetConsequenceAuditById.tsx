import type { ConsequenceAuditByIdResponseRow } from '@risksmart-app/trpc/src/types';
import type { GetConsequenceAuditByIdQuery } from '@risksmart-app/web-graphql-client/generated/graphql';
import { GetConsequenceAuditByIdDocument } from '@risksmart-app/web-graphql-client/generated/graphql';
import { createQueryHook } from 'src/utils';

type UseGetConsequenceAuditByIdArgs = {
  id: string;
};

export const useGetConsequenceAuditById = createQueryHook<
  UseGetConsequenceAuditByIdArgs,
  ConsequenceAuditByIdResponseRow[],
  GetConsequenceAuditByIdQuery
>({
  trpcQueryOptions: (trpc, { id }) =>
    trpc.frontend.consequence.getConsequenceAuditById.queryOptions({ id }),
  mapTrpcDataToGraphQL: (data) => ({
    consequence_audit: data ?? [],
  }),
  graphqlDocument: GetConsequenceAuditByIdDocument,
  graphqlVariables: ({ id }) => ({ Id: id }),
});
