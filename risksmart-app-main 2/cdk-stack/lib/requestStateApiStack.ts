import type { StackProps } from 'aws-cdk-lib';
import { Duration, Stack, Tags } from 'aws-cdk-lib';
import {
  AuthorizationType,
  EndpointType,
  LambdaIntegration,
  RestApi,
} from 'aws-cdk-lib/aws-apigateway';
import type {
  IInterfaceVpcEndpoint,
  ISecurityGroup,
  IVpc,
} from 'aws-cdk-lib/aws-ec2';
import { SecurityGroup, SubnetType } from 'aws-cdk-lib/aws-ec2';
import type { EventBus } from 'aws-cdk-lib/aws-events';
import { Rule } from 'aws-cdk-lib/aws-events';
import { LambdaFunction } from 'aws-cdk-lib/aws-events-targets';
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
import { Queue } from 'aws-cdk-lib/aws-sqs';
import { StringParameter } from 'aws-cdk-lib/aws-ssm';
import type { Construct } from 'constructs';
import * as path from 'path';

import type { LocalAppProps } from '../bin/cdk-stack';

const isLocal = (stage: string) =>
  !['dev-cloud', 'staging', 'prod'].includes(stage);

export interface RequestStateApiStackProps extends LocalAppProps {
  commonEventBus: EventBus;
  vpc?: IVpc;
  apiGatewayVpcEndpoint?: IInterfaceVpcEndpoint;
}

export interface RequestStateApiConfig {
  sentryRelease: string;
  /** Number of provisioned concurrent executions for RequestHandler. Set to 0 or omit to disable. */
  requestHandlerProvisionedConcurrency: number;
  /** Number of provisioned concurrent executions for InitiateRequestHandler. Set to 0 or omit to disable. */
  initiateRequestHandlerProvisionedConcurrency: number;
}

export class RequestStateApiStack extends Stack {
  public readonly requestHandler: IFunction;
  public readonly getRequestStateHandler: IFunction;
  public readonly initiateRequestHandler: IFunction;
  public readonly api: RestApi;
  public readonly requestHandlerDlq: Queue;
  public readonly requestStateEventBridgeDlq: Queue;
  private readonly config: RequestStateApiConfig;

  constructor(
    scope: Construct,
    id: string,
    props: RequestStateApiStackProps,
    stackProps: StackProps,
    config: RequestStateApiConfig
  ) {
    super(scope, id, stackProps);
    this.config = config;

    this.requestHandlerDlq = this.createRequestHandlerDlq(props);
    this.requestStateEventBridgeDlq =
      this.createRequestStateEventBridgeDlq(props);

    // Create Lambda function from the request handler
    this.requestHandler = this.createRequestHandler(props);

    // Create GET request state Lambda function
    this.getRequestStateHandler = this.createGetRequestStateHandler(props);

    // Create POST initiate request Lambda function
    this.initiateRequestHandler = this.createInitiateRequestHandler(props);

    // Create API Gateway
    this.api = this.createApiGateway(props);

    // Create EventBridge rule to trigger Lambda
    this.createEventBridgeRule(props);

    // Add stack outputs
    this.addStackOutputs(props);
  }

  private createRequestHandlerDlq(props: RequestStateApiStackProps): Queue {
    return new Queue(this, 'RequestHandlerDlq', {
      queueName: `${props.stage}-${props.appName}-request-state-handler-dlq`,
      retentionPeriod: Duration.days(4),
    });
  }

  private createRequestStateEventBridgeDlq(
    props: RequestStateApiStackProps
  ): Queue {
    return new Queue(this, 'RequestStateEventBridgeDlq', {
      queueName: `${props.stage}-${props.appName}-request-state-eventbridge-dlq`,
      retentionPeriod: Duration.days(4),
    });
  }

