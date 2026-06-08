import type { RemovalPolicy } from 'aws-cdk-lib';

import { devCloud } from './envSettings/devCloud';
import { prod } from './envSettings/prod';
import { staging } from './envSettings/staging';
import { techAdmin } from './envSettings/techAdmin';

// Change 'app' to prod in future (would need to prefix resources with app- to stop them being replaced)
export type RisksmartStage = 'tech-admin' | 'dev-cloud' | 'staging' | 'app';

export interface TenantSettings {
  region: string;
  name: string;
  riskSmartRegionID?: 'US-1' | 'UK-1' | 'EU-1' | 'UAE-1' | 'CA-1';
}

export interface EnvSettings {
  requestEventDynamoRemovalPolicy: RemovalPolicy;
}

export const getEnvSettings = (
  stage: RisksmartStage,
  isLocal: boolean
): EnvSettings => {
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
      if (isLocal) {
        return techAdmin;
      }
      // eslint-disable-next-line @typescript-eslint/restrict-template-expressions
      throw new Error(`Unsupported stage ${stage}`);
  }
};
