import type { StackProps } from 'aws-cdk-lib';
import { Stack, Tags } from 'aws-cdk-lib';
import {
  AccessLogFormat,
  AuthorizationType,
  EndpointType,
  LambdaIntegration,
  LogGroupLogDestination,
  MethodLoggingLevel,
  RestApi,
} from 'aws-cdk-lib/aws-apigateway';
import type { IInterfaceVpcEndpoint, IVpc } from 'aws-cdk-lib/aws-ec2';
import {
  AnyPrincipal,
  Effect,
  PolicyDocument,
  PolicyStatement,
} from 'aws-cdk-lib/aws-iam';
import type { IFunction } from 'aws-cdk-lib/aws-lambda';
import { LogGroup, RetentionDays } from 'aws-cdk-lib/aws-logs';
import { StringParameter } from 'aws-cdk-lib/aws-ssm';
import type { LocalAppProps } from 'bin/cdk-stack';
import type { Construct } from 'constructs';
import * as path from 'path';

import { RisksmartFunction } from './constructs/risksmartFunction';

const isLocal = (stage: string) =>
  !['dev-cloud', 'staging', 'prod'].includes(stage);

export interface AiFeedbackIngestionStackProps extends LocalAppProps {
  sentryRelease: string;
  vpc?: IVpc;
  apiGatewayVpcEndpoint?: IInterfaceVpcEndpoint;
}

export class AiFeedbackIngestionStack extends Stack {
  private readonly relativeHandlerDirectoryPath =
    '../../services/ai-feedback-ingestion/src/handlers' as const;

  public readonly ingestionLambda: IFunction;
  public readonly restApi: RestApi;

  constructor(
    scope: Construct,
    id: string,
    stackProps: StackProps,
    props: AiFeedbackIngestionStackProps
  ) {
    super(scope, id, stackProps);

    const { lambda: ingestionLambda } =
      this.createAiFeedbackIngestionHandler(props);
    this.ingestionLambda = ingestionLambda;
    this.restApi = this.createRestApiGateway(props);

    // Write API URL to SSM Parameter Store for service discovery
    new StringParameter(this, 'AiFeedbackIngestionApiUrlParameter', {
      parameterName: `/${props.stage}/${props.appName}/api/ai-feedback-ingestion/url`,
      stringValue: this.restApi.url,
      description: `[${props.stage}] API URL for the AI Feedback Ingestion service`,
    });

    this.addStackOutputs(props);
  }

  private createAiFeedbackIngestionHandler = (
    props: AiFeedbackIngestionStackProps
  ): RisksmartFunction => {
    const ssmParamName = `/${props.stage}/${props.appName}/ai-feedback/langsmith`;

    const fn = new RisksmartFunction(this, 'AiFeedbackIngestionHandler', {
      ...props,
      entry: path.join(
        __dirname,
        this.relativeHandlerDirectoryPath,
        'ingest-ai-feedback/index.ts'
      ),
      functionName: 'ingest-ai-feedback',
      environment: {
        SENTRY_RELEASE: props.sentryRelease,
        AI_FEEDBACK_LANGSMITH_CONFIG_PARAM_NAME: ssmParamName,
        DELIVERY_STREAM_PREFIX: `${props.riskSmartRegionProps.regionStackNamePrefix}${props.stage}-${props.appName}`,
      },
    });

    // Grant SSM parameter read access for LangSmith config
    fn.lambda.addToRolePolicy(
      new PolicyStatement({
        actions: ['ssm:GetParameter'],
        resources: [
          `arn:aws:ssm:${this.region}:${this.account}:parameter${ssmParamName}`,
        ],
      })
    );

    // Grant Firehose permissions to write to all tenant feedback streams
    // Stream naming convention: ${regionPrefix}${stage}-${appName}-${tenantName}-ai-feedback
    fn.lambda.addToRolePolicy(
      new PolicyStatement({
        actions: [
          'firehose:PutRecord',
          'firehose:PutRecordBatch',
          'firehose:DescribeDeliveryStream',
        ],
        resources: [
          `arn:aws:firehose:${this.region}:${this.account}:deliverystream/*-ai-feedback`,
        ],
      })
    );

    return fn;
  };

  private createRestApiGateway(props: AiFeedbackIngestionStackProps): RestApi {
    const shouldUsePrivateApi =
      props.vpc &&
      props.apiGatewayVpcEndpoint &&
      ['app', 'prod', 'staging', 'dev-cloud'].includes(props.stage);

    const apiAccessLogGroup = new LogGroup(
      this,
      'AiFeedbackIngestionApiAccessLog',
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

    const api = new RestApi(this, 'AiFeedbackIngestionRestApi', {
      restApiName: `${props.stage}-${props.appName}-ai-feedback-ingestion-api`,
      description: 'REST API for AI feedback ingestion',
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
      Tags.of(api).add('_custom_id_', 'ai_feedback_ingestion');
    }

    const integration = new LambdaIntegration(this.ingestionLambda, {
      proxy: true,
    });

    // POST /feedback - Ingest AI feedback
    const feedbackResource = api.root.addResource('feedback');
    feedbackResource.addMethod('POST', integration);

    return api;
  }

  private addStackOutputs(props: AiFeedbackIngestionStackProps): void {
    this.exportValue(this.restApi.url, {
      name: `${props.stage}-${props.appName}-AiFeedbackIngestionApiUrl`,
    });
  }
}
