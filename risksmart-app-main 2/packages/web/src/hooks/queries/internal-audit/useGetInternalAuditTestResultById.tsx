import type { InternalAuditTestResultByIdResponse } from '@risksmart-app/trpc/src/types';
import type { GetInternalAuditTestResultByIdQuery } from '@risksmart-app/web-graphql-client/generated/graphql';
import { GetInternalAuditTestResultByIdDocument } from '@risksmart-app/web-graphql-client/generated/graphql';
import { createQueryHook } from 'src/utils';

type UseGetInternalAuditTestResultByIdArgs = {
  id: string;
};

export const useGetInternalAuditTestResultById = createQueryHook<
  UseGetInternalAuditTestResultByIdArgs,
  InternalAuditTestResultByIdResponse[],
  GetInternalAuditTestResultByIdQuery
>({
  trpcQueryOptions: (trpc, { id }) =>
    trpc.frontend.internalAuditTestResult.internalAuditTestResultById.queryOptions(
      {
        id,
      }
    ),
  mapTrpcDataToGraphQL: (data) => ({
    control_test_internal_audit_result: data,
  }),
  graphqlDocument: GetInternalAuditTestResultByIdDocument,
  graphqlVariables: ({ id }) => ({ Id: id }),
});
