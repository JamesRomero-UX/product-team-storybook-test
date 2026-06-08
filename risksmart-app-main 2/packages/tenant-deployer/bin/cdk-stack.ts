#!/usr/bin/env node
import 'source-map-support/register';

import * as cdk from 'aws-cdk-lib';
import dotenv from 'dotenv';

import { AiFeedbackStack } from '../lib/aiFeedbackStack';
import type { RisksmartStage } from '../lib/env';
import { TenantEventStack } from '../lib/tenantEventStack';
import { getEnvVariable } from './env';

dotenv.config();
const app = new cdk.App();

// ----------------
// Will supersede the LocalAppProps interface when full migrated to RiskSmartRegions
export interface RiskSmartRegionProps {
  isRiskSmartRegion: boolean;
  id: string;
  regionDomainPrefix: string;
  regionStackNamePrefix: string;
  vpc: {
    id: string;
    privateSubnetIds: string[];
    publicSubnetIds: string[];
    isolatedSubnetIds: string[];
    vpcCidrBlock: string;
    availabilityZones: string[];
  };
}

const isRiskSmartRegion =
  'true' === getEnvVariable('RISKSMART_REGION', 'false');

// if (riskSmartRegion === 'true') then set id to riskSmartRegionId
const riskSmartRegionProps: RiskSmartRegionProps = {
  isRiskSmartRegion: isRiskSmartRegion,
  id: isRiskSmartRegion ? getEnvVariable('RISKSMART_REGION_ID', undefined) : '',
  regionDomainPrefix: isRiskSmartRegion
    ? `${getEnvVariable('RISKSMART_REGION_PREFIX', undefined)}.`
    : '',
  regionStackNamePrefix: isRiskSmartRegion
    ? `${getEnvVariable('RISKSMART_REGION_ID', undefined)}-`
    : '',
  vpc: {
    id: getEnvVariable('VPC_ID', ''),
    privateSubnetIds: getEnvVariable('PRIVATE_SUBNET_IDS', '')
      .split(',')
      .filter(Boolean),
    publicSubnetIds: getEnvVariable('PUBLIC_SUBNET_IDS', '')
      .split(',')
      .filter(Boolean),
    isolatedSubnetIds: getEnvVariable('ISOLATED_SUBNET_IDS', '')
      .split(',')
      .filter(Boolean),
    vpcCidrBlock: getEnvVariable('VPC_CIDR_BLOCK', ''),
    availabilityZones: getEnvVariable('AVAILABILITY_ZONES', '')
      .split(',')
      .filter(Boolean),
  },
};

// ----------------
// Leave non-risksmart region APP_NAME as is
let appName = getEnvVariable('APP_NAME', 'risksmartApp');
if (riskSmartRegionProps.isRiskSmartRegion) {
  //
  appName = getEnvVariable('APP_NAME_FOR_RS_REGION');
}
const tenantName = getEnvVariable('TENANT_NAME');
const stage = getEnvVariable('STAGE') as RisksmartStage;
const isLocal = getEnvVariable('IS_LOCAL') === 'true';
const region = getEnvVariable('AWS_REGION');
const account = getEnvVariable('AWS_ACCOUNT_ID');

const sentryRelease = getEnvVariable('SENTRY_RELEASE', '');

const stackProps: cdk.StackProps = {
  env: {
    account: account,
    region: region,
  },
  crossRegionReferences: false,
};
new TenantEventStack(
  app,
  `${riskSmartRegionProps.regionStackNamePrefix}${stage}-${appName}-${tenantName}-TenantEventStack`,
  stage,
  appName,
  tenantName,
  stackProps,
  riskSmartRegionProps,
  {
    sentryRelease,
  },
  isLocal
);

// AI Feedback Stack - Firehose + S3 for feedback data
const glueDatabaseName = getEnvVariable(
  'AI_FEEDBACK_GLUE_DATABASE',
  `${stage}-ai-feedback`
);
const glueTableName = getEnvVariable(
  'AI_FEEDBACK_GLUE_TABLE',
  'feedback_records'
);

new AiFeedbackStack(
  app,
  `${riskSmartRegionProps.regionStackNamePrefix}${stage}-${appName}-${tenantName}-AiFeedbackStack`,
  stage,
  appName,
  tenantName,
  stackProps,
  riskSmartRegionProps,
  {
    glueDatabaseName,
    glueTableName,
  },
  isLocal
);

app.synth();

export default app;
