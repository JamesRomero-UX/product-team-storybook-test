#!/usr/bin/env node
import 'source-map-support/register';

import * as cdk from 'aws-cdk-lib';
import dotenv from 'dotenv';

import { AiFeedbackIngestionStack } from '../lib/aiFeedbackIngestionStack';
import type { CertificatesStackProps } from '../lib/certificatesStack';
import { CertificatesStack } from '../lib/certificatesStack';
import type { CertificatesTenantStackProps } from '../lib/certificateTenantStack';
import { CertificateTenantStack } from '../lib/certificateTenantStack';
import { CustomAppDomainStack } from '../lib/customAppDomainStack';
import { DataLayerStack } from '../lib/dataLayerStack';
import { DomainIntegrationStack } from '../lib/domainIntegrationStack';
import type { DomainStackProps } from '../lib/domainsStack';
import { DomainStack } from '../lib/domainsStack';
import { DomainTenantStack } from '../lib/domainTenantStack';
import { type RisksmartStage } from '../lib/env';
import { EventStack } from '../lib/eventStack';
import { GlobalTenantConfigFunctionsStack } from '../lib/globalTenantConfigFunctionsStack';
import { GlobalTenantConfigStack } from '../lib/globalTenantConfigStack';
import { ParametersStack } from '../lib/parametersStack';
import { PermissionsStack } from '../lib/permissionsStack';
import { RequestStateApiStack } from '../lib/requestStateApiStack';
import { RulebookIngestionStack } from '../lib/rulebookIngestionStack';
import { TenantDBStack } from '../lib/tenantDBStack';
import { TenantDeployerStack } from '../lib/tenantDeployerStack';
import { TenantDRStack } from '../lib/tenantDRStack';
import { TenantHasuraStack } from '../lib/tenantHasuraStack';
import type {
  ExternalAPIConfig,
  MCPConfig,
  TenantStackProps,
  TRPCConfig,
} from '../lib/tenantStack';
import { TenantStack } from '../lib/tenantStack';
import { ThirdPartyPortal } from '../lib/thirdPartyPortalStack';
import type { WebStackProps } from '../lib/webStack';
import { WebStack } from '../lib/webStack';
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
  awsRegion: string;
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
  awsRegion: getEnvVariable('AWS_REGION', undefined),
};

// ----------------
// Leave non-risksmart region APP_NAME as is
let appName = getEnvVariable('APP_NAME', 'risksmartApp');
if (riskSmartRegionProps.isRiskSmartRegion) {
  //
  appName = getEnvVariable('APP_NAME_FOR_RS_REGION');
}
const tppAppName = getEnvVariable('TPP_APP_NAME');
const stage = getEnvVariable('STAGE') as RisksmartStage;
const region = getEnvVariable('AWS_REGION') ?? 'eu-west-2';
export const getGlobalTenantConfigTableName = (stage: string) =>
  `${stage}-risksmartApp-GlobalTenantConfig`;
const account = getEnvVariable('AWS_ACCOUNT_ID');
export const getGlobalTenantConfigTableArn = (
  stage: string,
  region: string
) => {
  return `arn:aws:dynamodb:${region}:${account}:table/${getGlobalTenantConfigTableName(stage)}`;
};

const baseDomain = getEnvVariable('BASE_DOMAIN');
const jwtSecret = getEnvVariable('HASURA_JWT_SECRET');
const hasuraEnableConsole = getEnvVariable(
  'HASURA_GRAPHQL_ENABLE_CONSOLE',
  'true'
);
const hasuraPgConnections = getEnvVariable(
  'HASURA_GRAPHQL_PG_CONNECTIONS',
  '100'
);
const hasuraLogLevel = getEnvVariable('HASURA_GRAPHQL_LOG_LEVEL', 'debug');
const vpnEnabled = getEnvVariable('VPN_ENABLED', 'false');
const trpcContainerBuild = getEnvVariable('TRPC_CONTAINER_BUILD');
const tenantDeployerContainerBuild = getEnvVariable(
  'TENANT_DEPLOYER_CONTAINER_BUILD'
);
const sentryRelease = getEnvVariable('SENTRY_RELEASE');

