import type { DataExportScheduleExecutionResponseRow } from '@risksmart-app/trpc/src/types';
import type { GetDataExportScheduleExecutionsSubscription } from '@risksmart-app/web-graphql-client/generated/graphql';
import { GetDataExportScheduleExecutionsDocument } from '@risksmart-app/web-graphql-client/generated/graphql';
import { createSubscriptionHook } from 'src/utils';

type UseGetDataExportScheduleExecutionsArgs = Record<string, never>;

export const useGetDataExportScheduleExecutions = createSubscriptionHook<
  UseGetDataExportScheduleExecutionsArgs,
  DataExportScheduleExecutionResponseRow[],
  GetDataExportScheduleExecutionsSubscription
>({
  trpcQueryOptions: (trpc) =>
    trpc.frontend.dataExport.getScheduleExecutions.queryOptions(),
  mapTrpcDataToGraphQL: (data) => ({
    data_export_schedule_execution: data,
  }),
  graphqlDocument: GetDataExportScheduleExecutionsDocument,
});
