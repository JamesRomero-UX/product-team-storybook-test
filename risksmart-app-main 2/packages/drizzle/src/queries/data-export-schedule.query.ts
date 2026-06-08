import type { QueryConfig } from '../db';

export const getDataExportSchedulesQueryConfig = {
  columns: {
    OrgKey: false,
  },
} as const satisfies QueryConfig<'data_export_schedule'>;
