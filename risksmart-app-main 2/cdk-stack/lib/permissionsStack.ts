import type { StackProps } from 'aws-cdk-lib';
import { Duration, Stack } from 'aws-cdk-lib';
import type { ISecurityGroup, IVpc } from 'aws-cdk-lib/aws-ec2';
import { SecurityGroup, SubnetType } from 'aws-cdk-lib/aws-ec2';
import type { EventBus } from 'aws-cdk-lib/aws-events';
import { Rule, Schedule } from 'aws-cdk-lib/aws-events';
import { LambdaFunction } from 'aws-cdk-lib/aws-events-targets';
import {
  Effect,
  ManagedPolicy,
  PolicyStatement,
  Role,
  ServicePrincipal,
} from 'aws-cdk-lib/aws-iam';
import type { IFunction } from 'aws-cdk-lib/aws-lambda';
import { Alias, Architecture, Runtime } from 'aws-cdk-lib/aws-lambda';
import { SqsEventSource } from 'aws-cdk-lib/aws-lambda-event-sources';
import { NodejsFunction } from 'aws-cdk-lib/aws-lambda-nodejs';
import { LogGroup, RetentionDays } from 'aws-cdk-lib/aws-logs';
import {
  DeduplicationScope,
  FifoThroughputLimit,
  Queue,
} from 'aws-cdk-lib/aws-sqs';
import { StringParameter } from 'aws-cdk-lib/aws-ssm';
import type { Construct } from 'constructs';
import * as path from 'path';

import type { LocalAppProps } from '../bin/cdk-stack';
import { type EnvSettings, getEnvSettings } from './env';

const isLocal = (stage: string) =>
  ['dev-cloud', 'staging', 'prod'].indexOf(stage) == -1;

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

export interface PermissionsStackProps extends LocalAppProps {
  commonEventBus: EventBus;
  vpc?: IVpc;
  permitSecretName: string;
  dataLayerSg: SecurityGroup;
}

export interface PermissionsStackConfig {
  sentryRelease: string;
  localTenantConfigTable: string;
  localDatabaseConnectionString: string;
  localDynamodbEndpoint: string;
  localPdpEndpoint: string;
  localPermitApiUrl: string;
  localPdpApiKey: string;
  /** Number of provisioned concurrent executions for PermissionsHandler. Set to 0 or omit to disable. */
  permissionsHandlerProvisionedConcurrency: number;
}

export class PermissionsStack extends Stack {
  public readonly permissionsHandler: IFunction;
  public readonly tenantSyncPoller: IFunction;
  public readonly tenantSyncProcessor: IFunction;
  public readonly syncQueue: Queue;
  public readonly permissionsHandlerDlq: Queue;
  public readonly permissionsEventBridgeDlq: Queue;
  private readonly config: PermissionsStackConfig;
  private readonly envSettings: EnvSettings;

  constructor(
    scope: Construct,
    id: string,
    props: PermissionsStackProps,
    stackProps: StackProps,
    config: PermissionsStackConfig
  ) {
    super(scope, id, stackProps);
    this.config = config;
    this.envSettings = getEnvSettings(props.stage);

    this.permissionsHandlerDlq = this.createPermissionsHandlerDlq(props);
    this.permissionsEventBridgeDlq =
      this.createPermissionsEventBridgeDlq(props);

    this.permissionsHandler = this.createPermissionsHandler(props);

    this.createEventBridgeRule(props);

    // Create tenant sync infrastructure
    this.syncQueue = this.createSyncQueue(props);
    this.tenantSyncPoller = this.createTenantSyncPoller(props);
    this.tenantSyncProcessor = this.createTenantSyncProcessor(props);
  }

  private createPermissionsHandlerDlq(props: PermissionsStackProps): Queue {
    return new Queue(this, 'PermissionsHandlerDlq', {
      queueName: `${this.region}-${props.stage}-permissions-handler-dlq`,
      retentionPeriod: Duration.days(4),
    });
  }

