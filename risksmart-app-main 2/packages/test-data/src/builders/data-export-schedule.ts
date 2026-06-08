import { DataExportFrequency } from '@risksmart-app/domain/src/types/consts/data-export-frequency';
import { DataExportStatus } from '@risksmart-app/domain/src/types/consts/data-export-status';
import { DataExportStorageType } from '@risksmart-app/domain/src/types/consts/data-export-storage-type';
import type { InferInsertModel } from '@risksmart-app/drizzle/src/db';
import { randomUUID } from 'crypto';

export const buildDataExportSchedule = ({
  orgKey,
  userId,
  overrides,
}: {
  orgKey: string;
  userId: string;
  overrides?: Partial<InferInsertModel<'data_export_schedule'>>;
}): InferInsertModel<'data_export_schedule'> => ({
  Id: randomUUID(),
  OrgKey: orgKey,
  Frequency: DataExportFrequency.Daily,
  StorageType: DataExportStorageType.AmazonS3,
  StartTimestamp: new Date().toISOString(),
  EndTimestamp: null,
  SecretArn: `arn:aws:secretsmanager:us-east-1:123456789:secret:test-${randomUUID()}`,
  CronArn: null,
  Status: DataExportStatus.Active,
  CreatedByUser: userId,
  ModifiedByUser: userId,
  CreatedAtTimestamp: new Date().toISOString(),
  ModifiedAtTimestamp: new Date().toISOString(),
  ...overrides,
});
