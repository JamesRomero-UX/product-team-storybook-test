import {
  DataExportFrequency,
  DataExportStorageType,
} from '@risksmart-app/domain/src/types/consts';
import type { DefaultValues } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { NullableStringDateSchema, StringDateSchema } from 'src/schemas/global';
import { z } from 'zod';

export const useDataExportSchema = () => {
  const { t } = useTranslation('common', { keyPrefix: 'dataExport' });

  const dataExportFormSchema = z
    .object({
      Frequency: z.nativeEnum(DataExportFrequency),
      StartDate: StringDateSchema,
      EndDate: NullableStringDateSchema,
      StorageType: z.nativeEnum(DataExportStorageType),
      // Azure
      SasToken: z.string().nullish(),
      AccountName: z.string().nullish(),
      ContainerName: z.string().nullish(),
      // S3
      BucketName: z.string().nullish(),
      S3Folder: z.string().nullish(),
      AccessKey: z.string().nullish(),
      SecretAccessKey: z.string().nullish(),
      // SFTP
      Hostname: z.string().nullish(),
      Port: z.number().nullish(),
      Username: z.string().nullish(),
      Password: z.string().nullish(),
      SftpFolder: z.string().nullish(),
      // SharePoint
      EntraSecretValue: z.string().nullish(),
      EntraTenantId: z.string().nullish(),
      EntraClientId: z.string().nullish(),
      SharePointSiteId: z.string().nullish(),
      SharePointDriveId: z.string().nullish(),
      SPFolder: z.string().nullish(),
    })
    .superRefine((values, ctx) => {
      const isUrl = (value: string | null | undefined): boolean => {
        if (!value) {
          return false;
        }
        // Check for common URL patterns
        const urlPattern = /^(https?:\/\/|ftp:\/\/|www\.)|:\/\//i;

        return urlPattern.test(value.trim());
      };

      const validateFolderPath = (
        value: string | null | undefined,
        fieldName: string,
        ctx: z.RefinementCtx
      ) => {
        if (value && (value.startsWith('/') || value.endsWith('/'))) {
          ctx.addIssue({
            message: t('errorFolderNoLeadingTrailingSlash'),
            code: z.ZodIssueCode.custom,
            path: [fieldName],
          });
        }
      };

      const calculateDaysDiff = (startDate: Date, endDate: Date): number => {
        const timeDiff = endDate.getTime() - startDate.getTime();

        return Math.ceil(timeDiff / (1000 * 60 * 60 * 24));
      };

      const isSameMonth = (date1: Date, date2: Date): boolean => {
        // Checking the year because we can have same month but different years
        return (
          date1.getFullYear() === date2.getFullYear() &&
          date1.getMonth() === date2.getMonth()
        );
      };

      const validateScheduleFrequency = (
        frequency: DataExportFrequency,
        effectiveStartDate: Date,
        endDate: Date
      ) => {
        const daysDiff = calculateDaysDiff(effectiveStartDate, endDate);
        if (frequency === DataExportFrequency.Weekly && daysDiff < 7) {
          ctx.addIssue({
            message: t('errorWeeklyScheduleTooShort'),
            code: z.ZodIssueCode.custom,
            path: ['EndDate'],
          });
        }

        if (
          frequency === DataExportFrequency.Monthly &&
          isSameMonth(effectiveStartDate, endDate)
        ) {
          ctx.addIssue({
            message: t('errorMonthlyScheduleSameMonth'),
            code: z.ZodIssueCode.custom,
            path: ['EndDate'],
          });
        }
      };

      validateFolderPath(values.S3Folder, 'S3Folder', ctx);
      validateFolderPath(values.SPFolder, 'SPFolder', ctx);
      validateFolderPath(values.SftpFolder, 'SftpFolder', ctx);

      const startDate = new Date(values.StartDate);
      startDate.setHours(0, 0, 0, 0); // normalize to midnight for consistent comparison

      const now = new Date();
      now.setHours(0, 0, 0, 0);

      if (startDate < now) {
        ctx.addIssue({
          message: t('errorStartDateInPast'),
          code: z.ZodIssueCode.custom,
          path: ['StartDate'],
        });
      }

      if (values.EndDate) {
        const endDate = new Date(values.EndDate);
        endDate.setHours(0, 0, 0, 0);

        if (endDate <= startDate) {
          ctx.addIssue({
            message: t('errorEndDateBeforeStartDate'),
            code: z.ZodIssueCode.custom,
            path: ['EndDate'],
          });
        }

        if (endDate < now) {
          ctx.addIssue({
            message: t('errorEndDateInPast'),
            code: z.ZodIssueCode.custom,
            path: ['EndDate'],
          });
        }

        validateScheduleFrequency(values.Frequency, startDate, endDate);
      }

      if (values.StorageType === DataExportStorageType.AzureBlobStorage) {
        if (!values.SasToken) {
          ctx.addIssue({
            message: t('errorRequired'),
            code: z.ZodIssueCode.custom,
            path: ['SasToken'],
          });
        }
        if (!values.AccountName) {
          ctx.addIssue({
            message: t('errorRequired'),
            code: z.ZodIssueCode.custom,
            path: ['AccountName'],
          });
        }
        if (!values.ContainerName) {
          ctx.addIssue({
            message: t('errorRequired'),
            code: z.ZodIssueCode.custom,
            path: ['ContainerName'],
          });
        }
      }

      if (values.StorageType === DataExportStorageType.AmazonS3) {
        if (!values.BucketName) {
          ctx.addIssue({
            message: t('errorRequired'),
            code: z.ZodIssueCode.custom,
            path: ['BucketName'],
          });
        }
        if (!values.AccessKey) {
          ctx.addIssue({
            message: t('errorRequired'),
            code: z.ZodIssueCode.custom,
            path: ['AccessKey'],
          });
        }
        if (!values.SecretAccessKey) {
          ctx.addIssue({
            message: t('errorRequired'),
            code: z.ZodIssueCode.custom,
            path: ['SecretAccessKey'],
          });
        }
      }

      if (values.StorageType === DataExportStorageType.Sftp) {
        if (!values.Hostname) {
          ctx.addIssue({
            message: t('errorRequired'),
            code: z.ZodIssueCode.custom,
            path: ['Hostname'],
          });
        }
        if (!values.Port) {
          ctx.addIssue({
            message: t('errorRequired'),
            code: z.ZodIssueCode.custom,
            path: ['Port'],
          });
        }
        if (!values.Username) {
          ctx.addIssue({
            message: t('errorRequired'),
            code: z.ZodIssueCode.custom,
            path: ['Username'],
          });
        }
        if (!values.Password) {
          ctx.addIssue({
            message: t('errorRequired'),
            code: z.ZodIssueCode.custom,
            path: ['Password'],
          });
        }
      }

      if (values.StorageType === DataExportStorageType.MsSharePoint) {
        if (!values.EntraSecretValue) {
          ctx.addIssue({
            message: t('errorRequired'),
            code: z.ZodIssueCode.custom,
            path: ['EntraSecretValue'],
          });
        }
        if (!values.EntraTenantId) {
          ctx.addIssue({
            message: t('errorRequired'),
            code: z.ZodIssueCode.custom,
            path: ['EntraTenantId'],
          });
        }
        if (!values.EntraClientId) {
          ctx.addIssue({
            message: t('errorRequired'),
            code: z.ZodIssueCode.custom,
            path: ['EntraClientId'],
          });
        }
        if (!values.SharePointSiteId) {
          ctx.addIssue({
            message: t('errorRequired'),
            code: z.ZodIssueCode.custom,
            path: ['SharePointSiteId'],
          });
        }
        if (!values.SharePointDriveId) {
          ctx.addIssue({
            message: t('errorRequired'),
            code: z.ZodIssueCode.custom,
            path: ['SharePointDriveId'],
          });
        }
      }

      if (values.S3Folder && isUrl(values.S3Folder)) {
        ctx.addIssue({
          message: t('errorFolderCannotBeUrl'),
          code: z.ZodIssueCode.custom,
          path: ['S3Folder'],
        });
      }

      if (values.SPFolder && isUrl(values.SPFolder)) {
        ctx.addIssue({
          message: t('errorFolderCannotBeUrl'),
          code: z.ZodIssueCode.custom,
          path: ['SPFolder'],
        });
      }

      if (values.SftpFolder && isUrl(values.SftpFolder)) {
        ctx.addIssue({
          message: t('errorFolderCannotBeUrl'),
          code: z.ZodIssueCode.custom,
          path: ['SftpFolder'],
        });
      }
    });

  return dataExportFormSchema;
};

export type DataExportFormDataFields = z.infer<
  ReturnType<typeof useDataExportSchema>
>;

export const defaultValues: DefaultValues<DataExportFormDataFields> = {
  Frequency: DataExportFrequency.Daily,
  StorageType: DataExportStorageType.MsSharePoint,
};
