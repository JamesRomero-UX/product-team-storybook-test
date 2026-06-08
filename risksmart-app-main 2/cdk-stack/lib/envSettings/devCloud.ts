import { Duration, RemovalPolicy } from 'aws-cdk-lib';

import type { EnvSettings } from '../env';

export const devCloud: EnvSettings = {
  extAPIResourceRemovalPolicy: RemovalPolicy.DESTROY,
  backupVaultRemovalPolicy: RemovalPolicy.RETAIN,
  loadBalancerDeletionProtection: true,
  addWeeklyBackups: false,
  natGateways: 1,
  databaseRemovalPolicy: RemovalPolicy.SNAPSHOT,
  databaseDeletionProtection: false,
  requestEventDynamoRemovalPolicy: RemovalPolicy.DESTROY,
  websiteSubDomain: 'dev-cloud',
  hasuraEcrRepoName: 'hasura/graphql-engine',
  permitEcrRepoName: 'permitio/pdp-v2',
  trpcEcrRepoName: 'risksmart/trpc-api',
  integrationsEcrRepoName: 'risksmart/integrations',
  extAPIEcrRepoName: 'risksmart/external-api',
  mcpEcrRepoName: 'risksmart/mcp',
  tenantDeployerEcrRepoName: 'risksmart/tenant-deployer',
  apiAuthSubDomain: 'dev-cloud',
  hasuraHealthCheck: {
    // Increasing health check timeout for dev, so we don't need to increase specs, but can deploy hasura without the container being killed
    timeout: Duration.seconds(30),
  },
  hasuraContainerSettings: {
    cpu: 2048,
    memoryLimitMiB: 4096,
  },
  hasuraTaskSettings: {
    cpu: 2048,
    memoryLimitMiB: 4096,
  },
  isInternalAlbEnabled: true,
  mcpDesiredTaskCount: 1,
  apiDistributionWebAclArn:
    'arn:aws:wafv2:us-east-1:640196420962:global/webacl/' +
    'dev-cloud-us-east-1-api-waf/6e895296-74d7-497a-97d8-65c9a67a5039',
  thirdPartyPortalWebAclArn:
    'arn:aws:wafv2:us-east-1:640196420962:global/webacl/' +
    'dev-cloud-us-east-1-tpp-waf/0e85590c-a8dc-4455-9149-e8dbe09ef315',
  tenants: [
    {
      albPriority: 1,
      name: 'MultiTenant',
      databaseReaderInstanceCount: 0,
      maxDbCapacity: 5,
      minDbCapacity: 0.5,
      backupRetentionDays: 30,
      containerPort: 8080,
      dbMigration: true,
      snapshotId: 'multi-tenant-snapshot-v1',
      databaseEnableProxy: true,
      databaseMasterUsernameOverride: 'hasura_user',
      enableAdvancedDatabaseInsights: false,
      region: 'eu-west-2',
      customers: ['engineering'],
    },
    {
      albPriority: 2,
      name: 'OctoEnergy',
      databaseReaderInstanceCount: 0,
      maxDbCapacity: 5,
      minDbCapacity: 0.5,
      backupRetentionDays: 30,
      containerPort: 8080,
      dbMigration: false,
      region: 'eu-west-2',
      customers: ['engineering'],
    },
  ],
};
