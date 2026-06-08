export interface ScheduledDataExportInput {
  ruleName: string;
  scheduleId: string;
  secretArn: string;
  startTimestamp: string;
  endTimestamp?: string;
  manualTrigger?: boolean;
}

export interface SharePointCredentials {
  tenant: string;
  orgKey: string;
  entraSecretValue: string;
  entraTenantId: string;
  entraClientId: string;
  sharePointSiteId: string;
  sharePointDriveId: string;
  sPFolder?: string;
}

export interface SftpCredentials {
  tenant: string;
  orgKey: string;
  hostname: string;
  port: number;
  username: string;
  password: string;
  sftpFolder?: string;
}