const localTenantConfigTable = getEnvVariable('TENANT_CONFIG_TABLE', '-');
const localDatabaseConnectionString = getEnvVariable(
  'LOCAL_DATABASE_CONNECTION_STRING',
  '-'
);
const localDynamodbEndpoint = getEnvVariable('DYNAMODB_ENDPOINT', '-');
const localPdpEndpoint = getEnvVariable('PDP_ENDPOINT', '-');
const localPermitApiUrl = getEnvVariable('PERMIT_API_URL', '-');
const localPdpApiKey = getEnvVariable('LOCAL_PDP_API_KEY', '-');
const localS3Endpoint = getEnvVariable('S3_ENDPOINT', '-');

const extAPIContainerBuild = getEnvVariable('EXTAPI_CONTAINER_BUILD');
const mcpContainerBuild = getEnvVariable('MCP_CONTAINER_BUILD', '-');
const mcpAuth0Domain = getEnvVariable('MCP_AUTH0_DOMAIN', '-');
const mcpAuth0ApiAudience = getEnvVariable('MCP_AUTH0_API_AUDIENCE', '-');
// Required - semver tag of the integrations Docker image in ECR (e.g., "1.0.0")
const _integrationsContainerBuild = getEnvVariable(
  'INTEGRATIONS_CONTAINER_BUILD'
);
// non secret ext-api stack config.
const extAPIStackConfig = JSON.parse(getEnvVariable('EXTAPI_STACK_CONFIG')) as {
  client_table_arn: string;
  client_table_name: string;
  rate_limit_table_name: string;
  rate_limit_table_arn: string;
  jwt_config: { alg: string; jwk_url: string; provider: string };
  token_url: string;
  user_pool_id: string;
  jwt_providers: { alg: string; jwkUri: string; issuer: string }[];
};

//datadog agent public key.
const datadogPublicKey = getEnvVariable('PUBLIC_API_DATADOG_KEY', '-');

// adds additional jwt verifier for ext-api to trpc existing auth0 key.
const { jwk_url, alg } = extAPIStackConfig.jwt_config;
const issuerOrigin = new URL(jwk_url).origin;
let jwtSecretVerifyOptions: string = jwtSecret;

if (issuerOrigin.indexOf('cognito-idp') !== -1) {
  const extApiJwtIssuerUrl = `${new URL(jwk_url).origin}/${extAPIStackConfig.user_pool_id}`;
  jwtSecretVerifyOptions = JSON.stringify({
    ...JSON.parse(jwtSecret),
    issuers: { [extApiJwtIssuerUrl]: { type: alg, jwk_url } },
  });
}

const stackProps: cdk.StackProps = {
  env: {
    account: account,
    region: region,
  },
  crossRegionReferences: false,
};

const eastUSstackProps: cdk.StackProps = {
  env: {
    account: account,
    region: 'us-east-1',
  },
  crossRegionReferences: true,
};

export interface LocalAppProps {
  appName: string;
  stage: RisksmartStage;
  baseDomain?: string;
  publicBaseDomain?: string;
  riskSmartRegionProps: RiskSmartRegionProps;
}

const appProps: LocalAppProps = {
  appName: appName,
  stage: stage,
  baseDomain: account + '.' + baseDomain,
  publicBaseDomain: baseDomain,
  riskSmartRegionProps: riskSmartRegionProps,
};

const parameter = new ParametersStack(
  app,
  `${appProps.riskSmartRegionProps.regionStackNamePrefix}${stage}-${appName}-ParameterStack`,
  appProps,
  stackProps
);

const webProps: DomainStackProps = {
  appName: appProps.appName,
  stage: appProps.stage,
  prefixKey: 'webapp',
  baseDomain: appProps.baseDomain,
  publicBaseDomain: appProps.publicBaseDomain,
  riskSmartRegionProps: riskSmartRegionProps,
};

