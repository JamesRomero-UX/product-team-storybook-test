import type { InferQueryModel } from '@risksmart-app/drizzle/src/db';
import type { getDataExportScheduleExecutionsQueryConfig } from '@risksmart-app/drizzle/src/queries/data-export-schedule-execution.query';

export type DataExportScheduleExecutionResponseRow = InferQueryModel<
  'data_export_schedule_execution',
  typeof getDataExportScheduleExecutionsQueryConfig
>;
