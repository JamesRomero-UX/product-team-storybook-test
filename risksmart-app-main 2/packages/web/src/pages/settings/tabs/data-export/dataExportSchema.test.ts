import {
  DataExportFrequency,
  DataExportStorageType,
} from '@risksmart-app/domain/src/types/consts';
import { vi } from 'vitest';

import { useDataExportSchema } from './dataExportSchema';

vi.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key: string) => key,
  }),
}));

describe('dataExportSchema', () => {
  const dataExportSchema = useDataExportSchema();

  // Use a future date for all tests to avoid start date in past validation
  const futureStartDate = '2099-01-01';

  it('validates azure fields', () => {
    const result = dataExportSchema.safeParse({
      Frequency: DataExportFrequency.Daily,
      StartDate: futureStartDate,
      StorageType: DataExportStorageType.AzureBlobStorage,
      SasToken: 'test',
      AccountName: 'test',
      ContainerName: 'test',
      BucketName: 'test',
    });

    expect(result.success).toEqual(true);
  });

  it('validates s3 fields', () => {
    const result = dataExportSchema.safeParse({
      Frequency: DataExportFrequency.Daily,
      StartDate: futureStartDate,
      StorageType: DataExportStorageType.AmazonS3,
      BucketName: 'test',
      S3Folder: 'test',
      AccessKey: 'test',
      SecretAccessKey: 'test',
    });

    expect(result.success).toEqual(true);
  });

  it('validates sftp fields', () => {
    const result = dataExportSchema.safeParse({
      Frequency: DataExportFrequency.Daily,
      StartDate: futureStartDate,
      StorageType: DataExportStorageType.Sftp,
      Hostname: 'test',
      Port: 22,
      Username: 'test',
      Password: 'test',
      SftpFolder: 'test-folder',
    });

    expect(result.success).toEqual(true);
  });

  it('validates ms fields', () => {
    const result = dataExportSchema.safeParse({
      Frequency: DataExportFrequency.Daily,
      StartDate: futureStartDate,
      StorageType: DataExportStorageType.MsSharePoint,
      EntraSecretValue: 'test',
      EntraTenantId: 'test',
      EntraClientId: 'test',
      SharePointSiteId: 'test',
      SharePointDriveId: 'test',
      SPFolder: 'test',
    });

    expect(result.success).toEqual(true);
  });

  describe('folder path validation', () => {
    describe('URL validation', () => {
      it('should reject S3Folder with http URL', () => {
        const result = dataExportSchema.safeParse({
          Frequency: DataExportFrequency.Daily,
          StartDate: futureStartDate,
          StorageType: DataExportStorageType.AmazonS3,
          BucketName: 'test',
          S3Folder: 'http://example.com/folder',
          AccessKey: 'test',
          SecretAccessKey: 'test',
        });

        expect(result.success).toEqual(false);
        expect(result.error?.issues).toContainEqual(
          expect.objectContaining({
            path: ['S3Folder'],
            message: 'errorFolderCannotBeUrl',
          })
        );
      });

      it('should reject SPFolder with http URL', () => {
        const result = dataExportSchema.safeParse({
          Frequency: DataExportFrequency.Daily,
          StartDate: futureStartDate,
          StorageType: DataExportStorageType.MsSharePoint,
          EntraSecretValue: 'test',
          EntraTenantId: 'test',
          EntraClientId: 'test',
          SharePointSiteId: 'test',
          SharePointDriveId: 'test',
          SPFolder: 'http://example.com/folder',
        });

        expect(result.success).toEqual(false);
        expect(result.error?.issues).toContainEqual(
          expect.objectContaining({
            path: ['SPFolder'],
            message: 'errorFolderCannotBeUrl',
          })
        );
      });

      it('should reject SftpFolder with http URL', () => {
        const result = dataExportSchema.safeParse({
          Frequency: DataExportFrequency.Daily,
          StartDate: futureStartDate,
          StorageType: DataExportStorageType.Sftp,
          Hostname: 'test',
          Port: 22,
          Username: 'test',
          Password: 'test',
          SftpFolder: 'http://example.com/folder',
        });

        expect(result.success).toEqual(false);
        expect(result.error?.issues).toContainEqual(
          expect.objectContaining({
            path: ['SftpFolder'],
            message: 'errorFolderCannotBeUrl',
          })
        );
      });

      it('should accept valid S3Folder without URL', () => {
        const result = dataExportSchema.safeParse({
          Frequency: DataExportFrequency.Daily,
          StartDate: futureStartDate,
          StorageType: DataExportStorageType.AmazonS3,
          BucketName: 'test',
          S3Folder: 'my-folder/subfolder',
          AccessKey: 'test',
          SecretAccessKey: 'test',
        });

        expect(result.success).toEqual(true);
      });

      it('should accept valid SPFolder without URL', () => {
        const result = dataExportSchema.safeParse({
          Frequency: DataExportFrequency.Daily,
          StartDate: futureStartDate,
          StorageType: DataExportStorageType.MsSharePoint,
          EntraSecretValue: 'test',
          EntraTenantId: 'test',
          EntraClientId: 'test',
          SharePointSiteId: 'test',
          SharePointDriveId: 'test',
          SPFolder: 'my-folder/subfolder',
        });

        expect(result.success).toEqual(true);
      });

      it('should accept valid SftpFolder without URL', () => {
        const result = dataExportSchema.safeParse({
          Frequency: DataExportFrequency.Daily,
          StartDate: futureStartDate,
          StorageType: DataExportStorageType.Sftp,
          Hostname: 'test',
          Port: 22,
          Username: 'test',
          Password: 'test',
          SftpFolder: 'my-folder/subfolder',
        });

        expect(result.success).toEqual(true);
      });
    });

    describe('leading/trailing slash validation', () => {
      it('should reject S3Folder with leading slash', () => {
        const result = dataExportSchema.safeParse({
          Frequency: DataExportFrequency.Daily,
          StartDate: futureStartDate,
          StorageType: DataExportStorageType.AmazonS3,
          BucketName: 'test',
          S3Folder: '/my-folder',
          AccessKey: 'test',
          SecretAccessKey: 'test',
        });

        expect(result.success).toEqual(false);
        expect(result.error?.issues).toContainEqual(
          expect.objectContaining({
            path: ['S3Folder'],
            message: 'errorFolderNoLeadingTrailingSlash',
          })
        );
      });

      it('should reject S3Folder with trailing slash', () => {
        const result = dataExportSchema.safeParse({
          Frequency: DataExportFrequency.Daily,
          StartDate: futureStartDate,
          StorageType: DataExportStorageType.AmazonS3,
          BucketName: 'test',
          S3Folder: 'my-folder/',
          AccessKey: 'test',
          SecretAccessKey: 'test',
        });

        expect(result.success).toEqual(false);
        expect(result.error?.issues).toContainEqual(
          expect.objectContaining({
            path: ['S3Folder'],
            message: 'errorFolderNoLeadingTrailingSlash',
          })
        );
      });

      it('should reject SPFolder with leading slash', () => {
        const result = dataExportSchema.safeParse({
          Frequency: DataExportFrequency.Daily,
          StartDate: futureStartDate,
          StorageType: DataExportStorageType.MsSharePoint,
          EntraSecretValue: 'test',
          EntraTenantId: 'test',
          EntraClientId: 'test',
          SharePointSiteId: 'test',
          SharePointDriveId: 'test',
          SPFolder: '/my-folder',
        });

        expect(result.success).toEqual(false);
        expect(result.error?.issues).toContainEqual(
          expect.objectContaining({
            path: ['SPFolder'],
            message: 'errorFolderNoLeadingTrailingSlash',
          })
        );
      });

      it('should reject SPFolder with trailing slash', () => {
        const result = dataExportSchema.safeParse({
          Frequency: DataExportFrequency.Daily,
          StartDate: futureStartDate,
          StorageType: DataExportStorageType.MsSharePoint,
          EntraSecretValue: 'test',
          EntraTenantId: 'test',
          EntraClientId: 'test',
          SharePointSiteId: 'test',
          SharePointDriveId: 'test',
          SPFolder: 'my-folder/',
        });

        expect(result.success).toEqual(false);
        expect(result.error?.issues).toContainEqual(
          expect.objectContaining({
            path: ['SPFolder'],
            message: 'errorFolderNoLeadingTrailingSlash',
          })
        );
      });

      it('should reject SftpFolder with leading slash', () => {
        const result = dataExportSchema.safeParse({
          Frequency: DataExportFrequency.Daily,
          StartDate: futureStartDate,
          StorageType: DataExportStorageType.Sftp,
          Hostname: 'test',
          Port: 22,
          Username: 'test',
          Password: 'test',
          SftpFolder: '/my-folder',
        });

        expect(result.success).toEqual(false);
        expect(result.error?.issues).toContainEqual(
          expect.objectContaining({
            path: ['SftpFolder'],
            message: 'errorFolderNoLeadingTrailingSlash',
          })
        );
      });

      it('should reject SftpFolder with trailing slash', () => {
        const result = dataExportSchema.safeParse({
          Frequency: DataExportFrequency.Daily,
          StartDate: futureStartDate,
          StorageType: DataExportStorageType.Sftp,
          Hostname: 'test',
          Port: 22,
          Username: 'test',
          Password: 'test',
          SftpFolder: 'my-folder/',
        });

        expect(result.success).toEqual(false);
        expect(result.error?.issues).toContainEqual(
          expect.objectContaining({
            path: ['SftpFolder'],
            message: 'errorFolderNoLeadingTrailingSlash',
          })
        );
      });

      it('should accept S3Folder without leading or trailing slashes', () => {
        const result = dataExportSchema.safeParse({
          Frequency: DataExportFrequency.Daily,
          StartDate: futureStartDate,
          StorageType: DataExportStorageType.AmazonS3,
          BucketName: 'test',
          S3Folder: 'my-folder/subfolder',
          AccessKey: 'test',
          SecretAccessKey: 'test',
        });

        expect(result.success).toEqual(true);
      });

      it('should accept SPFolder without leading or trailing slashes', () => {
        const result = dataExportSchema.safeParse({
          Frequency: DataExportFrequency.Daily,
          StartDate: futureStartDate,
          StorageType: DataExportStorageType.MsSharePoint,
          EntraSecretValue: 'test',
          EntraTenantId: 'test',
          EntraClientId: 'test',
          SharePointSiteId: 'test',
          SharePointDriveId: 'test',
          SPFolder: 'my-folder/subfolder',
        });

        expect(result.success).toEqual(true);
      });

      it('should accept SftpFolder without leading or trailing slashes', () => {
        const result = dataExportSchema.safeParse({
          Frequency: DataExportFrequency.Daily,
          StartDate: futureStartDate,
          StorageType: DataExportStorageType.Sftp,
          Hostname: 'test',
          Port: 22,
          Username: 'test',
          Password: 'test',
          SftpFolder: 'my-folder/subfolder',
        });

        expect(result.success).toEqual(true);
      });

      it('should accept empty folder paths', () => {
        const s3Result = dataExportSchema.safeParse({
          Frequency: DataExportFrequency.Daily,
          StartDate: futureStartDate,
          StorageType: DataExportStorageType.AmazonS3,
          BucketName: 'test',
          S3Folder: null,
          AccessKey: 'test',
          SecretAccessKey: 'test',
        });

        const spResult = dataExportSchema.safeParse({
          Frequency: DataExportFrequency.Daily,
          StartDate: futureStartDate,
          StorageType: DataExportStorageType.MsSharePoint,
          EntraSecretValue: 'test',
          EntraTenantId: 'test',
          EntraClientId: 'test',
          SharePointSiteId: 'test',
          SharePointDriveId: 'test',
          SPFolder: null,
        });

        const sftpResult = dataExportSchema.safeParse({
          Frequency: DataExportFrequency.Daily,
          StartDate: futureStartDate,
          StorageType: DataExportStorageType.Sftp,
          Hostname: 'test',
          Port: 22,
          Username: 'test',
          Password: 'test',
          SftpFolder: null,
        });

        expect(s3Result.success).toEqual(true);
        expect(spResult.success).toEqual(true);
        expect(sftpResult.success).toEqual(true);
      });
    });

    describe('date interval validation for weekly and monthly schedules', () => {
      it('should reject weekly schedule when date range is less than 7 days', () => {
        const result = dataExportSchema.safeParse({
          Frequency: DataExportFrequency.Weekly,
          StartDate: '2099-01-01',
          EndDate: '2099-01-06',
          StorageType: DataExportStorageType.AmazonS3,
          BucketName: 'test',
          AccessKey: 'test',
          SecretAccessKey: 'test',
        });

        expect(result.success).toEqual(false);
        expect(result.error!.issues).toContainEqual(
          expect.objectContaining({
            path: ['EndDate'],
            message: 'errorWeeklyScheduleTooShort',
          })
        );
      });

      it('should accept weekly schedule when date range is 7 days or more', () => {
        const result = dataExportSchema.safeParse({
          Frequency: DataExportFrequency.Weekly,
          StartDate: '2099-01-01',
          EndDate: '2099-01-08',
          StorageType: DataExportStorageType.AmazonS3,
          BucketName: 'test',
          AccessKey: 'test',
          SecretAccessKey: 'test',
        });

        expect(result.success).toEqual(true);
      });

      it('should reject monthly schedule when start and end are in the same month', () => {
        // Both dates in January 2099
        const result = dataExportSchema.safeParse({
          Frequency: DataExportFrequency.Monthly,
          StartDate: '2099-01-15',
          EndDate: '2099-01-20',
          StorageType: DataExportStorageType.AmazonS3,
          BucketName: 'test',
          AccessKey: 'test',
          SecretAccessKey: 'test',
        });

        expect(result.success).toEqual(false);
        expect(result.error!.issues).toContainEqual(
          expect.objectContaining({
            path: ['EndDate'],
            message: 'errorMonthlyScheduleSameMonth',
          })
        );
      });

      it('should accept monthly schedule when end date is in a different month', () => {
        // Start in Jan 2099, end in Feb 2099
        const result = dataExportSchema.safeParse({
          Frequency: DataExportFrequency.Monthly,
          StartDate: '2099-01-15',
          EndDate: '2099-02-15',
          StorageType: DataExportStorageType.AmazonS3,
          BucketName: 'test',
          AccessKey: 'test',
          SecretAccessKey: 'test',
        });

        expect(result.success).toEqual(true);
      });

      it('should accept daily schedule regardless of date interval', () => {
        // Daily schedules should not be affected by this validation
        const result = dataExportSchema.safeParse({
          Frequency: DataExportFrequency.Daily,
          StartDate: '2099-01-01',
          EndDate: '2099-01-02',
          StorageType: DataExportStorageType.AmazonS3,
          BucketName: 'test',
          AccessKey: 'test',
          SecretAccessKey: 'test',
        });

        expect(result.success).toEqual(true);
      });

      it('should reject when end date equals start date', () => {
        const result = dataExportSchema.safeParse({
          Frequency: DataExportFrequency.Daily,
          StartDate: '2099-01-15',
          EndDate: '2099-01-15',
          StorageType: DataExportStorageType.AmazonS3,
          BucketName: 'test',
          AccessKey: 'test',
          SecretAccessKey: 'test',
        });

        expect(result.success).toEqual(false);
        expect(result.error?.issues).toContainEqual(
          expect.objectContaining({
            path: ['EndDate'],
            message: 'errorEndDateBeforeStartDate',
          })
        );
      });

      it('should reject start date in the past', () => {
        const result = dataExportSchema.safeParse({
          Frequency: DataExportFrequency.Daily,
          StartDate: '2020-01-01',
          EndDate: '2099-01-01',
          StorageType: DataExportStorageType.AmazonS3,
          BucketName: 'test',
          AccessKey: 'test',
          SecretAccessKey: 'test',
        });

        expect(result.success).toEqual(false);
        expect(result.error?.issues).toContainEqual(
          expect.objectContaining({
            path: ['StartDate'],
            message: 'errorStartDateInPast',
          })
        );
      });

      it('should require start date', () => {
        const result = dataExportSchema.safeParse({
          Frequency: DataExportFrequency.Daily,
          StorageType: DataExportStorageType.AmazonS3,
          BucketName: 'test',
          AccessKey: 'test',
          SecretAccessKey: 'test',
        });

        expect(result.success).toEqual(false);
        expect(result.error!.issues).toContainEqual(
          expect.objectContaining({
            path: ['StartDate'],
          })
        );
      });
    });
  });
});
