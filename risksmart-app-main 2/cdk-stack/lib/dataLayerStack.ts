import type { StackProps } from 'aws-cdk-lib';
import {
  aws_events,
  aws_events_targets,
  aws_sqs,
  Duration,
  Stack,
  Tags,
} from 'aws-cdk-lib';
import {
  AccessLogFormat,
  AuthorizationType,
  EndpointType,
  LambdaIntegration,
  LogGroupLogDestination,
  MethodLoggingLevel,
  RestApi,
} from 'aws-cdk-lib/aws-apigateway';
import type {
  IInterfaceVpcEndpoint,
  ISecurityGroup,
  IVpc,
} from 'aws-cdk-lib/aws-ec2';
import { SecurityGroup, SubnetType } from 'aws-cdk-lib/aws-ec2';
import type { EventBus } from 'aws-cdk-lib/aws-events';
import {
  AnyPrincipal,
  Effect,
  ManagedPolicy,
  PolicyDocument,
  PolicyStatement,
  Role,
  ServicePrincipal,
} from 'aws-cdk-lib/aws-iam';
import type { IFunction } from 'aws-cdk-lib/aws-lambda';
import { Alias, Architecture, Runtime } from 'aws-cdk-lib/aws-lambda';
import { NodejsFunction } from 'aws-cdk-lib/aws-lambda-nodejs';
import { LogGroup, RetentionDays } from 'aws-cdk-lib/aws-logs';
import { StringParameter } from 'aws-cdk-lib/aws-ssm';
import type { Construct } from 'constructs';
import * as path from 'path';

import type { LocalAppProps } from '../bin/cdk-stack';
import { RisksmartFunction } from './constructs/risksmartFunction';
import { type EnvSettings, getEnvSettings } from './env';

const isLocal = (stage: string) =>
  !['dev-cloud', 'staging', 'prod'].includes(stage);

interface PermitConfig {
  name: string;
  containerPort: number;
  apiUrl: string;
}

const PERMIT_CONFIG: PermitConfig = {
  name: 'permit',
  containerPort: 7000,
  apiUrl: 'https://api.permit.io',
};

export interface DataLayerStackProps extends LocalAppProps {
  commonEventBus: EventBus;
  vpc?: IVpc;
  dataLayerSg: SecurityGroup;
  permitSecretName: string;
  apiGatewayVpcEndpoint?: IInterfaceVpcEndpoint;
}

export interface DataLayerStackConfig {
  sentryRelease: string;
  localTenantConfigTable: string;
  localDatabaseConnectionString: string;
  localDynamodbEndpoint: string;
  localS3Endpoint: string;
  localPdpEndpoint: string;
  localPermitApiUrl: string;
  localPdpApiKey: string;
  /** Number of provisioned concurrent executions for DataLayerRestApiHandler. Set to 0 or omit to disable. */
  restApiHandlerProvisionedConcurrency: number;
  /** Number of provisioned concurrent executions for DataLayerClientRestApiHandler. Set to 0 or omit to disable. */
  clientRestApiHandlerProvisionedConcurrency: number;
}

export class DataLayerStack extends Stack {
  public readonly restApiHandler: IFunction;
  public readonly clientRestApiHandler: IFunction;
  public readonly restApi: RestApi;
  public readonly clientRestApi: RestApi;
  private readonly config: DataLayerStackConfig;
  private readonly envSettings: EnvSettings;

  private readonly relativeHandlerDirectoryPath =
    '../../services/data-layer/src/handlers' as const;

