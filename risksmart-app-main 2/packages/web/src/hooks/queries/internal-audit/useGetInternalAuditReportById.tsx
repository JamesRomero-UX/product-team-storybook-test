import type { InternalAuditReportByIdResponseRow } from '@risksmart-app/trpc/src/types';
import type { GetInternalAuditReportByIdQuery } from '@risksmart-app/web-graphql-client/generated/graphql';
import { GetInternalAuditReportByIdDocument } from '@risksmart-app/web-graphql-client/generated/graphql';
import { createQueryHook } from 'src/utils';

type UseGetInternalAuditReportByIdArgs = {
  reportId: string;
};

export const useGetInternalAuditReportById = createQueryHook<
  UseGetInternalAuditReportByIdArgs,
  InternalAuditReportByIdResponseRow[],
  GetInternalAuditReportByIdQuery
>({
  trpcQueryOptions: (trpc, { reportId }) =>
    trpc.frontend.internalAuditReport.internalAuditReportById.queryOptions({
      reportId,
    }),
  mapTrpcDataToGraphQL: (data) => ({ internal_audit_report: data }),
  graphqlDocument: GetInternalAuditReportByIdDocument,
  graphqlVariables: ({ reportId }) => ({ Id: reportId }),
});