  private createRequestHandler(props: RequestStateApiStackProps): IFunction {
    // For local/dev environments, skip VPC configuration (not supported locally)
    const shouldUseVpc =
      props.vpc &&
      ['app', 'prod', 'staging', 'dev-cloud'].includes(props.stage);

    // Create execution role for the Lambda function
    const executionRole = new Role(this, 'RequestHandlerExecutionRole', {
      assumedBy: new ServicePrincipal('lambda.amazonaws.com'),
      managedPolicies: [
        // Use VPC execution role if VPC is provided, otherwise basic execution role
        ManagedPolicy.fromAwsManagedPolicyName(
          shouldUseVpc
            ? 'service-role/AWSLambdaVPCAccessExecutionRole'
            : 'service-role/AWSLambdaBasicExecutionRole'
        ),
      ],
    });

    // Add additional permissions as needed
    executionRole.addToPolicy(
      new PolicyStatement({
        effect: Effect.ALLOW,
        actions: [
          'dynamodb:GetItem',
          'dynamodb:PutItem',
          'dynamodb:UpdateItem',
          'dynamodb:DeleteItem',
          'dynamodb:Query',
          'dynamodb:Scan',
          'dynamodb:BatchGetItem',
          'dynamodb:BatchWriteItem',
        ],
        resources: [
          // Allow access to all tenant-specific RequestEventTable tables
          `arn:aws:dynamodb:${this.region}:${this.account}:table/${props.riskSmartRegionProps.regionStackNamePrefix}${props.stage}-${props.appName}-*-RequestEventTable`,
        ],
      })
    );

    // Create CloudWatch Log Group
    const logGroup = new LogGroup(this, 'RequestHandlerLogGroup', {
      logGroupName: `/aws/lambda/${props.stage}-${props.appName}-request-state-handler`,
      retention: RetentionDays.THREE_MONTHS,
    });

    // Create security group for Lambda function (if VPC is provided)
    let securityGroups: ISecurityGroup[] | undefined;
    if (shouldUseVpc) {
      const lambdaSecurityGroup = new SecurityGroup(
        this,
        'RequestHandlerSecurityGroup',
        {
          vpc: props.vpc!,
          description: 'Security group for Request Handler Lambda function',
          allowAllOutbound: true,
        }
      );
      securityGroups = [lambdaSecurityGroup];
    }

    // Create the Lambda function
    const lambda = new NodejsFunction(this, 'RequestHandler', {
      functionName: `${props.stage}-${props.appName}-request-state-handler`,
      runtime: Runtime.NODEJS_22_X,
      timeout: Duration.minutes(5),
      memorySize: 512,
      role: executionRole,
      logGroup,
      deadLetterQueue: this.requestHandlerDlq,
      vpc: shouldUseVpc ? props.vpc : undefined,
      vpcSubnets: shouldUseVpc
        ? {
            subnetType: SubnetType.PRIVATE_ISOLATED,
          }
        : undefined,
      securityGroups,
      entry: path.join(
        __dirname,
        '../../services/request-state-api/src/handlers/events/request-handler.ts'
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
        externalModules: [
          '@aws-sdk/*', // External AWS SDK v3 modules
        ],
      },
      environment: {
        NODE_ENV: props.stage === 'app' ? 'production' : 'development',
        STAGE: props.stage,
        APP_NAME: props.appName,
        POWERTOOLS_DEV: props.stage === 'tech-admin' ? '1' : '0',
        NODE_OPTIONS: '--enable-source-maps',
        TENANT_REQUEST_EVENT_TABLE_NAME: `RequestEventTable`,
        SENTRY_RELEASE: this.config.sentryRelease,
      },
    });

    // If provisioned concurrency is configured, create an alias with it
    const provisionedConcurrency =
      this.config.requestHandlerProvisionedConcurrency;
    if (provisionedConcurrency && provisionedConcurrency > 0) {
      const alias = new Alias(this, 'RequestHandlerAlias', {
        aliasName: 'live',
        version: lambda.currentVersion,
        provisionedConcurrentExecutions: provisionedConcurrency,
      });

      return alias;
    }

    return lambda;
  }

