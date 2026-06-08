import { RetentionDays } from 'aws-cdk-lib/aws-logs';

import { devCloud } from './envSettings/devCloud';
import { local } from './envSettings/local';
import { prod } from './envSettings/prod';
import { staging } from './envSettings/staging';
import { TenantSettings } from './tenantSettings';

export type EnvSettings = {
  /**
   * Stage sub domain
   */
  subdomain?: string;
  /**
   * Which tenants require stacks
   */
  tenantSettings: TenantSettings[];
  /**
   * Add additional event bridge rules for easier testing
   */
  addTestingEventBridgeRules?: boolean;

  /**
   * Prefix used by cdk code within api-stack
   * @returns
   */
  cdkStagePrefix: (stage: string) => string;
  /**
   * Log Retention setting
   */
  logRetention: Lowercase<keyof typeof RetentionDays>;
};

export const getEnvSettings = (stage: string): EnvSettings => {
  switch (stage) {
    case 'dev-cloud':
      return devCloud;
    case 'staging':
      return staging;
    case 'prod':
      return prod;
    default:
      return local;
  }
};
