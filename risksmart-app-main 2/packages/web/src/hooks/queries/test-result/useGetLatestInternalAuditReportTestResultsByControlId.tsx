import type { InternalAuditReportTestResultsByControlIdResponse } from '@risksmart-app/trpc/src/types';
import type { GetLatestInternalAuditReportTestResultsByControlIdQuery } from '@risksmart-app/web-graphql-client/generated/graphql';
import { GetLatestInternalAuditReportTestResultsByControlIdDocument } from '@risksmart-app/web-graphql-client/generated/graphql';
import { createQueryHook } from 'src/utils';

type UseGetLatestInternalAuditReportTestResultsByControlIdArgs = {
  controlId: string;
};

export const useGetLatestInternalAuditReportTestResultsByControlId =
  createQueryHook<
    UseGetLatestInternalAuditReportTestResultsByControlIdArgs,
    InternalAuditReportTestResultsByControlIdResponse,
    GetLatestInternalAuditReportTestResultsByControlIdQuery
  >({
    trpcQueryOptions: (trpc, { controlId }) =>
      trpc.frontend.testResult.latestInternalAuditReportTestResultsByControlId.queryOptions(
        { controlId }
      ),
    mapTrpcDataToGraphQL: (data) => ({
      control_test_internal_audit_result: data
        .control_test_internal_audit_result[0]
        ? [data.control_test_internal_audit_result[0]]
        : [],
    }),
    graphqlDocument: GetLatestInternalAuditReportTestResultsByControlIdDocument,
    graphqlVariables: ({ controlId }) => ({ controlId }),
  });