  private createGetRequestStateHandler(
    props: RequestStateApiStackProps
  ): IFunction {
    // For local/dev environments, skip VPC configuration (not supported locally)
    const shouldUseVpc =
      props.vpc &&
      ['app', 'prod', 'staging', 'dev-cloud'].includes(props.stage);

    // Create execution role for the Lambda function
    const executionRole = new Role(
      this,
      'GetRequestStateHandlerExecutionRole',
      {
        assumedBy: new ServicePrincipal('lambda.amazonaws.com'),
        managedPolicies: [
          // Use VPC execution role if VPC is provided, otherwise basic execution role
          ManagedPolicy.fromAwsManagedPolicyName(
            shouldUseVpc
              ? 'service-role/AWSLambdaVPCAccessExecutionRole'
              : 'service-role/AWSLambdaBasicExecutionRole'
          ),
        ],
      }
    );

    // Add DynamoDB permissions
    executionRole.addToPolicy(
      new PolicyStatement({
        effect: Effect.ALLOW,
        actions: ['dynamodb:GetItem', 'dynamodb:Query'],
        resources: [
          // Allow access to all tenant-specific RequestEventTable tables
          `arn:aws:dynamodb:${this.region}:${this.account}:table/${props.riskSmartRegionProps.regionStackNamePrefix}${props.stage}-${props.appName}-*-RequestEventTable`,
        ],
      })
    );

    // Create CloudWatch Log Group
    const logGroup = new LogGroup(this, 'GetRequestStateHandlerLogGroup', {
      logGroupName: `/aws/lambda/${props.stage}-${props.appName}-get-request-state-handler`,
      retention: RetentionDays.THREE_MONTHS,
    });

    // Create security group for Lambda function (if VPC is provided)
    let securityGroups: ISecurityGroup[] | undefined;
    if (shouldUseVpc) {
      const lambdaSecurityGroup = new SecurityGroup(
        this,
        'GetRequestStateHandlerSecurityGroup',
        {
          vpc: props.vpc!,
          description:
            'Security group for Get Request State Handler Lambda function',
          allowAllOutbound: true,
        }
      );
      securityGroups = [lambdaSecurityGroup];
    }

    // Create the Lambda function
    const lambda = new NodejsFunction(this, 'GetRequestStateHandler', {
      functionName: `${props.stage}-${props.appName}-get-request-state-handler`,
      runtime: Runtime.NODEJS_22_X,
      timeout: Duration.seconds(30),
      memorySize: 256,
      role: executionRole,
      logGroup,
      vpc: shouldUseVpc ? props.vpc : undefined,
      vpcSubnets: shouldUseVpc
        ? {
            subnetType: SubnetType.PRIVATE_ISOLATED,
          }
        : undefined,
      securityGroups,
      entry: path.join(
        __dirname,
        '../../services/request-state-api/src/handlers/http/request-state/get.ts'
      ),
      handler: 'handler',
      architecture: Architecture.ARM_64,
      bundling: {
        target: 'ES2022',
        minify: true,
        sourceMap: true,
        externalModules: [
          '@aws-sdk/*', // External AWS SDK v3 modules
        ],
      },
      environment: {
        NODE_ENV: props.stage === 'app' ? 'production' : 'development',
        STAGE: props.stage,
        APP_NAME: props.appName,
        POWERTOOLS_DEV: props.stage === 'tech-admin' ? '1' : '0',
        NODE_OPTIONS: '--enable-source-maps',
        TENANT_REQUEST_EVENT_TABLE_NAME: `RequestEventTable`,
        SENTRY_RELEASE: this.config.sentryRelease,
      },
    });

    return lambda;
  }

  private createInitiateRequestHandler(
    props: RequestStateApiStackProps
  ): IFunction {
    // For local/dev environments, skip VPC configuration (not supported locally)
    const shouldUseVpc =
      props.vpc &&
      ['app', 'prod', 'staging', 'dev-cloud'].includes(props.stage);

    // Create execution role for the Lambda function
    const executionRole = new Role(
      this,
      'InitiateRequestHandlerExecutionRole',
      {
        assumedBy: new ServicePrincipal('lambda.amazonaws.com'),
        managedPolicies: [
          // Use VPC execution role if VPC is provided, otherwise basic execution role
          ManagedPolicy.fromAwsManagedPolicyName(
            shouldUseVpc
              ? 'service-role/AWSLambdaVPCAccessExecutionRole'
              : 'service-role/AWSLambdaBasicExecutionRole'
          ),
        ],
      }
    );

    // Add DynamoDB permissions (same as request handler - needs write access)
    executionRole.addToPolicy(
      new PolicyStatement({
        effect: Effect.ALLOW,
        actions: [
          'dynamodb:GetItem',
          'dynamodb:PutItem',
          'dynamodb:UpdateItem',
          'dynamodb:Query',
          'dynamodb:BatchGetItem',
          'dynamodb:BatchWriteItem',
        ],
        resources: [
          // Allow access to all tenant-specific RequestEventTable tables
          `arn:aws:dynamodb:${this.region}:${this.account}:table/${props.riskSmartRegionProps.regionStackNamePrefix}${props.stage}-${props.appName}-*-RequestEventTable`,
        ],
      })
    );

    // Create CloudWatch Log Group
    const logGroup = new LogGroup(this, 'InitiateRequestHandlerLogGroup', {
      logGroupName: `/aws/lambda/${props.stage}-${props.appName}-initiate-request-handler`,
      retention: RetentionDays.THREE_MONTHS,
    });

    // Create security group for Lambda function (if VPC is provided)
    let securityGroups: ISecurityGroup[] | undefined;
    if (shouldUseVpc) {
      const lambdaSecurityGroup = new SecurityGroup(
        this,
        'InitiateRequestHandlerSecurityGroup',
        {
          vpc: props.vpc!,
          description:
            'Security group for Initiate Request Handler Lambda function',
          allowAllOutbound: true,
        }
      );
      securityGroups = [lambdaSecurityGroup];
    }

    // Create the Lambda function
    const lambda = new NodejsFunction(this, 'InitiateRequestHandler', {
      functionName: `${props.stage}-${props.appName}-initiate-request-handler`,
      runtime: Runtime.NODEJS_22_X,
      timeout: Duration.seconds(30),
      memorySize: 1024,
      role: executionRole,
      logGroup,
      vpc: shouldUseVpc ? props.vpc : undefined,
      vpcSubnets: shouldUseVpc
        ? {
            subnetType: SubnetType.PRIVATE_ISOLATED,
          }
        : undefined,
      securityGroups,
      entry: path.join(
        __dirname,
        '../../services/request-state-api/src/handlers/http/request-state/post.ts'
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
        externalModules: [
          '@aws-sdk/*', // External AWS SDK v3 modules
        ],
      },
      environment: {
        NODE_ENV: props.stage === 'app' ? 'production' : 'development',
        STAGE: props.stage,
        APP_NAME: props.appName,
        POWERTOOLS_DEV: props.stage === 'tech-admin' ? '1' : '0',
        NODE_OPTIONS: '--enable-source-maps',
        TENANT_REQUEST_EVENT_TABLE_NAME: `RequestEventTable`,
        SENTRY_RELEASE: this.config.sentryRelease,
      },
    });

    // If provisioned concurrency is configured, create an alias with it
    const provisionedConcurrency =
      this.config.initiateRequestHandlerProvisionedConcurrency;
    if (provisionedConcurrency && provisionedConcurrency > 0) {
      const alias = new Alias(this, 'InitiateRequestHandlerAlias', {
        aliasName: 'live',
        version: lambda.currentVersion,
        provisionedConcurrentExecutions: provisionedConcurrency,
      });

      return alias;
    }

    return lambda;
  }