  constructor(
    scope: Construct,
    id: string,
    props: DataLayerStackProps,
    stackProps: StackProps,
    config: DataLayerStackConfig
  ) {
    super(scope, id, stackProps);
    this.config = config;
    this.envSettings = getEnvSettings(props.stage);

    this.restApiHandler = this.createRestApiHandler(props);
    this.clientRestApiHandler = this.createClientRestApiHandler(props);
    this.restApi = this.createRestApiGateway(props);
    this.clientRestApi = this.createClientApiGateway(props);
    this.createOrgEventHandler(props);

    // Write Client API URL to SSM Parameter Store for service discovery
    // This is the primary API that should be used by clients
    // Note: Keep existing /url param for backwards compatibility
    new StringParameter(this, 'DataLayerApiUrlParameter', {
      parameterName: `/${props.stage}/${props.appName}/api/data-layer/url`,
      stringValue: this.clientRestApi.url,
      description: `[${props.stage}] Client API URL for the Data Layer service (deprecated - use /client-url)`,
    });

    // New explicit client URL parameter
    new StringParameter(this, 'DataLayerClientApiUrlParameter', {
      parameterName: `/${props.stage}/${props.appName}/api/data-layer/client-url`,
      stringValue: this.clientRestApi.url,
      description: `[${props.stage}] Client API URL for the Data Layer service`,
    });

    // Internal API URL parameter for service-to-service calls
    new StringParameter(this, 'DataLayerInternalApiUrlParameter', {
      parameterName: `/${props.stage}/${props.appName}/api/data-layer/internal-url`,
      stringValue: this.restApi.url,
      description: `[${props.stage}] Internal API URL for the Data Layer service`,
    });

    this.addStackOutputs(props);
  }

  private createOrgEventHandler(props: DataLayerStackProps): IFunction {
    const fn = new RisksmartFunction(this, 'OrgEventHandler', {
      ...props,
      entry: path.join(
        __dirname,
        this.relativeHandlerDirectoryPath,
        'org-event/handler.ts'
      ),
      functionName: 'data-layer-org-event-handler',
      timeout: Duration.minutes(10),
      environment: {
        SENTRY_RELEASE: this.config.sentryRelease,
        IS_LOCAL: isLocal(props.stage) ? 'true' : 'false',
        LOCAL_DATABASE_CONNECTION_STRING: isLocal(props.stage)
          ? this.config.localDatabaseConnectionString
          : '',
        // this is required because within createConnectionPool in db-utils.ts:
        // import { createConnectionPool } from './db-utils';
        // which imports { getTenantConfigFromDynamoDB } from '@risksmart-app/tenant-configuration/src/adaptors/database/index';
        // which initialises a dynamo client
        DYNAMODB_ENDPOINT: isLocal(props.stage)
          ? this.config.localDynamodbEndpoint
          : '',
        S3_ENDPOINT: isLocal(props.stage) ? this.config.localS3Endpoint : '',
      },
    });

    // one monolambda to handle and route all OrgEventRules
    const eventRule = new aws_events.Rule(this, 'OrgEventRule', {
      eventBus: props.commonEventBus,
      ruleName: 'data-layer-org-event-rule',
      description: 'Handle organization events in the Data Layer service',
      eventPattern: {
        detailType: ['EXTERNAL_OBLIGATIONS_UPDATED'],
        detail: {
          metadata: {
            tenant: [{ exists: true }],
            orgKey: [{ exists: true }],
            userId: ['SYSTEM'],
          },
        },
      },
    });

    const deadLetterQueue = new aws_sqs.Queue(this, 'OrgEventDlq', {
      queueName: `${this.region}-${props.stage}-data-layer-org-event-dlq`,
      retentionPeriod: Duration.days(14),
    });

    eventRule.addTarget(
      new aws_events_targets.LambdaFunction(fn.lambda, {
        deadLetterQueue,
      })
    );

    // Do we want to pass this in from the other stack? It would create a dependency on that stack.
    const bucketName =
      `${props.riskSmartRegionProps.regionStackNamePrefix}${props.stage}-rulebook-changes`.toLowerCase();

    fn.lambda.addToRolePolicy(
      new PolicyStatement({
        effect: Effect.ALLOW,
        actions: ['s3:GetObject'],
        resources: [`arn:aws:s3:::${bucketName}/*`],
      })
    );

    // Grant permissions to to RDS
    fn.lambda.addToRolePolicy(
      new PolicyStatement({
        effect: Effect.ALLOW,
        actions: [
          'rds:DescribeDBClusters',
          'rds:DescribeDBInstances',
          'rds-db:connect',
          'rds-data:ExecuteStatement',
          'rds-data:BatchExecuteStatement',
          'rds-data:BeginTransaction',
          'rds-data:CommitTransaction',
          'rds-data:RollbackTransaction',
        ],
        resources: [
          `arn:aws:rds:${this.region}:${this.account}:cluster:${props.stage}-${props.appName}-*-databasecluster`,
          `arn:aws:rds:${this.region}:${this.account}:db:${props.stage}-${props.appName}-*`,
        ],
      })
    );

    // Grant permissions to read secrets
    fn.lambda.addToRolePolicy(
      new PolicyStatement({
        effect: Effect.ALLOW,
        actions: [
          'secretsmanager:GetSecretValue',
          'secretsmanager:DescribeSecret',
        ],
        resources: [
          `arn:aws:secretsmanager:${this.region}:${this.account}:secret:${props.stage}-${props.appName}-*-ConnectionSecret-*`,
          `arn:aws:secretsmanager:${this.region}:${this.account}:secret:${props.stage}-${props.appName}-*-DataLayerConnectionSecret-??????`,
          `arn:aws:secretsmanager:${this.region}:${this.account}:secret:${props.stage}-${props.appName}-permit-Secret-*`,
        ],
      })
    );

    return fn.lambda;
  }