const webappDomains = new DomainStack(
  app,
  `${appProps.riskSmartRegionProps.regionStackNamePrefix}${stage}-${appName}-webapp-CDKDomainStack`,
  stackProps,
  webProps
);

const externalDomains = new CustomAppDomainStack(
  app,
  `${appProps.riskSmartRegionProps.regionStackNamePrefix}${stage}-${appName}-customerv4DNS-CDKDomainStack`,
  stackProps,
  webProps
);

const publicCertificatesProps: CertificatesStackProps = {
  appName: appName,
  stage: stage,
  hostedZoneId: externalDomains.domainsOutputs.hostedZoneId,
  hostedZoneName: externalDomains.domainsOutputs.hostedZoneName,
  hostname: externalDomains.domainsOutputs.hostname,
  prefixKey: 'public',
  riskSmartRegionProps: riskSmartRegionProps,
};

const publicCerts = new CertificatesStack(
  app,
  `${appProps.riskSmartRegionProps.regionStackNamePrefix}${stage}-${appName}-publicv4-CDKCertStack`,
  publicCertificatesProps,
  eastUSstackProps
);

const tppPublicCertificatesProps: CertificatesStackProps = {
  appName: tppAppName,
  stage: stage,
  hostedZoneId: externalDomains.domainsOutputs.hostedZoneId,
  hostedZoneName: externalDomains.domainsOutputs.hostedZoneName,
  hostname: `third-party-portal.${externalDomains.domainsOutputs.hostname}`,
  prefixKey: 'public',
  lookupByName: true,
  riskSmartRegionProps: riskSmartRegionProps,
};

const tppPublicCerts = new CertificatesStack(
  app,
  `${appProps.riskSmartRegionProps.regionStackNamePrefix}${stage}-${tppAppName}-publicv4-CDKCertStack`,
  tppPublicCertificatesProps,
  eastUSstackProps
);
tppPublicCerts.addDependency(externalDomains);

const tppStackProps: WebStackProps = {
  appName: tppAppName,
  stage: stage,
  externalHostedZoneId: externalDomains.domainsOutputs.hostedZoneId,
  externalZoneName: externalDomains.domainsOutputs.hostedZoneName,
  externalHostname: `third-party-portal.${externalDomains.domainsOutputs.hostname}`,
  publicCert: tppPublicCerts.certificates.certificate,
  riskSmartRegionProps: riskSmartRegionProps,
};

new ThirdPartyPortal(
  app,
  `${appProps.riskSmartRegionProps.regionStackNamePrefix}${stage}-${tppAppName}-CDKWebStack`,
  {
    env: {
      account: account,
      region: region,
    },
    crossRegionReferences: true,
  },
  tppStackProps
);

const webappStackProps: WebStackProps = {
  appName: appName,
  stage: stage,
  hostedZoneId: webappDomains.domainsOutputs.hostedZoneId,
  hostedZoneName: webappDomains.domainsOutputs.hostedZoneName,
  hostname: webappDomains.domainsOutputs.hostname,
  externalHostedZoneId: externalDomains.domainsOutputs.hostedZoneId,
  externalZoneName: externalDomains.domainsOutputs.hostedZoneName,
  externalHostname: externalDomains.domainsOutputs.hostname,
  prefixKey: 'webapp',
  publicCert: publicCerts.certificates.certificate,
  riskSmartRegionProps: riskSmartRegionProps,
};

//When setting up a new Environment, comment out the webapp stacks, then add back in after the first deployment.
//This stack is primitive and needs to be rewritten. When you create the public hosted zone first time you will get a pause on the deploy as the root account does not ns records for the new sub domain.
//Make sure to bootstrap the new environment in each region, eu-west-2 and us-east-1
new WebStack(
  app,
  `${appProps.riskSmartRegionProps.regionStackNamePrefix}${stage}-${appName}-CDKWebStack`,
  {
    env: {
      account: account,
      region: region,
    },
    crossRegionReferences: true,
  },
  webappStackProps
);

