import type { DataExportScheduleResponseRow } from '@risksmart-app/trpc/src/types';
import type { GetActiveDataExportScheduleSubscription } from '@risksmart-app/web-graphql-client/generated/graphql';
import { GetActiveDataExportScheduleDocument } from '@risksmart-app/web-graphql-client/generated/graphql';
import { createSubscriptionHook } from 'src/utils';

type UseGetActiveDataExportScheduleArgs = Record<string, never>;

export const useGetActiveDataExportSchedule = createSubscriptionHook<
  UseGetActiveDataExportScheduleArgs,
  DataExportScheduleResponseRow[],
  GetActiveDataExportScheduleSubscription
>({
  trpcQueryOptions: (trpc) =>
    trpc.frontend.dataExport.getActiveSchedule.queryOptions(),
  mapTrpcDataToGraphQL: (data) => ({ data_export_schedule: data }),
  graphqlDocument: GetActiveDataExportScheduleDocument,
});
