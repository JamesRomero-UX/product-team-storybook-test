import type { StackProps } from 'aws-cdk-lib';
import { Duration, Stack, Tags } from 'aws-cdk-lib';
import type { SecurityGroup, Vpc } from 'aws-cdk-lib/aws-ec2';
import { Port } from 'aws-cdk-lib/aws-ec2';
import type { Cluster, ContainerDefinitionOptions } from 'aws-cdk-lib/aws-ecs';
import {
  ContainerImage,
  CpuArchitecture,
  FargateService,
  FargateTaskDefinition,
  LogDrivers,
  Protocol,
  Secret,
} from 'aws-cdk-lib/aws-ecs';
import type { ApplicationListener } from 'aws-cdk-lib/aws-elasticloadbalancingv2';
import {
  ApplicationListenerRule,
  ApplicationProtocol,
  ApplicationTargetGroup,
  ListenerAction,
  ListenerCondition,
} from 'aws-cdk-lib/aws-elasticloadbalancingv2';
import { Effect, PolicyStatement } from 'aws-cdk-lib/aws-iam';
import { RetentionDays } from 'aws-cdk-lib/aws-logs';
import type { IDatabaseCluster } from 'aws-cdk-lib/aws-rds';
import type { ISecret } from 'aws-cdk-lib/aws-secretsmanager';
import { StringParameter } from 'aws-cdk-lib/aws-ssm';
import type { Construct } from 'constructs';

import type { LocalAppProps } from '../bin/cdk-stack';
import type { EnvSettings, TenantSettings } from './env';
import { getEnvSettings } from './env';
import type { TenantStackProps } from './tenantStack';

interface TenantHasuraStackProps {
  escCluster: Cluster;
  vpc: Vpc;
  hasuraEcsSG: SecurityGroup;
  hasuraHttpsListener: ApplicationListener;
  databaseConnectionSecret: ISecret;
  databaseCluster: IDatabaseCluster;
}

/**
 * Hasura Fargate service
 */
export class TenantHasuraStack extends Stack {
  private envSettings: EnvSettings;
  private hasuraTaskDefinition: FargateTaskDefinition;

  constructor(
    scope: Construct,
    id: string,
    private props: LocalAppProps,
    stackProps: StackProps,
    private tenant: TenantSettings,
    private tenantStackProps: TenantStackProps,
    private tenantHasuraStacksProps: TenantHasuraStackProps
  ) {
    super(scope, id, stackProps);

    this.envSettings = getEnvSettings(props.stage);

    this.hasuraTaskDefinition = this.createHasuraTaskDefinition();
    this.createHasuraFargateService();

    Tags.of(this).add('customers', this.tenant.customers.join('/'));
  }

  private getParameterStoreName(stage: string, name: string) {
    return `/sst/risksmart-app/${
      stage === 'app' ? 'prod' : stage
    }/Secret/${name}/value`;
  }

  private getContainerDefinitionOptions(): ContainerDefinitionOptions {
    return {
      readonlyRootFilesystem: true,
      portMappings: [
        {
          containerPort: this.tenant.containerPort,
          protocol: Protocol.TCP,
        },
      ],
      cpu: 1024,
      memoryLimitMiB: 2048,
      image: ContainerImage.fromRegistry(
        `437474201705.dkr.ecr.${this.region}.amazonaws.com/${
          this.envSettings.hasuraEcrRepoName
        }:v2.48.11`
      ),
      logging: LogDrivers.awsLogs({
        streamPrefix: this.tenant.name,
        logRetention: RetentionDays.TWO_YEARS,
      }),
      environment: {
        TENANT: this.tenant.name,
        HASURA_GRAPHQL_ENVIRONMENT: `${this.props.stage}`,
        HASURA_GRAPHQL_ENABLE_CONSOLE:
          this.tenantStackProps.hasuraEnableConsole,
        HASURA_GRAPHQL_PG_CONNECTIONS:
          this.tenantStackProps.hasuraPgConnections.toString(),
        HASURA_GRAPHQL_LOG_LEVEL: this.tenantStackProps.hasuraLogLevel,
        HASURA_GRAPHQL_JWT_SECRET: `${this.tenantStackProps.jwtSecret.toString()}`,
        HASURA_GRAPHQL_ENABLE_REMOTE_SCHEMA_PERMISSIONS: 'true',
        HASURA_GRAPHQL_ENABLED_LOG_TYPES:
          'startup, http-log, webhook-log, websocket-log, jwk-refresh-log, action-handler-log, data-connector-log, query-log',
        REST_API_DOMAIN: this.tenantStackProps.restApiDomain,
      },
      secrets: {
        HASURA_GRAPHQL_DATABASE_URL: Secret.fromSecretsManager(
          this.tenantHasuraStacksProps.databaseConnectionSecret
        ),
        HASURA_GRAPHQL_ADMIN_SECRET: Secret.fromSecretsManager(
          this.tenantStackProps.hasuraAdminSecret
        ),
        REST_API_KEY: Secret.fromSsmParameter(
          StringParameter.fromSecureStringParameterAttributes(
            this,
            `${this.tenant.name}-RestApiKeyParameter`,
            {
              parameterName: this.getParameterStoreName(
                this.props.stage,
                'REST_API_KEY'
              ),
            }
          )
        ),
      },
      healthCheck: {
        command: [
          'CMD-SHELL',
          'curl -f http://localhost:8080/healthz || exit 1',
        ],
        interval: Duration.seconds(30),
        timeout: Duration.seconds(5),
        retries: 3,
        ...this.envSettings.hasuraHealthCheck,
      },
      ...this.envSettings.hasuraContainerSettings,
    };
  }

