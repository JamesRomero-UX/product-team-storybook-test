import type { InferQueryModel } from '@risksmart-app/drizzle/src/db';
import type { getDataExportSchedulesQueryConfig } from '@risksmart-app/drizzle/src/queries/data-export-schedule.query';

export type DataExportScheduleResponseRow = InferQueryModel<
  'data_export_schedule',
  typeof getDataExportSchedulesQueryConfig
>;
