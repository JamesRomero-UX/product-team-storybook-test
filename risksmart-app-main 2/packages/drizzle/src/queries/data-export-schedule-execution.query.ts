import type { QueryConfig } from '../db';

export const getDataExportScheduleExecutionsQueryConfig = {
  columns: {
    OrgKey: false,
  },
  with: {
    dataExportSchedule: {
      columns: {
        Frequency: true,
        StartTimestamp: true,
        EndTimestamp: true,
      },
    },
  },
} as const satisfies QueryConfig<'data_export_schedule_execution'>;