const stackTenantProps: cdk.StackProps = {
  env: {
    account: account,
    region: region,
  },
  crossRegionReferences: true,
};

const stackTenantUSProps: cdk.StackProps = {
  env: {
    account: account,
    region: 'us-east-1',
  },
  crossRegionReferences: true,
};

const tenantDomainsStack = new DomainTenantStack(
  app,
  `${appProps.riskSmartRegionProps.regionStackNamePrefix}${stage}-${appName}-CDKTenantDomainStack`,
  appProps,
  stackTenantProps
);

const integrationsDomainsStack = new DomainIntegrationStack(
  app,
  `${appProps.riskSmartRegionProps.regionStackNamePrefix}${stage}-${appName}-CDKIntegrationDomainStack`,
  appProps,
  stackTenantProps
);

const tenantCertificatesProps: CertificatesTenantStackProps = {
  hostedZone: tenantDomainsStack.HostedZone,
};

const certificateTenantStack = new CertificateTenantStack(
  app,
  `${appProps.riskSmartRegionProps.regionStackNamePrefix}${stage}-${appName}-CDKCertTenantStack`,
  appProps,
  tenantCertificatesProps,
  stackTenantUSProps
);

const integrationCertificatesProps: CertificatesTenantStackProps = {
  hostedZone: integrationsDomainsStack.HostedZone,
};

const certificateIntegrationStack = new CertificateTenantStack(
  app,
  `${appProps.riskSmartRegionProps.regionStackNamePrefix}${stage}-${appName}-CDKCertIntegrationStack`,
  appProps,
  integrationCertificatesProps,
  stackTenantProps
);

const eventStack = new EventStack(
  app,
  `${appProps.riskSmartRegionProps.regionStackNamePrefix}${stage}-${appName}-CDKEventStack`,
  appProps,
  stackProps
);

const tenantStackProps: TenantStackProps = {
  hasuraAdminSecret: parameter.hasuraAdminSecret,
  restApiDomain: `${riskSmartRegionProps.regionDomainPrefix}rest-api.${stage}.${appProps.publicBaseDomain}`,
  jwtSecret: jwtSecretVerifyOptions,
  hasuraEnableConsole,
  hasuraLogLevel,
  hasuraPgConnections: parseInt(hasuraPgConnections),
  cloudfrontHostedZone: tenantDomainsStack.HostedZone,
  cloudfrontCertificate: certificateTenantStack.defaultCertificate,
  cloudfrontHostName: tenantDomainsStack.Hostname,
  integrationHostedZone: integrationsDomainsStack.HostedZone,
  integrationCertificate: certificateIntegrationStack.defaultCertificate,
  integrationHostName: integrationsDomainsStack.Hostname,
  enableVpn: vpnEnabled === 'true',
  commonEventBus: eventStack.commonEventBus,
};

const trpcConfig: TRPCConfig = {
  name: 'trpc',
  containerPort: 2021,
  albPriority: 7777,
  trpcContainerBuild: trpcContainerBuild,
  sentryDsn: getEnvVariable('TRPC_SENTRY_DSN', ''),
  datadogPublicKey,
  auth0Domain: getEnvVariable('AUTH0_DOMAIN', ''),
  auth0ManagementClientId: getEnvVariable('AUTH0_MANAGEMENT_CLIENT_ID', ''),
  auth0RiskSmartRestApiClientId: getEnvVariable(
    'AUTH0_RISK_SMART_REST_API_CLIENT_ID',
    ''
  ),
  auth0ClientId: getEnvVariable('REACT_APP_AUTH0_CLIENT_ID', ''),
};

const mcpConfig: MCPConfig = {
  name: 'mcp',
  containerPort: 8022,
  albPriority: 6666,
  mcpContainerBuild: mcpContainerBuild,
  auth0Domain: mcpAuth0Domain,
  auth0ApiAudience: mcpAuth0ApiAudience,
  datadogPublicKey,
};