  private createRestApiHandler(props: DataLayerStackProps): IFunction {
    const shouldUseVpc =
      props.vpc &&
      ['app', 'prod', 'staging', 'dev-cloud'].includes(props.stage);

    const executionRole = new Role(
      this,
      'DataLayerRestApiHandlerExecutionRole',
      {
        roleName: `${this.region}-${props.stage}-DataLayerRestApiHandler`,
        assumedBy: new ServicePrincipal('lambda.amazonaws.com'),
        managedPolicies: [
          ManagedPolicy.fromAwsManagedPolicyName(
            shouldUseVpc
              ? 'service-role/AWSLambdaVPCAccessExecutionRole'
              : 'service-role/AWSLambdaBasicExecutionRole'
          ),
        ],
      }
    );

    // Grant permissions to read from RDS
    executionRole.addToPolicy(
      new PolicyStatement({
        effect: Effect.ALLOW,
        actions: [
          'rds:DescribeDBClusters',
          'rds:DescribeDBInstances',
          'rds-db:connect',
          'rds-data:ExecuteStatement',
          'rds-data:BatchExecuteStatement',
          'rds-data:BeginTransaction',
          'rds-data:CommitTransaction',
          'rds-data:RollbackTransaction',
        ],
        resources: [
          `arn:aws:rds:${this.region}:${this.account}:cluster:${props.stage}-${props.appName}-*-databasecluster`,
          `arn:aws:rds:${this.region}:${this.account}:db:${props.stage}-${props.appName}-*`,
        ],
      })
    );

    // Grant permissions to read secrets
    executionRole.addToPolicy(
      new PolicyStatement({
        effect: Effect.ALLOW,
        actions: [
          'secretsmanager:GetSecretValue',
          'secretsmanager:DescribeSecret',
        ],
        resources: [
          `arn:aws:secretsmanager:${this.region}:${this.account}:secret:${props.stage}-${props.appName}-*-ConnectionSecret-*`,
          `arn:aws:secretsmanager:${this.region}:${this.account}:secret:${props.stage}-${props.appName}-*-DataLayerConnectionSecret-??????`,
          `arn:aws:secretsmanager:${this.region}:${this.account}:secret:${props.stage}-${props.appName}-permit-Secret-*`,
        ],
      })
    );

    // Grant permissions to read tenant config
    executionRole.addToPolicy(
      new PolicyStatement({
        effect: Effect.ALLOW,
        actions: ['dynamodb:GetItem', 'dynamodb:Query', 'dynamodb:Scan'],
        resources: [
          `arn:aws:dynamodb:${this.region}:${this.account}:table/${props.stage}-risksmartApp-GlobalTenantConfig`,
          `arn:aws:dynamodb:${this.region}:${this.account}:table/${props.stage}-risksmartApp-GlobalTenantConfig/index/*`,
        ],
      })
    );

    // Grant permissions to emit events to EventBridge (for POST endpoints that emit ObjectCreated events)
    executionRole.addToPolicy(
      new PolicyStatement({
        effect: Effect.ALLOW,
        actions: ['events:PutEvents'],
        resources: [props.commonEventBus.eventBusArn],
      })
    );

    const logGroup = new LogGroup(this, 'DataLayerRestApiHandlerLogGroup', {
      logGroupName: `/aws/lambda/${props.stage}-data-layer-http-handler`,
      retention: RetentionDays.THREE_MONTHS,
    });

    let securityGroups: ISecurityGroup[] | undefined;
    if (shouldUseVpc) {
      const lambdaSecurityGroup = new SecurityGroup(
        this,
        'DataLayerRestApiHandlerSecurityGroup',
        {
          vpc: props.vpc!,
          description:
            'Security group for DataLayer REST API Handler Lambda function',
          allowAllOutbound: true,
        }
      );
      securityGroups = [props.dataLayerSg, lambdaSecurityGroup];
    }

    const lambda = new NodejsFunction(this, 'DataLayerRestApiHandler', {
      functionName: `${this.region}-${props.stage}-data-layer-http-handler`,
      runtime: Runtime.NODEJS_22_X,
      timeout: Duration.minutes(5),
      memorySize: 2048,
      role: executionRole,
      logGroup,
      vpc: shouldUseVpc ? props.vpc : undefined,
      vpcSubnets: shouldUseVpc
        ? {
            subnetType: SubnetType.PRIVATE_WITH_EGRESS,
          }
        : undefined,
      securityGroups,
      entry: path.join(
        __dirname,
        '../../services/data-layer/src/handlers/http/internal/handler.ts'
      ),
      handler: 'handler',
      architecture: Architecture.ARM_64,
      currentVersionOptions: {
        description: `Release: ${this.config.sentryRelease}`,
      },
      bundling: {
        target: 'ES2022',
        minify: true,
        sourceMap: true,
        externalModules: ['@aws-sdk/*'], // Node.js 22 includes SDK v3; aws-sdk (v2) must be bundled if used
      },
      environment: {
        NODE_ENV: props.stage === 'app' ? 'production' : 'development',
        STAGE: props.stage,
        APP_NAME: props.appName,
        POWERTOOLS_DEV: isLocal(props.stage) ? '1' : '0',
        NODE_OPTIONS: '--enable-source-maps',
        SENTRY_RELEASE: this.config.sentryRelease,
        IS_LOCAL: isLocal(props.stage) ? 'true' : 'false',
        TENANT_CONFIG_TABLE: isLocal(props.stage)
          ? this.config.localTenantConfigTable
          : `${props.stage}-risksmartApp-GlobalTenantConfig`,
        LOCAL_DATABASE_CONNECTION_STRING: isLocal(props.stage)
          ? this.config.localDatabaseConnectionString
          : '',
        DYNAMODB_ENDPOINT: isLocal(props.stage)
          ? this.config.localDynamodbEndpoint
          : '',
        PERMIT_SECRET_NAME: isLocal(props.stage)
          ? `${props.stage}-${props.appName}-permit-Secret` // For local dev, use explicit name to avoid cross-stack token resolution issues
          : props.permitSecretName,
        // PDP_ENDPOINT: When isInternalAlbEnabled, resolve from SSM at deploy time
        // Otherwise, uses ECS service discovery (container-to-container communication)
        PDP_ENDPOINT: isLocal(props.stage)
          ? this.config.localPdpEndpoint
          : this.envSettings.isInternalAlbEnabled
            ? `http://${StringParameter.valueForStringParameter(this, `/${props.stage}/${this.region}/internal-alb/dns-name`)}:80`
            : `http://${PERMIT_CONFIG.name}:${PERMIT_CONFIG.containerPort}`,
        PERMIT_API_URL: isLocal(props.stage)
          ? this.config.localPermitApiUrl
          : PERMIT_CONFIG.apiUrl,
        LOCAL_PDP_API_KEY: isLocal(props.stage)
          ? this.config.localPdpApiKey
          : '',
        NODE_EXTRA_CA_CERTS: '/var/runtime/ca-cert.pem',
        EVENT_BUS_NAME: props.commonEventBus.eventBusName,
      },
    });

    // If provisioned concurrency is configured, create an alias with it
    const provisionedConcurrency =
      this.config.restApiHandlerProvisionedConcurrency;
    if (provisionedConcurrency && provisionedConcurrency > 0) {
      const alias = new Alias(this, 'DataLayerRestApiHandlerAlias', {
        aliasName: 'live',
        version: lambda.currentVersion,
        provisionedConcurrentExecutions: provisionedConcurrency,
      });

      return alias;
    }

    return lambda;
  }

