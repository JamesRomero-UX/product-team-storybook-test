import { Duration, RemovalPolicy } from 'aws-cdk-lib';

import type { EnvSettings } from '../env';

export const techAdmin: EnvSettings = {
  extAPIResourceRemovalPolicy: RemovalPolicy.DESTROY,
  backupVaultRemovalPolicy: RemovalPolicy.DESTROY,
  loadBalancerDeletionProtection: false,
  n8nDesiredTaskCount: 0,
  addWeeklyBackups: false,
  natGateways: 1,
  databaseRemovalPolicy: RemovalPolicy.SNAPSHOT,
  databaseDeletionProtection: false,
  requestEventDynamoRemovalPolicy: RemovalPolicy.DESTROY,
  websiteSubDomain: 'tech-admin',
  hasuraEcrRepoName: 'hasura/graphql-engine',
  permitEcrRepoName: 'permitio/pdp-v2',
  trpcEcrRepoName: 'risksmart/trpc-api',
  integrationsEcrRepoName: 'risksmart/integrations',
  extAPIEcrRepoName: 'risksmart/external-api',
  mcpEcrRepoName: 'risksmart/mcp',
  tenantDeployerEcrRepoName: 'risksmart/tenant-deployer',
  apiAuthSubDomain: 'tech-admin',
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
  apiDistributionWebAclArn: '',
  thirdPartyPortalWebAclArn: '',
  tenants: [
    {
      hasuraMaxTaskCount: 0,
      hasuraMinTaskCount: 0,
      hasuraDesiredTaskCount: 0,
      albPriority: 1,
      name: 'MultiTenant',
      databaseReaderInstanceCount: 0,
      maxDbCapacity: 5,
      minDbCapacity: 0.5,
      backupRetentionDays: 30,
      containerPort: 8080,
      dbMigration: true,
      databaseEnableProxy: true,
      databaseMasterUsernameOverride: 'hasura_user',
      region: 'eu-west-2',
      customers: ['engineering'],
    },
  ],
};
