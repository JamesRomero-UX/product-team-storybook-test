import type { AcceptanceAuditByIdResponseRow } from '@risksmart-app/trpc/src/types';
import type { GetAcceptanceAuditByIdQuery } from '@risksmart-app/web-graphql-client/generated/graphql';
import { GetAcceptanceAuditByIdDocument } from '@risksmart-app/web-graphql-client/generated/graphql';
import { createQueryHook } from 'src/utils';

type UseGetAcceptanceAuditByIdArgs = {
  id: string;
};

export const useGetAcceptanceAuditById = createQueryHook<
  UseGetAcceptanceAuditByIdArgs,
  AcceptanceAuditByIdResponseRow[],
  GetAcceptanceAuditByIdQuery
>({
  trpcQueryOptions: (trpc, { id }) =>
    trpc.frontend.audit.getAcceptanceAuditById.queryOptions({ id }),
  mapTrpcDataToGraphQL: (data) => ({ acceptance_audit: data }),
  graphqlDocument: GetAcceptanceAuditByIdDocument,
  graphqlVariables: ({ id }) => ({ Id: id }),
});
