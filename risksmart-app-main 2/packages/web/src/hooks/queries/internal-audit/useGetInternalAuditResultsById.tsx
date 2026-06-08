import type { InternalAuditResultByIdResponseRow } from '@risksmart-app/trpc/src/types';
import type { GetInternalAuditResultByIdQuery } from '@risksmart-app/web-graphql-client/generated/graphql';
import { GetInternalAuditResultByIdDocument } from '@risksmart-app/web-graphql-client/generated/graphql';
import { createQueryHook } from 'src/utils';

type UseGetInternalAuditResultsByIdArgs = {
  internalAuditResultId: string;
};

export const useGetInternalAuditResultsById = createQueryHook<
  UseGetInternalAuditResultsByIdArgs,
  InternalAuditResultByIdResponseRow[],
  GetInternalAuditResultByIdQuery
>({
  trpcQueryOptions: (trpc, { internalAuditResultId }) =>
    trpc.frontend.internalAuditResult.internalAuditResultById.queryOptions({
      internalAuditResultId,
    }),
  mapTrpcDataToGraphQL: (data) => ({ internal_audit_result_parent: data }),
  graphqlDocument: GetInternalAuditResultByIdDocument,
  graphqlVariables: ({ internalAuditResultId }) => ({
    Id: internalAuditResultId,
  }),
  graphqlFetchPolicy: 'no-cache',
});
