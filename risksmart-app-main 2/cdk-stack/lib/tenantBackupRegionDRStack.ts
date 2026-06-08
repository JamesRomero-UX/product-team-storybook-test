import type { StackProps } from 'aws-cdk-lib';
import { RemovalPolicy, Stack, Tags } from 'aws-cdk-lib';
import { BackupVault } from 'aws-cdk-lib/aws-backup';
import { type IKey, Key } from 'aws-cdk-lib/aws-kms';
import type { Construct } from 'constructs';

import type { LocalAppProps } from '../bin/cdk-stack';
import type { EnvSettings, TenantSettings } from './env';
import { getEnvSettings } from './env';

/**
 * Disaster recovery resources
 */
export class BackupRegionTenantDRStack extends Stack {
  private envSettings: EnvSettings;

  constructor(
    scope: Construct,
    id: string,
    private props: LocalAppProps,
    stackProps: StackProps,
    private tenant: TenantSettings,
    private kmsKey: IKey
  ) {
    super(scope, id, stackProps);
    this.envSettings = getEnvSettings(props.stage);

    this.createBackupRegionKmsKey();
    this.createBackupVault();

    Tags.of(this).add('customers', this.tenant.customers.join('/'));
  }

  private createBackupRegionKmsKey() {
    // Create a KMS key for the backup region
    new Key(
      this,
      `${this.props.stage}-${this.props.appName}-${this.tenant.name}-Replication-Backup-KMSKey`,
      {
        description: `KMS Key for Ireland backup Vault`,
        enableKeyRotation: true,
        removalPolicy: RemovalPolicy.RETAIN,
      }
    );
  }

  private createBackupVault() {
    new BackupVault(
      this,
      `${this.props.stage}-${this.props.appName}-${this.tenant.name}-replication-BackupVault`,
      {
        backupVaultName: this.props.riskSmartRegionProps.isRiskSmartRegion
          ? `${this.props.riskSmartRegionProps.regionStackNamePrefix}${this.props.stage}-${this.props.appName}-${this.tenant.name}-replication-BackupVault`
          : `${this.props.stage}-${this.props.appName}-${this.tenant.name}-replication-BackupVault`,
        encryptionKey: this.kmsKey,
        removalPolicy: this.envSettings.backupVaultRemovalPolicy,
      }
    );
  }
}