  private createPermissionsEventBridgeDlq(props: PermissionsStackProps): Queue {
    return new Queue(this, 'PermissionsEventBridgeDlq', {
      queueName: `${this.region}-${props.stage}-permissions-eventbridge-dlq`,
      retentionPeriod: Duration.days(4),
    });
  }

  private createPermissionsHandler(props: PermissionsStackProps): IFunction {
    const shouldUseVpc =
      props.vpc &&
      ['app', 'prod', 'staging', 'dev-cloud'].includes(props.stage);

    const executionRole = new Role(this, 'PermissionsHandlerExecutionRole', {
      roleName: `${this.region}-${props.stage}-PermissionsHandler`,
      assumedBy: new ServicePrincipal('lambda.amazonaws.com'),
      managedPolicies: [
        ManagedPolicy.fromAwsManagedPolicyName(
          shouldUseVpc
            ? 'service-role/AWSLambdaVPCAccessExecutionRole'
            : 'service-role/AWSLambdaBasicExecutionRole'
        ),
      ],
    });

    executionRole.addToPolicy(
      new PolicyStatement({
        effect: Effect.ALLOW,
        actions: ['events:PutEvents'],
        resources: [props.commonEventBus.eventBusArn],
      })
    );

    executionRole.addToPolicy(
      new PolicyStatement({
        effect: Effect.ALLOW,
        actions: ['dynamodb:GetItem', 'dynamodb:Query', 'dynamodb:Scan'],
        resources: [
          // here we need to use risksmartApp rather than reference the appName from props as this is only created once then replicated across regions
          `arn:aws:dynamodb:${this.region}:${this.account}:table/${props.stage}-risksmartApp-GlobalTenantConfig`,
          `arn:aws:dynamodb:${this.region}:${this.account}:table/${props.stage}-risksmartApp-GlobalTenantConfig/index/*`,
        ],
      })
    );

    executionRole.addToPolicy(
      new PolicyStatement({
        effect: Effect.ALLOW,
        actions: [
          'secretsmanager:GetSecretValue',
          'secretsmanager:DescribeSecret',
        ],
        resources: [
          `arn:aws:secretsmanager:${this.region}:${this.account}:secret:${props.stage}-${props.appName}-permit-Secret-*`,
        ],
      })
    );

    executionRole.addToPolicy(
      new PolicyStatement({
        effect: Effect.ALLOW,
        actions: [
          'rds:DescribeDBClusters',
          'rds:DescribeDBInstances',
          'rds-db:connect',
          // Read operations only
          'rds-data:ExecuteStatement',
          'rds-data:BatchExecuteStatement',
        ],
        resources: [
          `arn:aws:rds:${this.region}:${this.account}:cluster:${props.stage}-${props.appName}-*-databasecluster`,
          `arn:aws:rds:${this.region}:${this.account}:db:${props.stage}-${props.appName}-*`,
        ],
      })
    );

    // Grant permissions to read SSM parameters for service discovery
    executionRole.addToPolicy(
      new PolicyStatement({
        effect: Effect.ALLOW,
        actions: ['ssm:GetParameter'],
        resources: [
          `arn:aws:ssm:${this.region}:${this.account}:parameter/${props.stage}/${props.appName}/api/data-layer/internal-url`,
        ],
      })
    );

    // Grant permissions to invoke the Data Layer REST API (IAM authorized)
    executionRole.addToPolicy(
      new PolicyStatement({
        effect: Effect.ALLOW,
        actions: ['execute-api:Invoke'],
        resources: [
          // Data Layer REST API - allow all methods and paths
          `arn:aws:execute-api:${this.region}:${this.account}:*/${props.stage}/*/*`,
        ],
      })
    );

    const logGroup = new LogGroup(this, 'PermissionsHandlerLogGroup', {
      logGroupName: `/aws/lambda/${props.stage}-permissions-handler`,
      retention: RetentionDays.THREE_MONTHS,
    });

    let securityGroups: ISecurityGroup[] | undefined;
    if (shouldUseVpc) {
      const lambdaSecurityGroup = new SecurityGroup(
        this,
        'PermissionsHandlerSecurityGroup',
        {
          vpc: props.vpc!,
          description: 'Security group for Permissions Handler Lambda function',
          allowAllOutbound: true,
        }
      );
      securityGroups = [props.dataLayerSg, lambdaSecurityGroup];
    }

    const lambda = new NodejsFunction(this, 'PermissionsHandler', {
      functionName: `${this.region}-${props.stage}-permissions-handler`,
      runtime: Runtime.NODEJS_22_X,
      timeout: Duration.minutes(5),
      memorySize: 2048,
      role: executionRole,
      logGroup,
      deadLetterQueue: this.permissionsHandlerDlq,
      vpc: shouldUseVpc ? props.vpc : undefined,
      vpcSubnets: shouldUseVpc
        ? {
            subnetType: SubnetType.PRIVATE_WITH_EGRESS,
          }
        : undefined,
      securityGroups,
      entry: path.join(
        __dirname,
        '../../services/permissions/src/handlers/request-handler.ts'
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
        externalModules: ['@aws-sdk/*'], // Note: aws-sdk (v2) must be bundled for Node.js 22.x
      },
      environment: {
        NODE_ENV: props.stage === 'app' ? 'production' : 'development',
        STAGE: props.stage,
        APP_NAME: props.appName,
        POWERTOOLS_DEV: isLocal(props.stage) ? '1' : '0',
        NODE_OPTIONS: '--enable-source-maps',
        EVENT_BUS_NAME: props.commonEventBus.eventBusName,
        SENTRY_RELEASE: this.config.sentryRelease,
        IS_LOCAL: isLocal(props.stage) ? 'true' : 'false',
        PERMIT_SECRET_NAME: isLocal(props.stage)
          ? `${props.stage}-${props.appName}-permit-Secret` // For local dev, use explicit name to avoid cross-stack token resolution issues
          : props.permitSecretName,
        PERMIT_API_URL: isLocal(props.stage)
          ? this.config.localPermitApiUrl
          : PERMIT_CONFIG.apiUrl,
        PDP_ENDPOINT: isLocal(props.stage)
          ? this.config.localPdpEndpoint
          : this.envSettings.isInternalAlbEnabled
            ? `http://${StringParameter.valueForStringParameter(this, `/${props.stage}/${this.region}/internal-alb/dns-name`)}:80`
            : `http://${PERMIT_CONFIG.name}:${PERMIT_CONFIG.containerPort}`,
        LOCAL_PDP_API_KEY: isLocal(props.stage)
          ? this.config.localPdpApiKey
          : '',
        PROXY_FACTS_VIA_PDP: 'true',
        TENANT_CONFIG_TABLE: isLocal(props.stage)
          ? this.config.localTenantConfigTable
          : `${props.stage}-risksmartApp-GlobalTenantConfig`,
        LOCAL_DATABASE_CONNECTION_STRING: isLocal(props.stage)
          ? this.config.localDatabaseConnectionString
          : '',
        DYNAMODB_ENDPOINT: isLocal(props.stage)
          ? this.config.localDynamodbEndpoint
          : '',
        DATA_LAYER_INTERNAL_API_URL_SSM_PARAM: `/${props.stage}/${props.appName}/api/data-layer/internal-url`,
      },
    });

    // If provisioned concurrency is configured, create an alias with it
    const provisionedConcurrency =
      this.config.permissionsHandlerProvisionedConcurrency;
    if (provisionedConcurrency && provisionedConcurrency > 0) {
      const alias = new Alias(this, 'PermissionsHandlerAlias', {
        aliasName: 'live',
        version: lambda.currentVersion,
        provisionedConcurrentExecutions: provisionedConcurrency,
      });

      return alias;
    }

    return lambda;
  }

