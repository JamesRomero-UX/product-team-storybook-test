import type { ActionAuditByIdResponseRow } from '@risksmart-app/trpc/src/types';
import type { GetActionAuditByIdQuery } from '@risksmart-app/web-graphql-client/generated/graphql';
import { GetActionAuditByIdDocument } from '@risksmart-app/web-graphql-client/generated/graphql';
import { createQueryHook } from 'src/utils';

type UseGetActionAuditByIdArgs = {
  id: string;
};

export const useGetActionAuditById = createQueryHook<
  UseGetActionAuditByIdArgs,
  ActionAuditByIdResponseRow[],
  GetActionAuditByIdQuery
>({
  trpcQueryOptions: (trpc, { id }) =>
    trpc.frontend.audit.getActionAuditById.queryOptions({ id }),
  mapTrpcDataToGraphQL: (data) => ({ action_audit: data }),
  graphqlDocument: GetActionAuditByIdDocument,
  graphqlVariables: ({ id }) => ({ id }),
});