const extAPIConfig: ExternalAPIConfig = {
  name: 'external-api',
  containerPort: 3200,
  albPriority: 8888,
  extAPIContainerBuild: extAPIContainerBuild,
  clientTableArn: extAPIStackConfig.client_table_arn,
  rateLimitTableArn: extAPIStackConfig.rate_limit_table_arn,
  rateLimitTableName: extAPIStackConfig.rate_limit_table_name,
  userPoolId: extAPIStackConfig.user_pool_id,
  authJwtProviders: extAPIStackConfig.jwt_providers || [],
  appDomain: `${appProps.riskSmartRegionProps.regionDomainPrefix}${appProps.stage}-${appProps.appName}-tenant.${appProps.baseDomain}`,
  hasuraDomain: `${appProps.riskSmartRegionProps.regionDomainPrefix}${appProps.stage}-${appProps.appName}-api-tenant.${appProps.baseDomain}`,
  authProviderConfig: JSON.stringify({
    provider: extAPIStackConfig.jwt_config.provider,
    tokenUrl: extAPIStackConfig.token_url,
    userPoolId: extAPIStackConfig.user_pool_id,
    authTableName: extAPIStackConfig.client_table_name,
    clientType:
      extAPIStackConfig.jwt_config.provider === 'mock' ? 'mock' : 'cognito',
  }),
  datadogPublicKey,
};

const tenantStack = new TenantStack(
  app,
  `${appProps.riskSmartRegionProps.regionStackNamePrefix}${stage}-${appName}-CDKTenantStack`,
  appProps,
  stackTenantProps,
  tenantStackProps,
  { trpc: trpcConfig, extAPI: extAPIConfig, mcp: mcpConfig }
);

const globalTenantConfigStack = new GlobalTenantConfigStack(
  app,
  `${appProps.riskSmartRegionProps.regionStackNamePrefix}${stage}-${appName}-CDKGlobalTenantConfigStack`,
  appProps,
  stackTenantProps
);

tenantStack.addDependency(globalTenantConfigStack);

new GlobalTenantConfigFunctionsStack(
  app,
  `${appProps.riskSmartRegionProps.regionStackNamePrefix}${stage}-${appName}-CDKGlobalTenantConfigFunctionsStack`,
  stackTenantProps,
  {
    ...appProps,
    sharedEventBus: eventStack.commonEventBus,
    sentryRelease,
    localDynamodbEndpoint,
    localTenantConfigTable,
    defaultVPC: tenantStack.defaultVPC,
  }
);

new TenantDeployerStack(
  app,
  `${appProps.riskSmartRegionProps.regionStackNamePrefix}${stage}-${appName}-CDKTenantDeployerStack`,
  appProps,
  stackTenantProps,
  {
    escCluster: tenantStack.ecsCluster,
    vpc: tenantStack.defaultVPC,
  },
  {
    tenantDeployerContainerBuild: tenantDeployerContainerBuild,
    sentryRelease,
    datadogPublicKey,
  }
);