  private createHasuraTaskDefinition() {
    const taskDefinition = new FargateTaskDefinition(
      this,
      `${this.props.stage}-${this.props.appName}-${this.tenant.name}-HasuraTaskDefinition`,
      {
        cpu: 1024,
        memoryLimitMiB: 2048,
        runtimePlatform: {
          cpuArchitecture: CpuArchitecture.ARM64,
        },
        ...this.envSettings.hasuraTaskSettings,
      }
    );
    taskDefinition.addContainer(
      this.tenant.name,
      this.getContainerDefinitionOptions()
    );
    const ecrPolicyStatement = new PolicyStatement({
      effect: Effect.ALLOW,
      actions: [
        'ecr:BatchGetImage',
        'ecr:GetDownloadUrlForLayer',
        'ecr:BatchCheckLayerAvailability',
        'ecr:GetAuthorizationToken',
      ],
      // Hardcoded to CI account ID
      resources: [
        `arn:aws:ecr:${this.region}:437474201705:repository/${
          this.envSettings.hasuraEcrRepoName
        }`,
      ],
    });
    const getAuthorizationTokenStatement = new PolicyStatement({
      effect: Effect.ALLOW,
      actions: ['ecr:GetAuthorizationToken'],
      resources: ['*'],
    });
    taskDefinition.addToExecutionRolePolicy(getAuthorizationTokenStatement);
    taskDefinition.addToExecutionRolePolicy(ecrPolicyStatement);

    return taskDefinition;
  }

  private createHasuraFargateService() {
    const hasuraFargateService = new FargateService(
      this,
      `${this.props.stage}-${this.props.appName}-${this.tenant.name}-HasuraFargateService`,
      {
        cluster: this.tenantHasuraStacksProps.escCluster,
        taskDefinition: this.hasuraTaskDefinition,
        desiredCount: this.tenant.hasuraDesiredTaskCount ?? 1,
        securityGroups: [this.tenantHasuraStacksProps.hasuraEcsSG],
        assignPublicIp: false,
        enableExecuteCommand: true,
        serviceName: `${this.props.riskSmartRegionProps.regionStackNamePrefix}${this.props.stage}-${this.props.appName}-${this.tenant.name}-HasuraFargateService`,
      }
    );

    const targetGroup = new ApplicationTargetGroup(
      this,
      `${this.tenant.name}-TargetGroup`,
      {
        targetGroupName: `${this.props.riskSmartRegionProps.regionStackNamePrefix}${this.tenant.name}-HasuraTG`,
        targets: [hasuraFargateService],
        protocol: ApplicationProtocol.HTTP,
        vpc: this.tenantHasuraStacksProps.vpc,
        port: 80,
        deregistrationDelay: Duration.seconds(30),
        healthCheck: {
          enabled: true,
          path: '/healthz',
          healthyHttpCodes: '200',
          healthyThresholdCount: 2,
          unhealthyThresholdCount: 3,
          interval: Duration.seconds(10),
          timeout: Duration.seconds(5),
        },
      }
    );

    new ApplicationListenerRule(
      this,
      `${this.props.stage}-${this.props.appName}-${this.tenant.name}-HasuraHttpsListenerRule`,
      {
        listener: this.tenantHasuraStacksProps.hasuraHttpsListener,
        priority: this.tenant.albPriority,
        action: ListenerAction.forward([targetGroup]),
        conditions: [
          ListenerCondition.httpHeader('x-tenant-name', [
            this.tenant.name.toLowerCase(),
          ]),
        ],
      }
    );

    const scaling = hasuraFargateService.autoScaleTaskCount({
      maxCapacity: this.tenant.hasuraMaxTaskCount ?? 5,
      minCapacity: this.tenant.hasuraMinTaskCount ?? 1,
    });

    scaling.scaleOnCpuUtilization('CpuScaling', {
      targetUtilizationPercent: 50,
      scaleInCooldown: Duration.seconds(300),
      scaleOutCooldown: Duration.seconds(120),
    });

    this.tenantHasuraStacksProps.databaseCluster.connections.allowFrom(
      hasuraFargateService,
      new Port({
        protocol: Protocol.TCP,
        stringRepresentation: 'Postgres Port',
        fromPort: 5432,
        toPort: 5432,
      })
    );
  }
}