  /**
   * Creates the Lambda handler for the client-facing REST API.
   * Separate from the internal handler to avoid Lambda permission policy size limits.
   */
  private createClientRestApiHandler(props: DataLayerStackProps): IFunction {
    const shouldUseVpc =
      props.vpc &&
      ['app', 'prod', 'staging', 'dev-cloud'].includes(props.stage);

    const executionRole = new Role(
      this,
      'DataLayerClientRestApiHandlerExecutionRole',
      {
        roleName: `${this.region}-${props.stage}-DataLayerClientApiHandler`,
        assumedBy: new ServicePrincipal('lambda.amazonaws.com'),
        managedPolicies: [
          ManagedPolicy.fromAwsManagedPolicyName(
            shouldUseVpc
              ? 'service-role/AWSLambdaVPCAccessExecutionRole'
              : 'service-role/AWSLambdaBasicExecutionRole'
          ),
        ],
      }
    );

    // Grant permissions to read from RDS
    executionRole.addToPolicy(
      new PolicyStatement({
        effect: Effect.ALLOW,
        actions: [
          'rds:DescribeDBClusters',
          'rds:DescribeDBInstances',
          'rds-db:connect',
          'rds-data:ExecuteStatement',
          'rds-data:BatchExecuteStatement',
          'rds-data:BeginTransaction',
          'rds-data:CommitTransaction',
          'rds-data:RollbackTransaction',
        ],
        resources: [
          `arn:aws:rds:${this.region}:${this.account}:cluster:${props.stage}-${props.appName}-*-databasecluster`,
          `arn:aws:rds:${this.region}:${this.account}:db:${props.stage}-${props.appName}-*`,
        ],
      })
    );

    // Grant permissions to read secrets
    executionRole.addToPolicy(
      new PolicyStatement({
        effect: Effect.ALLOW,
        actions: [
          'secretsmanager:GetSecretValue',
          'secretsmanager:DescribeSecret',
        ],
        resources: [
          `arn:aws:secretsmanager:${this.region}:${this.account}:secret:${props.stage}-${props.appName}-*-ConnectionSecret-*`,
          `arn:aws:secretsmanager:${this.region}:${this.account}:secret:${props.stage}-${props.appName}-*-DataLayerConnectionSecret-??????`,
          `arn:aws:secretsmanager:${this.region}:${this.account}:secret:${props.stage}-${props.appName}-permit-Secret-*`,
        ],
      })
    );

    // Grant permissions to read tenant config
    executionRole.addToPolicy(
      new PolicyStatement({
        effect: Effect.ALLOW,
        actions: ['dynamodb:GetItem', 'dynamodb:Query', 'dynamodb:Scan'],
        resources: [
          `arn:aws:dynamodb:${this.region}:${this.account}:table/${props.stage}-risksmartApp-GlobalTenantConfig`,
          `arn:aws:dynamodb:${this.region}:${this.account}:table/${props.stage}-risksmartApp-GlobalTenantConfig/index/*`,
        ],
      })
    );

    // Grant permissions to emit events to EventBridge (for POST/DELETE endpoints that emit events)
    executionRole.addToPolicy(
      new PolicyStatement({
        effect: Effect.ALLOW,
        actions: ['events:PutEvents'],
        resources: [props.commonEventBus.eventBusArn],
      })
    );

    const logGroup = new LogGroup(
      this,
      'DataLayerClientRestApiHandlerLogGroup',
      {
        logGroupName: `/aws/lambda/${props.stage}-data-layer-client-http-handler`,
        retention: RetentionDays.THREE_MONTHS,
      }
    );

    let securityGroups: ISecurityGroup[] | undefined;
    if (shouldUseVpc) {
      const lambdaSecurityGroup = new SecurityGroup(
        this,
        'DataLayerClientRestApiHandlerSecurityGroup',
        {
          vpc: props.vpc!,
          description:
            'Security group for DataLayer Client REST API Handler Lambda function',
          allowAllOutbound: true,
        }
      );
      securityGroups = [props.dataLayerSg, lambdaSecurityGroup];
    }

    const lambda = new NodejsFunction(this, 'DataLayerClientRestApiHandler', {
      functionName: `${this.region}-${props.stage}-data-layer-client-http-handler`,
      runtime: Runtime.NODEJS_22_X,
      timeout: Duration.minutes(5),
      memorySize: 2048,
      role: executionRole,
      logGroup,
      vpc: shouldUseVpc ? props.vpc : undefined,
      vpcSubnets: shouldUseVpc
        ? {
            subnetType: SubnetType.PRIVATE_WITH_EGRESS,
          }
        : undefined,
      securityGroups,
      entry: path.join(
        __dirname,
        '../../services/data-layer/src/handlers/http/client/handler.ts'
      ),
      handler: 'handler',
      architecture: Architecture.ARM_64,
      currentVersionOptions: {
        description: `Release: ${this.config.sentryRelease}`,
      },
      bundling: {
        target: 'ES2022',
        minify: true,
        sourceMap: true,
        externalModules: ['@aws-sdk/*'],
      },
      environment: {
        NODE_ENV: props.stage === 'app' ? 'production' : 'development',
        STAGE: props.stage,
        APP_NAME: props.appName,
        POWERTOOLS_DEV: isLocal(props.stage) ? '1' : '0',
        NODE_OPTIONS: '--enable-source-maps',
        SENTRY_RELEASE: this.config.sentryRelease,
        IS_LOCAL: isLocal(props.stage) ? 'true' : 'false',
        TENANT_CONFIG_TABLE: isLocal(props.stage)
          ? this.config.localTenantConfigTable
          : `${props.stage}-risksmartApp-GlobalTenantConfig`,
        LOCAL_DATABASE_CONNECTION_STRING: isLocal(props.stage)
          ? this.config.localDatabaseConnectionString
          : '',
        DYNAMODB_ENDPOINT: isLocal(props.stage)
          ? this.config.localDynamodbEndpoint
          : '',
        PERMIT_SECRET_NAME: isLocal(props.stage)
          ? `${props.stage}-${props.appName}-permit-Secret`
          : props.permitSecretName,
        PDP_ENDPOINT: isLocal(props.stage)
          ? this.config.localPdpEndpoint
          : this.envSettings.isInternalAlbEnabled
            ? `http://${StringParameter.valueForStringParameter(this, `/${props.stage}/${this.region}/internal-alb/dns-name`)}:80`
            : `http://${PERMIT_CONFIG.name}:${PERMIT_CONFIG.containerPort}`,
        PERMIT_API_URL: isLocal(props.stage)
          ? this.config.localPermitApiUrl
          : PERMIT_CONFIG.apiUrl,
        LOCAL_PDP_API_KEY: isLocal(props.stage)
          ? this.config.localPdpApiKey
          : '',
        NODE_EXTRA_CA_CERTS: '/var/runtime/ca-cert.pem',
        EVENT_BUS_NAME: props.commonEventBus.eventBusName,
      },
    });

    // If provisioned concurrency is configured, create an alias with it
    const provisionedConcurrency =
      this.config.clientRestApiHandlerProvisionedConcurrency;
    if (provisionedConcurrency && provisionedConcurrency > 0) {
      const alias = new Alias(this, 'DataLayerClientRestApiHandlerAlias', {
        aliasName: 'live',
        version: lambda.currentVersion,
        provisionedConcurrentExecutions: provisionedConcurrency,
      });

      return alias;
    }

    return lambda;
  }