  private createEventBridgeRule(props: PermissionsStackProps): void {
    const permissionsEventRule = new Rule(this, 'PermissionsHandlerEventRule', {
      ruleName: `${this.region}-${props.stage}-permissions-handler-events`,
      eventBus: props.commonEventBus,
      eventPattern: {
        source: ['risksmart.data-layer'],
        detailType: [
          'LINKED_ITEM_CREATED',
          'LINKED_ITEM_DELETED',
          'OBJECT_CREATED',
          'OBJECT_UPDATED',
          'OBJECT_DELETED',
          'USER_CREATED',
          'USER_DELETED',
          'USER_GROUP_CREATED',
        ],
      },
    });

    permissionsEventRule.addTarget(
      new LambdaFunction(this.permissionsHandler, {
        deadLetterQueue: this.permissionsEventBridgeDlq,
        retryAttempts: 3,
      })
    );
  }

  private createSyncQueue(props: PermissionsStackProps): Queue {
    // Dead letter queue for failed sync messages
    const syncDlq = new Queue(this, 'TenantSyncDlq', {
      queueName: `${this.region}-${props.stage}-tenant-sync-dlq.fifo`,
      fifo: true,
      retentionPeriod: Duration.days(14),
    });

    // Main FIFO queue for tenant sync messages
    const syncQueue = new Queue(this, 'TenantSyncQueue', {
      queueName: `${this.region}-${props.stage}-tenant-sync-queue.fifo`,
      fifo: true,
      contentBasedDeduplication: true,
      deduplicationScope: DeduplicationScope.QUEUE,
      fifoThroughputLimit: FifoThroughputLimit.PER_QUEUE,
      visibilityTimeout: Duration.minutes(15), // Slightly longer than processor timeout
      retentionPeriod: Duration.days(4),
      deadLetterQueue: {
        queue: syncDlq,
        maxReceiveCount: 3,
      },
    });

    return syncQueue;
  }

