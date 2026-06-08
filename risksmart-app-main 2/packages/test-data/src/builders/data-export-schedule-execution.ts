import { DataExportExecutionStatus } from '@risksmart-app/domain/src/types/consts/data-export-execution-status';
import type { InferInsertModel } from '@risksmart-app/drizzle/src/db';

export const buildDataExportScheduleExecution = ({
  orgKey,
  userId,
  overrides,
}: {
  orgKey: string;
  userId: string;
  overrides?: Partial<InferInsertModel<'data_export_schedule_execution'>>;
}): InferInsertModel<'data_export_schedule_execution'> => ({
  OrgKey: orgKey,
  ParentId: overrides?.ParentId ?? '',
  ExecutionTimestamp: new Date().toISOString(),
  Errors: null,
  Status: DataExportExecutionStatus.Complete,
  CreatedByUser: userId,
  ModifiedByUser: userId,
  CreatedAtTimestamp: new Date().toISOString(),
  ModifiedAtTimestamp: new Date().toISOString(),
  ...overrides,
});
