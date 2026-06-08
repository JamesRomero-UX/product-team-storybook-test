export const DataExportStorageType = {
  AmazonS3: 'amazonS3',
  AzureBlobStorage: 'azureBlobStorage',
  MsSharePoint: 'msSharePoint',
  Sftp: 'sftp',
} as const;

export type DataExportStorageType =
  (typeof DataExportStorageType)[keyof typeof DataExportStorageType];