  private createRestApiGateway(props: DataLayerStackProps): RestApi {
    const shouldUsePrivateApi =
      props.vpc &&
      props.apiGatewayVpcEndpoint &&
      ['app', 'prod', 'staging', 'dev-cloud'].includes(props.stage);

    const apiAccessLogGroup = new LogGroup(this, 'DataLayerRestApiAccessLog', {
      retention: RetentionDays.THREE_MONTHS,
    });

    // Create resource policy for private API Gateway
    // This restricts access to only requests coming through the VPC endpoint
    const apiPolicy = shouldUsePrivateApi
      ? new PolicyDocument({
          statements: [
            new PolicyStatement({
              effect: Effect.ALLOW,
              principals: [new AnyPrincipal()],
              actions: ['execute-api:Invoke'],
              resources: ['execute-api:/*/*/*'],
            }),
            new PolicyStatement({
              effect: Effect.DENY,
              principals: [new AnyPrincipal()],
              actions: ['execute-api:Invoke'],
              resources: ['execute-api:/*/*/*'],
              conditions: {
                StringNotEquals: {
                  'aws:sourceVpce': props.apiGatewayVpcEndpoint!.vpcEndpointId,
                },
              },
            }),
          ],
        })
      : undefined;

    const api = new RestApi(this, 'DataLayerRestInternalApi', {
      restApiName: `${props.stage}-${props.appName}-data-layer-rest-internal-api`,
      description: 'Internal REST API for data layer read operations',
      // Configure as private API Gateway when VPC endpoint is available
      endpointTypes: shouldUsePrivateApi
        ? [EndpointType.PRIVATE]
        : [EndpointType.REGIONAL],
      ...(shouldUsePrivateApi && {
        policy: apiPolicy,
      }),
      deployOptions: {
        stageName: props.stage,
        throttlingRateLimit: 1000,
        throttlingBurstLimit: 2000,
        loggingLevel: MethodLoggingLevel.INFO,
        dataTraceEnabled: true,
        metricsEnabled: true,
        accessLogDestination: new LogGroupLogDestination(apiAccessLogGroup),
        accessLogFormat: AccessLogFormat.jsonWithStandardFields({
          caller: true,
          httpMethod: true,
          ip: true,
          protocol: true,
          requestTime: true,
          resourcePath: true,
          responseLength: true,
          status: true,
          user: true,
        }),
      },
      defaultMethodOptions: {
        authorizationType: AuthorizationType.IAM,
      },
    });

    if (isLocal(props.stage)) {
      Tags.of(api).add('_custom_id_', 'data_layer');
    }

    const integration = new LambdaIntegration(this.restApiHandler, {
      proxy: true,
    });

    // Use greedy {proxy+} routes for flexible path matching.
    // Route matching is handled by the Lambda handler using @middy/http-router.
    // See: services/data-layer/src/handlers/http/internal/handler.ts
    const proxyResource = api.root.addResource('{proxy+}');
    proxyResource.addMethod('GET', integration);

    return api;
  }

