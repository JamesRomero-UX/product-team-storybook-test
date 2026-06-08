import type { StackProps } from 'aws-cdk-lib';
import { Duration, Stack, Tags } from 'aws-cdk-lib';
import {
  BackupPlan,
  BackupPlanRule,
  BackupResource,
  BackupVault,
} from 'aws-cdk-lib/aws-backup';
import { Schedule } from 'aws-cdk-lib/aws-events';
import type { IKey } from 'aws-cdk-lib/aws-kms';
import type { IDatabaseCluster } from 'aws-cdk-lib/aws-rds';
import type { Construct } from 'constructs';

import type { LocalAppProps } from '../bin/cdk-stack';
import type { EnvSettings, TenantSettings } from './env';
import { getEnvSettings } from './env';

interface TenantDRStackProps {
  kmsKey: IKey;
  databaseCluster: IDatabaseCluster;
}

/**
 * Disaster recovery resources
 */
export class TenantDRStack extends Stack {
  private envSettings: EnvSettings;

  constructor(
    scope: Construct,
    id: string,
    private props: LocalAppProps,
    stackProps: StackProps,
    private tenant: TenantSettings,
    private tenantDRStackProps: TenantDRStackProps
  ) {
    super(scope, id, stackProps);
    this.envSettings = getEnvSettings(props.stage);

    this.createBackupPlan();

    Tags.of(this).add('customers', this.tenant.customers.join('/'));
  }

  private createBackupPlan() {
    const backupVault = new BackupVault(
      this,
      `${this.props.stage}-${this.props.appName}-${this.tenant.name}-BackupVault`,
      {
        backupVaultName: this.props.riskSmartRegionProps.isRiskSmartRegion
          ? `${this.props.riskSmartRegionProps.regionStackNamePrefix}${this.props.stage}-${this.props.appName}-${this.tenant.name}`
          : `${this.props.stage}-${this.props.appName}-${this.tenant.name}-BackupVault`,
        encryptionKey: this.tenantDRStackProps.kmsKey,
        removalPolicy: this.envSettings.backupVaultRemovalPolicy,
      }
    );

    const plan = new BackupPlan(
      this,
      `${this.props.stage}-${this.props.appName}-${this.tenant.name}-BackupVault-BackupPlan`
    );

    if (this.props.stage === 'app') {
      // Only do this for prod, or dev + stagings vaults will end up in the DR account too
      const irelandReplicationVault = BackupVault.fromBackupVaultArn(
        this,
        'DestinationVault',
        `arn:aws:backup:eu-west-1:134258997950:backup-vault:${this.tenant.name}-dr-backup-vault`
      );

      plan.addRule(
        new BackupPlanRule({
          ruleName: 'DailyBackupCrossRegionDRAccount',
          scheduleExpression: Schedule.cron({ minute: '0', hour: '0' }), // Midnight UTC
          deleteAfter: Duration.days(30),
          copyActions: [
            {
              destinationBackupVault: irelandReplicationVault,
              deleteAfter: Duration.days(30),
            },
          ],
        })
      );

      if (this.envSettings.addWeeklyBackups) {
        // Custom weekly rule with DR copy action, default weekly rule does not support copy action
        // Weekly backup cancelled daily backup for that day, so no copy action would occur for DR
        plan.addRule(
          new BackupPlanRule({
            ruleName: 'WeeklyBackupWithDRCopy',
            backupVault: backupVault,
            scheduleExpression: Schedule.cron({
              minute: '0',
              hour: '2', // 02:00 UTC Saturday
              weekDay: 'SAT',
            }),
            deleteAfter: Duration.days(90),
            copyActions: [
              {
                destinationBackupVault: irelandReplicationVault,
                deleteAfter: Duration.days(90), // Match local retention
              },
            ],
          })
        );
      }

      // Monthly 5-year backup with DR copy for long-term compliance/audit retention
      plan.addRule(
        new BackupPlanRule({
          ruleName: 'Monthly5YearWithDRCopy',
          backupVault: backupVault,
          scheduleExpression: Schedule.cron({
            minute: '0',
            hour: '4', // 04:00 UTC on 1st
            day: '1',
          }),
          deleteAfter: Duration.days(1825), // 5 years
          moveToColdStorageAfter: Duration.days(90),
          copyActions: [
            {
              destinationBackupVault: irelandReplicationVault,
              deleteAfter: Duration.days(1825),
              moveToColdStorageAfter: Duration.days(90),
            },
          ],
        })
      );
    } else {
      // Non-prod: monthly backups only, no DR copy
      plan.addRule(BackupPlanRule.monthly5Year(backupVault));
    }

    if (!this.tenantDRStackProps.databaseCluster) {
      throw new Error(`Missing databaseCluster for tenant ${this.tenant.name}`);
    }

    plan.addSelection(
      `${this.props.stage}-${this.props.appName}-${this.tenant.name}-BackupVault-BackupSelection`,
      {
        resources: [
          BackupResource.fromRdsDatabaseCluster(
            this.tenantDRStackProps.databaseCluster
          ),
        ],
      }
    );
  }
}