  private createTenantSyncPoller(props: PermissionsStackProps): IFunction {
    const shouldUseVpc =
      props.vpc &&
      ['app', 'prod', 'staging', 'dev-cloud'].includes(props.stage);

    const executionRole = new Role(this, 'TenantSyncPollerExecutionRole', {
      roleName: `${this.region}-${props.stage}-TenantSyncPoller`,
      assumedBy: new ServicePrincipal('lambda.amazonaws.com'),
      managedPolicies: [
        ManagedPolicy.fromAwsManagedPolicyName(
          shouldUseVpc
            ? 'service-role/AWSLambdaVPCAccessExecutionRole'
            : 'service-role/AWSLambdaBasicExecutionRole'
        ),
      ],
    });

    // Grant permission to query Tenant Config Table
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

    // Grant permission to send messages to the Sync FIFO queue
    executionRole.addToPolicy(
      new PolicyStatement({
        effect: Effect.ALLOW,
        actions: ['sqs:SendMessage', 'sqs:GetQueueAttributes'],
        resources: [this.syncQueue.queueArn],
      })
    );

    const logGroup = new LogGroup(this, 'TenantSyncPollerLogGroup', {
      logGroupName: `/aws/lambda/${props.stage}-tenant-sync-poller`,
      retention: RetentionDays.THREE_MONTHS,
    });

    let securityGroups: ISecurityGroup[] | undefined;
    if (shouldUseVpc) {
      const lambdaSecurityGroup = new SecurityGroup(
        this,
        'TenantSyncPollerSecurityGroup',
        {
          vpc: props.vpc!,
          description: 'Security group for Tenant Sync Poller Lambda function',
          allowAllOutbound: true,
        }
      );
      securityGroups = [lambdaSecurityGroup];
    }

    const lambda = new NodejsFunction(this, 'TenantSyncPoller', {
      functionName: `${this.region}-${props.stage}-tenant-sync-poller`,
      runtime: Runtime.NODEJS_22_X,
      timeout: Duration.minutes(1),
      memorySize: 256,
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
        '../../services/permissions/src/handlers/tenant-sync-poller.ts'
      ),
      handler: 'handler',
      bundling: {
        target: 'ES2022',
        minify: true,
        sourceMap: true,
        externalModules: ['@aws-sdk/*'],
      },
      architecture: Architecture.ARM_64,
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
        DYNAMODB_ENDPOINT: isLocal(props.stage)
          ? this.config.localDynamodbEndpoint
          : '',
        SYNC_QUEUE_URL: this.syncQueue.queueUrl,
      },
    });

    // Create cron rule to trigger the poller
    const pollerScheduleRule = new Rule(this, 'TenantSyncPollerSchedule', {
      ruleName: `${this.region}-${props.stage}-tenant-sync-poller-schedule`,
      schedule: Schedule.rate(Duration.hours(1)), // Run every hour
    });

    pollerScheduleRule.addTarget(new LambdaFunction(lambda));

    return lambda;
  }

  private createTenantSyncProcessor(props: PermissionsStackProps): IFunction {
    const shouldUseVpc =
      props.vpc &&
      ['app', 'prod', 'staging', 'dev-cloud'].includes(props.stage);

    const executionRole = new Role(this, 'TenantSyncProcessorExecutionRole', {
      roleName: `${this.region}-${props.stage}-TenantSyncProcessor`,
      assumedBy: new ServicePrincipal('lambda.amazonaws.com'),
      managedPolicies: [
        ManagedPolicy.fromAwsManagedPolicyName(
          shouldUseVpc
            ? 'service-role/AWSLambdaVPCAccessExecutionRole'
            : 'service-role/AWSLambdaBasicExecutionRole'
        ),
      ],
    });

    // Grant permission to receive messages from the Sync FIFO queue
    executionRole.addToPolicy(
      new PolicyStatement({
        effect: Effect.ALLOW,
        actions: [
          'sqs:ReceiveMessage',
          'sqs:DeleteMessage',
          'sqs:GetQueueAttributes',
        ],
        resources: [this.syncQueue.queueArn],
      })
    );

    // Grant permission to query Tenant Config Table (to get all orgs for tenant)
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

    // Grant permission to access Permit secret
    executionRole.addToPolicy(
      new PolicyStatement({
        effect: Effect.ALLOW,
        actions: [
          'secretsmanager:GetSecretValue',
          'secretsmanager:DescribeSecret',
        ],
        resources: [
          `arn:aws:secretsmanager:${this.region}:${this.account}:secret:${props.stage}-${props.appName}-*-ConnectionSecret-*`,
          `arn:aws:secretsmanager:${this.region}:${this.account}:secret:${props.stage}-${props.appName}-permit-Secret-*`,
        ],
      })
    );

    // Grant permission to access RDS databases (to get nodes/links)
    executionRole.addToPolicy(
      new PolicyStatement({
        effect: Effect.ALLOW,
        actions: [
          'rds:DescribeDBClusters',
          'rds:DescribeDBInstances',
          'rds-db:connect',
          'rds-data:ExecuteStatement',
          'rds-data:BatchExecuteStatement',
        ],
        resources: [
          `arn:aws:rds:${this.region}:${this.account}:cluster:${props.stage}-${props.appName}-*-databasecluster`,
          `arn:aws:rds:${this.region}:${this.account}:db:${props.stage}-${props.appName}-*`,
        ],
      })
    );

    // Grant permissions to read SSM parameters for service discovery
    executionRole.addToPolicy(
      new PolicyStatement({
        effect: Effect.ALLOW,
        actions: ['ssm:GetParameter'],
        resources: [
          `arn:aws:ssm:${this.region}:${this.account}:parameter/${props.stage}/${props.appName}/api/data-layer/internal-url`,
        ],
      })
    );

    // Grant permissions to invoke the Data Layer REST API (IAM authorized)
    executionRole.addToPolicy(
      new PolicyStatement({
        effect: Effect.ALLOW,
        actions: ['execute-api:Invoke'],
        resources: [
          `arn:aws:execute-api:${this.region}:${this.account}:*/${props.stage}/*/*`,
        ],
      })
    );

    const logGroup = new LogGroup(this, 'TenantSyncProcessorLogGroup', {
      logGroupName: `/aws/lambda/${props.stage}-tenant-sync-processor`,
      retention: RetentionDays.THREE_MONTHS,
    });

    let securityGroups: ISecurityGroup[] | undefined;
    if (shouldUseVpc) {
      const lambdaSecurityGroup = new SecurityGroup(
        this,
        'TenantSyncProcessorSecurityGroup',
        {
          vpc: props.vpc!,
          description:
            'Security group for Tenant Sync Processor Lambda function',
          allowAllOutbound: true,
        }
      );
      securityGroups = [props.dataLayerSg, lambdaSecurityGroup];
    }

    const lambda = new NodejsFunction(this, 'TenantSyncProcessor', {
      functionName: `${this.region}-${props.stage}-tenant-sync-processor`,
      runtime: Runtime.NODEJS_22_X,
      timeout: Duration.minutes(14),
      memorySize: 3008,
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
        '../../services/permissions/src/handlers/tenant-sync-processor.ts'
      ),
      handler: 'handler',
      bundling: {
        target: 'ES2022',
        minify: true,
        sourceMap: true,
        externalModules: ['@aws-sdk/*'],
      },
      architecture: Architecture.ARM_64,
      environment: {
        NODE_ENV: props.stage === 'app' ? 'production' : 'development',
        STAGE: props.stage,
        APP_NAME: props.appName,
        POWERTOOLS_DEV: isLocal(props.stage) ? '1' : '0',
        NODE_OPTIONS: '--enable-source-maps',
        SENTRY_RELEASE: this.config.sentryRelease,
        IS_LOCAL: isLocal(props.stage) ? 'true' : 'false',
        PERMIT_SECRET_NAME: isLocal(props.stage)
          ? `${props.stage}-${props.appName}-permit-Secret`
          : props.permitSecretName,
        PDP_ENDPOINT: isLocal(props.stage)
          ? this.config.localPdpEndpoint
          : this.envSettings.isInternalAlbEnabled
            ? `http://${StringParameter.valueForStringParameter(this, `/${props.stage}/${this.region}/internal-alb/dns-name`)}:80`
            : `http://${PERMIT_CONFIG.name}:${PERMIT_CONFIG.containerPort}`,
        LOCAL_PDP_API_KEY: isLocal(props.stage)
          ? this.config.localPdpApiKey
          : '',
        PROXY_FACTS_VIA_PDP: 'true',
        TENANT_CONFIG_TABLE: isLocal(props.stage)
          ? this.config.localTenantConfigTable
          : `${props.stage}-risksmartApp-GlobalTenantConfig`,
        LOCAL_DATABASE_CONNECTION_STRING: isLocal(props.stage)
          ? this.config.localDatabaseConnectionString
          : '',
        DYNAMODB_ENDPOINT: isLocal(props.stage)
          ? this.config.localDynamodbEndpoint
          : '',
        DATA_LAYER_INTERNAL_API_URL_SSM_PARAM: `/${props.stage}/${props.appName}/api/data-layer/internal-url`,
        PERMIT_API_URL: isLocal(props.stage)
          ? this.config.localPermitApiUrl
          : PERMIT_CONFIG.apiUrl,
      },
    });

    // Add SQS event source to process messages from the queue
    lambda.addEventSource(
      new SqsEventSource(this.syncQueue, {
        batchSize: 1, // Process one tenant at a time for FIFO ordering
        enabled: true,
      })
    );

    return lambda;
  }
}
