import type { InternalAuditReportsByOriginatingItemIdResponse } from '@risksmart-app/trpc/src/types';
import type { GetInternalAuditReportsByOriginatingItemIdQuery } from '@risksmart-app/web-graphql-client/generated/graphql';
import { GetInternalAuditReportsByOriginatingItemIdDocument } from '@risksmart-app/web-graphql-client/generated/graphql';
import { createQueryHook } from 'src/utils';

type UseGetInternalAuditReportsByOriginatingItemIdArgs = {
  originatingItemId: string;
};

export const useGetInternalAuditReportsByOriginatingItemId = createQueryHook<
  UseGetInternalAuditReportsByOriginatingItemIdArgs,
  InternalAuditReportsByOriginatingItemIdResponse,
  GetInternalAuditReportsByOriginatingItemIdQuery
>({
  trpcQueryOptions: (trpc, { originatingItemId }) =>
    trpc.frontend.internalAuditReport.internalAuditReportsByOriginatingItemId.queryOptions(
      {
        originatingItemId,
      }
    ),
  mapTrpcDataToGraphQL: (data) => ({
    internal_audit_report: data.internal_audit_report.map((report) => ({
      ...report,
      assessedItems: report.assessmentResults,
    })),
  }),
  graphqlDocument: GetInternalAuditReportsByOriginatingItemIdDocument,
  graphqlVariables: ({ originatingItemId }) => ({
    OriginatingItemId: originatingItemId,
  }),
  graphqlFetchPolicy: 'no-cache',
});
