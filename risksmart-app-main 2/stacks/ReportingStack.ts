import { ISecurityGroup, SecurityGroup } from 'aws-cdk-lib/aws-ec2';
import { ManagedPolicy, Role, ServicePrincipal } from 'aws-cdk-lib/aws-iam';
import { Secret } from 'aws-cdk-lib/aws-secretsmanager';
import { StackContext, use } from 'sst/constructs';

import { getEnv } from './environment';
import { isLocal } from './isLocal';
import { RestAPI } from './RestApiStack';
import { Secrets } from './SecretsStack';
import { getEnvSettings } from './stageEnv/env';
import { TenantSettings } from './stageEnv/tenantSettings';
import { getFunctionVpcProps } from './vpc';

const handlersDir = 'packages/rest-api/src/handlers';
const isRiskSmartRegion = process.env.IS_RISKSMART_REGION === 'true';
import { RISKSMART_REGION_PREFIX } from './constants';
const appSuffix = isRiskSmartRegion ? '-app' : '-risksmartApp';

const naming = (
  name: string,
  {
    stage,
    tenant,
    cdkStack,
  }: {
    stage: string;
    tenant: string;
    /**
     * The api-stack/cdk code used app as the stage not prod
     */
    cdkStack?: boolean;
  }
) => {
  const envSettings = getEnvSettings(stage);
  const stagePrefix = cdkStack ? envSettings.cdkStagePrefix(stage) : stage;

  return `${RISKSMART_REGION_PREFIX}${stagePrefix}${appSuffix}-${tenant}-${name}`;
};

/**
 * Provides api end points as used by the dashboard multiple data source reporting
 * Currently uses a combination of patterns 2 & 6 (Silo Compute, Database per tenant with Secrets Manager Authentication),(Pool Compute, Pool Database with Secrets Manager Authentication) in link below,
 * https://github.com/aws-samples/multi-tenant-database-isolation-patterns
 */
export function ReportingStack(tenantSettings: TenantSettings) {
  return async ({ stack }: StackContext) => {
    const { HASURA_ADMIN_SECRET } = use(Secrets);
    const { api } = use(RestAPI);
    const tenant = tenantSettings.name;
    const tenantDatabaseSecret = Secret.fromSecretNameV2(
      stack,
      'TenantDatabaseSecret',
      naming('ReportingConnectionSecret', {
        stage: stack.stage,
        tenant,
        cdkStack: true,
      })
    );

    const envSettings = getEnvSettings(stack.stage);

    // IAM role limited based on request/resource tag matching
    const lambdaRole = new Role(stack, tenant + 'SiloSecretLambdaRole', {
      assumedBy: new ServicePrincipal('lambda.amazonaws.com').withSessionTags(),
      managedPolicies: [
        ManagedPolicy.fromAwsManagedPolicyName(
          'service-role/AWSLambdaVPCAccessExecutionRole'
        ),
      ],
    });
    tenantDatabaseSecret.grantRead(lambdaRole);
    let securityGroups: ISecurityGroup[] | undefined = undefined;

    if (!isLocal(stack.stage)) {
      const vpcSettings = getFunctionVpcProps(stack);

      if (!vpcSettings?.vpc) {
        throw new Error('VPC required');
      }

      const reportDataSg = SecurityGroup.fromLookupByName(
        stack,
        'ReportDataSg',
        naming('ReportDataSg', {
          stage: stack.stage,
          tenant,
          cdkStack: true,
        }),
        vpcSettings?.vpc
      );

      securityGroups = [reportDataSg];
      securityGroups.push(...(vpcSettings.securityGroups ?? []));
    }

    api.addRoutes(stack, {
      [`POST /tenant/${tenant}/reporting/data`]: {
        authorizer: 'key',
        function: {
          bind: [HASURA_ADMIN_SECRET],
          handler: `${handlersDir}/reporting/data/post.handler`,
          functionName: naming('reportData', { stage: stack.stage, tenant }),
          role: lambdaRole,
          memorySize: 2048,
          environment: {
            TENANT: tenant,
            DATABASE_SECRET_NAME: tenantDatabaseSecret.secretName,
            LOCAL_REPORTING_DATABASE_CONNECTION_STRING:
              getEnv('LOCAL_REPORTING_DATABASE_CONNECTION_STRING', true) ?? '',
          },
          securityGroups,
        },
      },
      [`POST /tenant/${tenant}/reporting/filter-options`]: {
        authorizer: 'key',
        function: {
          bind: [HASURA_ADMIN_SECRET],
          handler: `${handlersDir}/reporting/filter-options/post.handler`,
          functionName: naming('reportFileOptions', {
            stage: stack.stage,
            tenant,
          }),
          role: lambdaRole,
          environment: {
            TENANT: tenant,
            DATABASE_SECRET_NAME: tenantDatabaseSecret.secretName,
            LOCAL_REPORTING_DATABASE_CONNECTION_STRING:
              getEnv('LOCAL_REPORTING_DATABASE_CONNECTION_STRING', true) ?? '',
          },
          securityGroups,
        },
      },
    });
  };
}
