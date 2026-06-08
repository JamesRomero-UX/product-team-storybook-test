import type { RemovalPolicy } from 'aws-cdk-lib';
import type {
  ContainerDefinitionOptions,
  FargateTaskDefinitionProps,
  HealthCheck,
} from 'aws-cdk-lib/aws-ecs';

import { devCloud } from './envSettings/devCloud';
import { prod } from './envSettings/prod';
import { staging } from './envSettings/staging';
import { techAdmin } from './envSettings/techAdmin';

// Change 'app' to prod in future (would need to prefix resources with app- to stop them being replaced)
export type RisksmartStage = 'tech-admin' | 'dev-cloud' | 'staging' | 'app';

export interface TenantSettings {
  /**
   * Defaults to 1 if not specified
   */
  hasuraDesiredTaskCount?: number;
  /**
   * Defaults to 1 if not specified
   */
  hasuraMinTaskCount?: number;
  /**
   * Defaults to 5 if not specified
   */
  hasuraMaxTaskCount?: number;

  // region defaults to 'eu-west-2' if not specified
  region: string;

  albPriority: number;
  name: string;
  /**
   * Set to override the default username logic that is based on the tenant name
   */
  databaseMasterUsernameOverride?: string;
  databaseReaderInstanceCount: number;
  backupRetentionDays: number;
  maxDbCapacity: number;
  minDbCapacity: number;
  containerPort: number;
  dbMigration: boolean;
  snapshotId?: string;
  riskSmartRegionID?: 'US-1' | 'UK-1' | 'EU-1' | 'UAE-1' | 'CA-1';
  /**
   * Rather expensive, so enabling per tenant as required.
   * Required for Custom Data sources
   */
  databaseEnableProxy?: boolean;

  /**
   * Flag to enable advanced database insights for this tenant.
   */
  enableAdvancedDatabaseInsights?: boolean;

  /**
   * List of customer names that belong to this tenant
   */
  customers: string[];
}

export interface EnvSettings {
  extAPIResourceRemovalPolicy: RemovalPolicy;
  backupVaultRemovalPolicy: RemovalPolicy;
  loadBalancerDeletionProtection: boolean;
  addWeeklyBackups: boolean;
  natGateways: number;
  databaseRemovalPolicy: RemovalPolicy;
  databaseDeletionProtection: boolean;
  requestEventDynamoRemovalPolicy: RemovalPolicy;
  websiteSubDomain: string;
  apiAuthSubDomain: string;
  hasuraEcrRepoName: string;
  permitEcrRepoName: string;
  trpcEcrRepoName: string;
  integrationsEcrRepoName: string;
  tenantDeployerEcrRepoName: string;
  extAPIEcrRepoName: string;
  mcpEcrRepoName: string;
  hasuraHealthCheck?: Partial<HealthCheck>;
  hasuraContainerSettings?: Partial<ContainerDefinitionOptions>;
  hasuraTaskSettings?: Partial<FargateTaskDefinitionProps>;
  tenants: TenantSettings[];
  apiDistributionWebAclArn?: string;
  thirdPartyPortalWebAclArn?: string;

  /**
   * Defaults to 1 if not specified
   */
  n8nDesiredTaskCount?: number;
  /**
   * Defaults to 1 if not specified
   */
  permitDesiredTaskCount?: number;
  /**
   * Defaults to 1 if not specified
   */
  trpcDesiredTaskCount?: number;
  /**
   * Defaults to 1 if not specified
   */
  extAPIDesiredTaskCount?: number;
  /**
   * Defaults to 1 if not specified
   */
  mcpDesiredTaskCount?: number;
  /**
   * Routing Lambda traffic to Permit service
   */
  isInternalAlbEnabled?: boolean;
}

export const getEnvSettings = (stage: RisksmartStage): EnvSettings => {
  switch (stage) {
    case 'tech-admin':
      return techAdmin;
    case 'dev-cloud':
      return devCloud;
    case 'staging':
      return staging;
    case 'app':
      return prod;
    default:
      // eslint-disable-next-line @typescript-eslint/restrict-template-expressions
      throw new Error(`Unsupported stage ${stage}`);
  }
};
