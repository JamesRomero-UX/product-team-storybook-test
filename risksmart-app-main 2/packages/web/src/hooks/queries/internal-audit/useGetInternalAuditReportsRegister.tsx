import type { InternalAuditReportRegisterResponse } from '@risksmart-app/trpc/src/types';
import type { GetInternalAuditReportsQuery } from '@risksmart-app/web-graphql-client/generated/graphql';
import { GetInternalAuditReportsDocument } from '@risksmart-app/web-graphql-client/generated/graphql';
import { createQueryHook } from 'src/utils';

type UseGetInternalAuditReportsRegisterArgs = Record<string, never>;

export const useGetInternalAuditReportsRegister = createQueryHook<
  UseGetInternalAuditReportsRegisterArgs,
  InternalAuditReportRegisterResponse,
  GetInternalAuditReportsQuery
>({
  trpcQueryOptions: (trpc) =>
    trpc.frontend.internalAuditReport.register.queryOptions(),
  mapTrpcDataToGraphQL: (data) => ({
    internal_audit_report: data.internal_audit_report.map((report) => ({
      ...report,
      assessedItems: report.assessmentResults || [],
    })),
  }),
  graphqlDocument: GetInternalAuditReportsDocument,
});
