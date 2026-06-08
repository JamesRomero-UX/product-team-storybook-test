/* eslint-disable no-console */
import type { StackProps } from 'aws-cdk-lib';
import { Stack } from 'aws-cdk-lib';
import { Duration } from 'aws-cdk-lib';
import {
  AttributeType,
  BillingMode,
  StreamViewType,
  Table,
} from 'aws-cdk-lib/aws-dynamodb';
import type { IEventBus } from 'aws-cdk-lib/aws-events';
import { EventBus } from 'aws-cdk-lib/aws-events';
import {
  Effect,
  ManagedPolicy,
  PolicyStatement,
  Role,
  ServicePrincipal,
} from 'aws-cdk-lib/aws-iam';
import type { IFunction } from 'aws-cdk-lib/aws-lambda';
import {
  EventSourceMapping,
  Runtime,
  StartingPosition,
} from 'aws-cdk-lib/aws-lambda';
import type { Construct } from 'constructs';

import type { RiskSmartRegionProps } from '../bin/cdk-stack';
import { type EnvSettings, getEnvSettings, type RisksmartStage } from './env';
import {
  createOptimizedLambda,
  resolveLambdaEntry,
} from './utils/lambdaFactory';
import { getVpcFunctionSettings, type VpcFunctionSettings } from './utils/vpc';

interface TenantEventStackProps {
  sentryRelease: string;
}

/**
 * Stack that creates tenant-specific event resources including DynamoDB table
 */
export class TenantEventStack extends Stack {
  constructor(
    scope: Construct,
    id: string,
    stage: RisksmartStage,
    appName: string,
    tenantName: string,
    stackProps: StackProps,
    riskSmartRegionProps: RiskSmartRegionProps,
    tenantEventStackProps: TenantEventStackProps,
    isLocal: boolean
  ) {
    super(scope, id, stackProps);

    const envSettings = getEnvSettings(stage, isLocal);
    const vpcSettings = getVpcFunctionSettings(
      this,
      isLocal,
      stage,
      riskSmartRegionProps
    );
    // Create reference to the shared EventBus
    const commonEventBus = EventBus.fromEventBusName(
      this,
      'CommonEventBus',
      `${stage}-${appName}-CommonEventBus`
    );

    const streamHandlerFunction = this.createStreamHandlerFunction(
      stage,
      vpcSettings,
      appName,
      tenantName,
      commonEventBus,
      this.region,
      this.account,
      riskSmartRegionProps.regionStackNamePrefix,
      tenantEventStackProps.sentryRelease
    );
    this.createTenantEventTable(
      stage,
      appName,
      tenantName,
      riskSmartRegionProps.regionStackNamePrefix,
      envSettings,
      streamHandlerFunction
    );
  }

  private createStreamHandlerFunction(
    stage: RisksmartStage,
    vpcSettings: VpcFunctionSettings | undefined,
    appName: string,
    tenantName: string,
    commonEventBus: IEventBus,
    region: string,
    account: string,
    regionStackNamePrefix: string,
    sentryRelease: string
  ) {
    // Create IAM role for the Lambda function
    const streamHandlerRole = new Role(
      this,
      `StreamHandlerRole-${tenantName}`,
      {
        roleName: `${stage}-${appName}-${tenantName}-StreamHandlerRole`,
        assumedBy: new ServicePrincipal('lambda.amazonaws.com'),
        managedPolicies: [
          ManagedPolicy.fromAwsManagedPolicyName(
            'service-role/AWSLambdaVPCAccessExecutionRole'
          ),
        ],
      }
    );

    // Grant EventBridge permissions
    streamHandlerRole.addToPolicy(
      new PolicyStatement({
        effect: Effect.ALLOW,
        actions: ['events:PutEvents'],
        resources: [commonEventBus.eventBusArn],
      })
    );

    // Grant DynamoDB stream permissions
    streamHandlerRole.addToPolicy(
      new PolicyStatement({
        effect: Effect.ALLOW,
        actions: [
          'dynamodb:DescribeStream',
          'dynamodb:GetRecords',
          'dynamodb:GetShardIterator',
          'dynamodb:ListStreams',
        ],
        resources: [
          // Allow access to tenant-specific DynamoDB streams
          `arn:aws:dynamodb:${region}:${account}:table/${regionStackNamePrefix}${stage}-${appName}-${tenantName}-RequestEventTable/stream/*`,
        ],
      })
    );

    // Create the Lambda function using the optimized factory
    const streamHandlerFunction = createOptimizedLambda({
      scope: this,
      id: `StreamHandler-${tenantName}`,
      functionName: `${regionStackNamePrefix}${stage}-${appName}-${tenantName}-StreamHandler`,
      role: streamHandlerRole,
      entryPath: resolveLambdaEntry(
        'request-state-api/src/handlers/dynamo/request-event-table-stream.ts'
      ),
      handler: 'handler',
      runtime: Runtime.NODEJS_22_X,
      timeout: Duration.minutes(2),
      memorySize: 256,
      vpc: vpcSettings?.vpc ? vpcSettings.vpc : undefined,
      vpcSubnets: vpcSettings?.vpcSubnets ? vpcSettings.vpcSubnets : undefined,
      securityGroups: [...(vpcSettings?.securityGroups || [])],
      environment: {
        STAGE: stage,
        APP_NAME: appName,
        EVENT_BUS_NAME: commonEventBus.eventBusName,
        POWERTOOLS_DEV: stage === 'tech-admin' ? '1' : '0',
        NODE_OPTIONS: '--enable-source-maps',
        SENTRY_RELEASE: sentryRelease,
      },
      bundlingOptions: {
        sourceMap: true,
        minify: false,
        target: 'ES2022',
        keepNames: true,
      },
    });

    console.log(
      `Created RequestEventStreamHandler Lambda function for tenant ${tenantName}: ${streamHandlerFunction.functionArn}`
    );

    return streamHandlerFunction;
  }

  private createTenantEventTable(
    stage: RisksmartStage,
    appName: string,
    tenantName: string,
    regionStackNamePrefix: string,
    envSettings: EnvSettings,
    streamHandlerFunction: IFunction
  ): Table {
    const eventTable = new Table(
      this,
      `${stage}-${appName}-${tenantName}-RequestEventTable`,
      {
        tableName: `${regionStackNamePrefix}${stage}-${appName}-${tenantName}-RequestEventTable`,
        partitionKey: { name: '_id', type: AttributeType.STRING },
        sortKey: { name: '_rng', type: AttributeType.STRING },
        billingMode: BillingMode.PAY_PER_REQUEST,
        removalPolicy: envSettings.requestEventDynamoRemovalPolicy,
        stream: StreamViewType.NEW_AND_OLD_IMAGES,
      }
    );

    // Configure DynamoDB stream to trigger the Lambda function
    new EventSourceMapping(this, `EventSourceMapping-${tenantName}`, {
      target: streamHandlerFunction,
      eventSourceArn: eventTable.tableStreamArn!,
      startingPosition: StartingPosition.LATEST,
      batchSize: 1,
      retryAttempts: 3,
    });

    console.log(
      `DynamoDB stream for tenant ${tenantName} successfully connected to RequestEventStreamHandler Lambda.`
    );

    return eventTable;
  }
}
