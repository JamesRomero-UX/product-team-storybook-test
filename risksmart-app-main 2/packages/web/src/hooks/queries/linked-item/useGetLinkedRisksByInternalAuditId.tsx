import type { GetLinkedRisksByInternalAuditIdResponse } from '@risksmart-app/trpc/src/types';
import type { GetLinkedRisksByInternalAuditIdQuery } from '@risksmart-app/web-graphql-client/generated/graphql';
import { GetLinkedRisksByInternalAuditIdDocument } from '@risksmart-app/web-graphql-client/generated/graphql';
import { createQueryHook } from 'src/utils';

type UseGetLinkedRisksByInternalAuditIdArgs = { internalAuditId: string };

export const useGetLinkedRisksByInternalAuditId = createQueryHook<
  UseGetLinkedRisksByInternalAuditIdArgs,
  GetLinkedRisksByInternalAuditIdResponse[],
  GetLinkedRisksByInternalAuditIdQuery
>({
  trpcQueryOptions: (trpc, { internalAuditId }) =>
    trpc.frontend.linkedItem.linkedRisksByInternalAuditId.queryOptions({
      internalAuditId,
    }),
  mapTrpcDataToGraphQL: (data) => ({
    linked_risks: data.map((item) => ({
      Id: item.Id,
      risk: item.target_risk,
    })),
  }),
  graphqlDocument: GetLinkedRisksByInternalAuditIdDocument,
  graphqlVariables: ({ internalAuditId }) => ({ id: internalAuditId }),
});