  private createApiGateway(props: RequestStateApiStackProps): RestApi {
    const shouldUsePrivateApi =
      props.vpc &&
      props.apiGatewayVpcEndpoint &&
      ['app', 'prod', 'staging', 'dev-cloud'].includes(props.stage);

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

    const api = new RestApi(this, 'RequestStateInternalApi', {
      restApiName: `${props.stage}-${props.appName}-request-state-internal-api`,
      description: 'API for retrieving async request state',
      // Configure as private API Gateway when VPC endpoint is available
      endpointTypes: shouldUsePrivateApi
        ? [EndpointType.PRIVATE]
        : [EndpointType.REGIONAL],
      ...(shouldUsePrivateApi && {
        policy: apiPolicy,
      }),
      deployOptions: {
        stageName: props.stage,
        throttlingRateLimit: 100,
        throttlingBurstLimit: 200,
      },
      defaultMethodOptions: {
        authorizationType: AuthorizationType.IAM,
      },
    });

    if (isLocal(props.stage)) {
      Tags.of(api).add('_custom_id_', 'request_state');
    }

    // Create Lambda integration with proxy enabled for GET
    const getIntegration = new LambdaIntegration(this.getRequestStateHandler, {
      proxy: true,
    });

    // Create Lambda integration with proxy enabled for POST
    const postIntegration = new LambdaIntegration(this.initiateRequestHandler, {
      proxy: true,
    });

    // Create resource structure: /request/{correlationId} for GET (tenant from x-tenant header)
    // and /request for POST (all context from headers)
    const requestResource = api.root.addResource('request');
    const correlationIdResource =
      requestResource.addResource('{correlationId}');

    // Add GET method for retrieving request state
    // GET /request/{correlationId} (tenant from x-tenant header)
    correlationIdResource.addMethod('GET', getIntegration);

    // Add POST method for initiating async requests
    // POST /request (tenant, orgKey, userId, correlationId, domain, service from headers)
    requestResource.addMethod('POST', postIntegration);

    return api;
  }

  private createEventBridgeRule(props: RequestStateApiStackProps): void {
    const eventRule = new Rule(this, 'RequestStateEventRule', {
      ruleName: `${props.stage}-${props.appName}-request-state-events`,
      description: 'Route events to request state handler',
      eventBus: props.commonEventBus,
      eventPattern: {
        source: [
          'risksmart.app',
          'risksmart.data-layer',
          'risksmart.permissions',
        ],
      },
    });

    eventRule.addTarget(
      new LambdaFunction(this.requestHandler, {
        deadLetterQueue: this.requestStateEventBridgeDlq,
        retryAttempts: 3,
      })
    );
  }

  /**
   * Add stack outputs for API endpoints
   */
  private addStackOutputs(props: RequestStateApiStackProps): void {
    // Always output the API Gateway URL
    this.exportValue(this.api.url, {
      name: `${props.stage}-${props.appName}-RequestStateApiUrl`,
    });

    // Write API URL to SSM Parameter Store for service discovery
    new StringParameter(this, 'RequestStateApiUrlParameter', {
      parameterName: `/${props.stage}/${props.appName}/api/request-state/url`,
      stringValue: this.api.url,
      description: `[${props.stage}] Internal API URL for the Request State API service`,
    });
  }
}
