import type { FireLensLogDriver, TaskDefinition } from 'aws-cdk-lib/aws-ecs';
import {
  ContainerImage,
  FirelensLogRouterType,
  LogDrivers,
  Protocol,
} from 'aws-cdk-lib/aws-ecs';
import { RetentionDays } from 'aws-cdk-lib/aws-logs';

export interface DatadogConfig {
  datadogPublicKey: string;
}

export interface DatadogServiceParams {
  stage: string;
  appName: string;
  serviceName: string;
}

export function addFireLensLogging(
  params: DatadogServiceParams,
  config: DatadogConfig,
  taskDefinition: TaskDefinition,
  version?: string
): FireLensLogDriver {
  // Add FireLens log router
  taskDefinition.addFirelensLogRouter('log-router', {
    image: ContainerImage.fromRegistry('amazon/aws-for-fluent-bit:stable'),
    firelensConfig: {
      type: FirelensLogRouterType.FLUENTBIT,
    },
    essential: false, // App continues if logging fails
    portMappings: [
      {
        containerPort: 24224,
        protocol: Protocol.TCP,
      },
    ],
    memoryReservationMiB: 50,
    logging: LogDrivers.awsLogs({
      streamPrefix: `${params.stage}-${params.appName}-${params.serviceName}-firelens`,
      logRetention: RetentionDays.ONE_WEEK,
    }),
  });

  // Return the log driver for use in containers
  return LogDrivers.firelens({
    options: {
      Name: 'datadog',
      Host: 'http-intake.logs.datadoghq.eu',
      TLS: 'on',
      dd_service: params.serviceName,
      dd_source: 'nodejs',
      dd_tags: `env:${params.stage},version:${version || 'unknown'}`,
      provider: 'ecs',
      apikey: config.datadogPublicKey,
    },
  });
}

export function addDatadogAgent(
  params: DatadogServiceParams,
  config: DatadogConfig,
  taskDefinition: TaskDefinition
): void {
  taskDefinition.addContainer('DDAgent', {
    containerName: 'datadog-agent',
    essential: false,
    image: ContainerImage.fromRegistry('public.ecr.aws/datadog/agent:7'),
    environment: {
      DD_API_KEY: config.datadogPublicKey,
      DD_SITE: 'datadoghq.eu',
      ECS_FARGATE: 'true',
      DD_APM_ENABLED: 'true',
      DD_APM_NON_LOCAL_TRAFFIC: 'true',
      DD_RUNTIME_SECURITY_CONFIG_ENABLED: 'true',
      DD_RUNTIME_SECURITY_CONFIG_REMOTE_CONFIGURATION_ENABLED: 'true',
      DD_LOG_LEVEL: 'WARN',
    },
    cpu: 256,
    memoryLimitMiB: 512,
    logging: LogDrivers.awsLogs({
      streamPrefix: `${params.stage}-${params.appName}-${params.serviceName}-dd-agent`,
      logRetention: RetentionDays.ONE_WEEK,
    }),
  });
}

export function getDatadogEnvVars(
  serviceName: string,
  stage: string,
  version: string
): Record<string, string> {
  return {
    DD_SERVICE: serviceName,
    DD_ENV: stage,
    DD_VERSION: version,
    DD_APPSEC_ENABLED: 'true',
    DD_APM_TRACING_ENABLED: 'true',
    DD_IAST_ENABLED: 'true',
  };
}
