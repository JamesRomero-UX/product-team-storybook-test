import type { InternalAuditByIdResponse } from '@risksmart-app/trpc/src/types';
import type { GetInternalAuditByIdQuery } from '@risksmart-app/web-graphql-client/generated/graphql';
import { GetInternalAuditByIdDocument } from '@risksmart-app/web-graphql-client/generated/graphql';
import { createQueryHook } from 'src/utils';

type UseGetInternalAuditByIdArgs = {
  internalAuditId: string;
};

export const useGetInternalAuditById = createQueryHook<
  UseGetInternalAuditByIdArgs,
  InternalAuditByIdResponse,
  GetInternalAuditByIdQuery
>({
  trpcQueryOptions: (trpc, { internalAuditId }) =>
    trpc.frontend.internalAuditEntity.internalAuditById.queryOptions({
      internalAuditId,
    }),
  mapTrpcDataToGraphQL: (data) => ({
    internal_audit_entity: data.internal_audit_entity,
  }),
  graphqlDocument: GetInternalAuditByIdDocument,
  graphqlVariables: ({ internalAuditId }) => ({ id: internalAuditId }),
});