// match region here. Tenants should only create the DB and Backups in the same region they are in.
tenantStack.tenants.forEach((tenant) => {
  if (tenant.region === appProps.riskSmartRegionProps.awsRegion) {
    const dbStack = new TenantDBStack(
      app,
      `${appProps.riskSmartRegionProps.regionStackNamePrefix}${stage}-${appName}-${tenant.name}-TenantDBStack`,
      appProps,
      stackTenantProps,
      tenant,
      {
        vpc: tenantStack.defaultVPC,
        trpcDataSg: tenantStack.trpcDataSg,
        dataLayerSg: tenantStack.dataLayerSg,
        vpnSecurityGroup: tenantStack.clientVpnSecurityGroup,
      }
    );

    new TenantHasuraStack(
      app,
      `${appProps.riskSmartRegionProps.regionStackNamePrefix}${stage}-${appName}-${tenant.name}-TenantHasuraStack`,
      appProps,
      stackTenantProps,
      tenant,
      tenantStackProps,
      {
        escCluster: tenantStack.ecsCluster,
        vpc: tenantStack.defaultVPC,
        hasuraEcsSG: tenantStack.hasuraEcsSG,
        hasuraHttpsListener: tenantStack.hasuraHttpsListener,
        databaseConnectionSecret: dbStack.connectionSecret,
        databaseCluster: dbStack.databaseCluster,
      }
    );

    const tenantBackupPlanStack = new TenantDRStack(
      app,
      `${appProps.riskSmartRegionProps.regionStackNamePrefix}${stage}-${appName}-${tenant.name}-TenantDRStack`,
      appProps,
      stackTenantProps,
      tenant,
      {
        kmsKey: dbStack.kmsKey,
        databaseCluster: dbStack.databaseCluster,
      }
    );
    tenantBackupPlanStack.addDependency(tenantStack);

    return;
  }
});

// Request State API Stack
new RequestStateApiStack(
  app,
  `${appProps.riskSmartRegionProps.regionStackNamePrefix}${stage}-${appName}-RequestStateApiStack`,
  {
    ...appProps,
    commonEventBus: eventStack.commonEventBus,
    vpc: tenantStack.defaultVPC,
    apiGatewayVpcEndpoint: tenantStack.apiGatewayVpcEndpoint,
  },
  stackProps,
  {
    sentryRelease,
    initiateRequestHandlerProvisionedConcurrency: 1,
    requestHandlerProvisionedConcurrency: 1,
  }
);

new DataLayerStack(
  app,
  `${appProps.riskSmartRegionProps.regionStackNamePrefix}${stage}-${appName}-DataLayerStack`,
  {
    ...appProps,
    commonEventBus: eventStack.commonEventBus,
    vpc: tenantStack.defaultVPC,
    dataLayerSg: tenantStack.dataLayerSg,
    permitSecretName: tenantStack.permitSecretName,
    apiGatewayVpcEndpoint: tenantStack.apiGatewayVpcEndpoint,
  },
  stackProps,
  {
    sentryRelease,
    localTenantConfigTable,
    localDatabaseConnectionString,
    localDynamodbEndpoint,
    localS3Endpoint,
    localPdpEndpoint,
    localPermitApiUrl,
    localPdpApiKey,
    restApiHandlerProvisionedConcurrency: 1,
    clientRestApiHandlerProvisionedConcurrency: 1,
  }
);

new PermissionsStack(
  app,
  `${appProps.riskSmartRegionProps.regionStackNamePrefix}${stage}-${appName}-PermissionsStack`,
  {
    ...appProps,
    commonEventBus: eventStack.commonEventBus,
    vpc: tenantStack.defaultVPC,
    permitSecretName: tenantStack.permitSecretName,
    dataLayerSg: tenantStack.dataLayerSg,
  },
  stackProps,
  {
    sentryRelease,
    localTenantConfigTable,
    localDatabaseConnectionString,
    localDynamodbEndpoint,
    localPdpEndpoint,
    localPermitApiUrl,
    localPdpApiKey,
    permissionsHandlerProvisionedConcurrency: 1,
  }
);

new RulebookIngestionStack(
  app,
  `${appProps.riskSmartRegionProps.regionStackNamePrefix}${stage}-${appName}-RulebookIngestionStack`,
  stackProps,
  {
    ...appProps,
    sentryRelease,
    vpc: tenantStack.defaultVPC,
    sharedEventBus: eventStack.commonEventBus,
  }
);

new AiFeedbackIngestionStack(
  app,
  `${appProps.riskSmartRegionProps.regionStackNamePrefix}${stage}-${appName}-AiFeedbackIngestionStack`,
  stackProps,
  {
    ...appProps,
    sentryRelease,
    vpc: tenantStack.defaultVPC,
    apiGatewayVpcEndpoint: tenantStack.apiGatewayVpcEndpoint,
  }
);

app.synth();
