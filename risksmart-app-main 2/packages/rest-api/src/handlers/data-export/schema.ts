import {
  DataExportScheduleFrequencyEnum,
  DataExportScheduleStorageTypeEnum,
} from 'generated/graphql';
import { z } from 'zod';

export const TestScheduleSchema = z.object({
  object: z.object({
    scheduleId: z.string().uuid(),
  }),
});

export const CreateScheduleSchema = z.object({
  object: z.object({
    frequency: z.nativeEnum(DataExportScheduleFrequencyEnum),
    startDate: z.string().optional(),
    endDate: z.string().optional(),
    storageType: z.nativeEnum(DataExportScheduleStorageTypeEnum),
    // Azure Blob Storage specific fields
    sasToken: z.string().optional(),
    accountName: z.string().optional(),
    containerName: z.string().optional(),
    // AWS S3 specific fields
    bucketName: z.string().optional(),
    s3Folder: z.string().optional(),
    accessKey: z.string().optional(),
    secretAccessKey: z.string().optional(),
    // SFTP specific fields
    hostname: z.string().optional(),
    port: z.number().optional(),
    username: z.string().optional(),
    password: z.string().optional(),
    sftpFolder: z.string().optional(),
    // SharePoint specific fields
    entraSecretValue: z.string().optional(),
    entraTenantId: z.string().optional(),
    entraClientId: z.string().optional(),
    sharePointSiteId: z.string().optional(),
    sharePointDriveId: z.string().optional(),
    spFolder: z.string().optional(),
  }),
});
