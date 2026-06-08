import type { InternalAuditReportTestResultsByControlIdResponse } from '@risksmart-app/trpc/src/types';
import type { GetInternalAuditReportTestResultsByControlIdQuery } from '@risksmart-app/web-graphql-client/generated/graphql';
import { GetInternalAuditReportTestResultsByControlIdDocument } from '@risksmart-app/web-graphql-client/generated/graphql';
import { createQueryHook } from 'src/utils';

type UseGetInternalAuditReportTestResultsByControlIdArgs = {
  controlId: string;
};

export const useGetInternalAuditReportTestResultsByControlId = createQueryHook<
  UseGetInternalAuditReportTestResultsByControlIdArgs,
  InternalAuditReportTestResultsByControlIdResponse,
  GetInternalAuditReportTestResultsByControlIdQuery
>({
  trpcQueryOptions: (trpc, { controlId }) =>
    trpc.frontend.testResult.internalAuditReportTestResultsByControlId.queryOptions(
      {
        controlId,
      }
    ),
  mapTrpcDataToGraphQL: (data) => ({
    control_test_internal_audit_result: data.control_test_internal_audit_result,
  }),
  graphqlDocument: GetInternalAuditReportTestResultsByControlIdDocument,
  graphqlVariables: ({ controlId }) => ({ controlId }),
});