  /**
   * Creates the client-facing REST API Gateway with greedy {proxy+} routes.
   * Uses IAM role-based invocation to avoid Lambda permission policy limits.
   */
  private createClientApiGateway(props: DataLayerStackProps): RestApi {
    const shouldUsePrivateApi =
      props.vpc &&
      props.apiGatewayVpcEndpoint &&
      ['app', 'prod', 'staging', 'dev-cloud'].includes(props.stage);

    const apiAccessLogGroup = new LogGroup(
      this,
      'DataLayerClientApiAccessLog',
      {
        retention: RetentionDays.THREE_MONTHS,
      }
    );

    // Create resource policy for private API Gateway
    const apiPolicy = shouldUsePrivateApi
      ? new PolicyDocument({
          statements: [
            new PolicyStatement({
              effect: Effect.ALLOW,
              principals: [new AnyPrincipal()],
              actions: ['execute-api:Invoke'],
              resources: ['execute-api:/*/*/*'],
            }),
            new PolicyStatement({
              effect: Effect.DENY,
              principals: [new AnyPrincipal()],
              actions: ['execute-api:Invoke'],
              resources: ['execute-api:/*/*/*'],
              conditions: {
                StringNotEquals: {
                  'aws:sourceVpce': props.apiGatewayVpcEndpoint!.vpcEndpointId,
                },
              },
            }),
          ],
        })
      : undefined;

    const clientApi = new RestApi(this, 'DataLayerRestClientApi', {
      restApiName: `${props.stage}-${props.appName}-data-layer-rest-client-api`,
      description: 'Client REST API for data layer operations',
      endpointTypes: shouldUsePrivateApi
        ? [EndpointType.PRIVATE]
        : [EndpointType.REGIONAL],
      ...(shouldUsePrivateApi && {
        policy: apiPolicy,
      }),
      deployOptions: {
        stageName: props.stage,
        throttlingRateLimit: 1000,
        throttlingBurstLimit: 2000,
        loggingLevel: MethodLoggingLevel.INFO,
        dataTraceEnabled: true,
        metricsEnabled: true,
        accessLogDestination: new LogGroupLogDestination(apiAccessLogGroup),
        accessLogFormat: AccessLogFormat.jsonWithStandardFields({
          caller: true,
          httpMethod: true,
          ip: true,
          protocol: true,
          requestTime: true,
          resourcePath: true,
          responseLength: true,
          status: true,
          user: true,
        }),
      },
      defaultMethodOptions: {
        authorizationType: AuthorizationType.IAM,
      },
    });

    if (isLocal(props.stage)) {
      Tags.of(clientApi).add('_custom_id_', 'data_layer_client');
    }

    const clientIntegration = new LambdaIntegration(this.clientRestApiHandler, {
      proxy: true,
    });

    // Use greedy {proxy+} routes for flexible path matching.
    // Route matching is handled by the Lambda handler using @middy/http-router.
    // See: services/data-layer/src/handlers/http/client/handler.ts
    const proxyResource = clientApi.root.addResource('{proxy+}');
    proxyResource.addMethod('GET', clientIntegration);
    proxyResource.addMethod('POST', clientIntegration);
    proxyResource.addMethod('PUT', clientIntegration);
    proxyResource.addMethod('DELETE', clientIntegration);

    return clientApi;
  }

  private addStackOutputs(props: DataLayerStackProps): void {
    // Internal API exports
    this.exportValue(this.restApi.url, {
      name: `${props.stage}-${props.appName}-DataLayerRestInternalApiUrl`,
    });

    this.exportValue(this.restApiHandler.functionArn, {
      name: `${props.stage}-${props.appName}-DataLayerRestInternalApiHandlerArn`,
    });

    // Client API exports
    this.exportValue(this.clientRestApi.url, {
      name: `${props.stage}-${props.appName}-DataLayerRestClientApiUrl`,
    });

    this.exportValue(this.clientRestApiHandler.functionArn, {
      name: `${props.stage}-${props.appName}-DataLayerRestClientApiHandlerArn`,
    });
  }
}
