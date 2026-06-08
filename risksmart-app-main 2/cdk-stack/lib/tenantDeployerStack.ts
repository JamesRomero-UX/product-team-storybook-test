import type { StackProps } from 'aws-cdk-lib';
import { RemovalPolicy, Stack } from 'aws-cdk-lib';
import type { ITable } from 'aws-cdk-lib/aws-dynamodb';
import { Table } from 'aws-cdk-lib/aws-dynamodb';
import type { Vpc } from 'aws-cdk-lib/aws-ec2';
import { Peer, Port, SecurityGroup, SubnetType } from 'aws-cdk-lib/aws-ec2';
import type { Cluster } from 'aws-cdk-lib/aws-ecs';
import {
  Compatibility,
  ContainerImage,
  CpuArchitecture,
  FargatePlatformVersion,
  TaskDefinition,
} from 'aws-cdk-lib/aws-ecs';
import {
  Effect,
  PolicyStatement,
  Role,
  ServicePrincipal,
} from 'aws-cdk-lib/aws-iam';
import { LogGroup, RetentionDays } from 'aws-cdk-lib/aws-logs';
import { CfnPipe } from 'aws-cdk-lib/aws-pipes';
import {
  Choice,
  Condition,
  DefinitionBody,
  Fail,
  IntegrationPattern,
  JsonPath,
  Pass,
  StateMachine,
} from 'aws-cdk-lib/aws-stepfunctions';
import {
  DynamoAttributeValue,
  DynamoUpdateItem,
  EcsFargateLaunchTarget,
  EcsRunTask,
} from 'aws-cdk-lib/aws-stepfunctions-tasks';
import {
  AwsCustomResource,
  AwsCustomResourcePolicy,
  PhysicalResourceId,
} from 'aws-cdk-lib/custom-resources';
import type { Construct } from 'constructs';

import type { LocalAppProps } from '../bin/cdk-stack';
import type { DatadogConfig } from './datadog';
import {
  addDatadogAgent,
  addFireLensLogging,
  getDatadogEnvVars,
} from './datadog';
import type { EnvSettings } from './env';
import { getEnvSettings } from './env';

interface TenantDeployerStackProps {
  escCluster: Cluster;
  vpc: Vpc;
}

export interface TenantDeployerConfig extends DatadogConfig {
  tenantDeployerContainerBuild: string;
  sentryRelease: string;
}

export class TenantDeployerStack extends Stack {
  constructor(
    scope: Construct,
    id: string,
    props: LocalAppProps,
    stackProps: StackProps,
    tenantDeployerStackProps: TenantDeployerStackProps,
    tenantDeployerConfig: TenantDeployerConfig
  ) {
    super(scope, id, stackProps);
    const envSettings = getEnvSettings(props.stage);
    const table = this.getDynamoTable(props);

    const tenantDeployerTask = this.createEcsTenantDeployerTask(
      props,
      envSettings,
      stackProps,
      tenantDeployerStackProps,
      tenantDeployerConfig
    );

    const stateMachineDefinition = this.createStateMachineDefinition(
      stackProps,
      table,
      tenantDeployerTask
    );

    const stateMachine = this.createTenantDeploymentStateMachine(
      props,
      stateMachineDefinition
    );

    // Create AWS Pipe to connect DynamoDB stream to Step Function
    this.createDynamoDbStreamPipe(stackProps, table, stateMachine);
  }

  private getDynamoTable(props: LocalAppProps): ITable {
    const table = Table.fromTableName(
      this,
      `${props.stage}-risksmartApp-GlobalTenantConfig`,
      `${props.stage}-risksmartApp-GlobalTenantConfig`
    );

    // Custom resource to get the table stream ARN
    const getTableStreamArn = new AwsCustomResource(this, 'GetTableStreamArn', {
      onUpdate: {
        service: 'DynamoDB',
        action: 'describeTable',
        parameters: {
          TableName: table.tableName,
        },
        physicalResourceId: PhysicalResourceId.of(
          `${table.tableName}-stream-arn`
        ),
      },
      policy: AwsCustomResourcePolicy.fromSdkCalls({
        resources: [table.tableArn],
      }),
    });

    const streamArn = getTableStreamArn.getResponseField(
      'Table.LatestStreamArn'
    );

    return Table.fromTableAttributes(this, 'TenantConfigTable', {
      tableName: table.tableName,
      tableStreamArn: streamArn,
    });
  }

  private createEcsTenantDeployerTask(
    props: LocalAppProps,
    envSettings: EnvSettings,
    stackProps: StackProps,
    tenantDeployerStackProps: TenantDeployerStackProps,
    tenantDeployerConfig: TenantDeployerConfig
  ) {
    const { escCluster, vpc } = tenantDeployerStackProps;
    // Policies for the task execution role.
    // These are the permissions the setup of the task / container will have.
    const ecrPolicyStatement = new PolicyStatement({
      effect: Effect.ALLOW,
      actions: [
        'ecr:BatchGetImage',
        'ecr:GetDownloadUrlForLayer',
        'ecr:BatchCheckLayerAvailability',
        'ecr:GetAuthorizationToken',
      ],
      resources: [
        //THIS NEEDS TO BE HARD CODED TO EU-WEST-2 UNTIL THE PIPELINE IS FIXED
        `arn:aws:ecr:eu-west-2:437474201705:repository/${
          envSettings.tenantDeployerEcrRepoName
        }`,
        'arn:aws:ecr:eu-west-2:892757235363:repository/aws-guardduty-agent-fargate',
        'arn:aws:ecr:ca-central-1:354763396469:repository/aws-guardduty-agent-fargate',
        'arn:aws:ecr:me-central-1:000014521398:repository/aws-guardduty-agent-fargate',
        'arn:aws:ecr:us-east-1:593207742271:repository/aws-guardduty-agent-fargate',
      ],
    });
    const getAuthorizationTokenStatement = new PolicyStatement({
      effect: Effect.ALLOW,
      actions: ['ecr:GetAuthorizationToken'],
      resources: ['*'],
    });

    const serviceName = 'tenantDeployer';

    const processJobTask = new TaskDefinition(this, 'TenantDeploymentTask', {
      compatibility: Compatibility.FARGATE,
      cpu: '2048',
      memoryMiB: '4096',
      runtimePlatform: {
        cpuArchitecture: CpuArchitecture.ARM64,
      },
    });

    // Add FireLens logging before main container
    const fireLensLogDriver = addFireLensLogging(
      { stage: props.stage, appName: props.appName, serviceName },
      tenantDeployerConfig,
      processJobTask,
      tenantDeployerConfig.tenantDeployerContainerBuild
    );

    processJobTask.addContainer('ProcessTenantContainer', {
      image: ContainerImage.fromRegistry(
        `437474201705.dkr.ecr.eu-west-2.amazonaws.com/${
          envSettings.tenantDeployerEcrRepoName
        }:${tenantDeployerConfig.tenantDeployerContainerBuild}`
      ),
      logging: fireLensLogDriver,
      environment: {
        APP_NAME: props.appName,
        APP_NAME_FOR_RS_REGION: props.appName,
        STAGE: props.stage,
        AWS_REGION: stackProps.env!.region!,
        AWS_ACCOUNT_ID: stackProps.env!.account!,
        RISKSMART_REGION:
          props.riskSmartRegionProps.isRiskSmartRegion.toString(),
        RISKSMART_REGION_ID: props.riskSmartRegionProps.id,
        RISKSMART_REGION_PREFIX: props.riskSmartRegionProps.regionDomainPrefix,
        IS_LOCAL: 'false',
        SENTRY_RELEASE: tenantDeployerConfig.sentryRelease,
        VPC_ID: vpc.vpcId,
        PRIVATE_SUBNET_IDS: vpc
          .selectSubnets({ subnetType: SubnetType.PRIVATE_WITH_EGRESS })
          .subnetIds.join(','),
        PUBLIC_SUBNET_IDS: vpc
          .selectSubnets({ subnetType: SubnetType.PUBLIC })
          .subnetIds.join(','),
        ISOLATED_SUBNET_IDS: vpc
          .selectSubnets({ subnetType: SubnetType.PRIVATE_ISOLATED })
          .subnetIds.join(','),
        VPC_CIDR_BLOCK: vpc.vpcCidrBlock,
        AVAILABILITY_ZONES: Array.isArray(vpc.availabilityZones)
          ? vpc.availabilityZones
              .filter((az) => !az.startsWith('fake-az'))
              .join(',')
          : '',
        // Unified Service Tagging
        ...getDatadogEnvVars(
          serviceName,
          props.stage,
          tenantDeployerConfig.tenantDeployerContainerBuild
        ),
      },
    });

    // Add Datadog agent sidecar
    addDatadogAgent(
      { stage: props.stage, appName: props.appName, serviceName },
      tenantDeployerConfig,
      processJobTask
    );

    processJobTask.addToExecutionRolePolicy(getAuthorizationTokenStatement);
    processJobTask.addToExecutionRolePolicy(ecrPolicyStatement);

    // Add permissions for tenant deployments via CDK
    const cdkDeployPolicyStatement = new PolicyStatement({
      effect: Effect.ALLOW,
      actions: ['sts:AssumeRole'],
      resources: [`arn:aws:iam::${stackProps.env!.account!}:role/cdk-*`],
    });
    processJobTask.addToTaskRolePolicy(cdkDeployPolicyStatement);

    // Add EC2 permissions for VPC lookups during CDK synthesis
    const ec2VpcLookupPolicyStatement = new PolicyStatement({
      effect: Effect.ALLOW,
      actions: [
        'ec2:DescribeVpcs',
        'ec2:DescribeSubnets',
        'ec2:DescribeAvailabilityZones',
        'ec2:DescribeSecurityGroups',
        'ec2:DescribeRouteTables',
        'ec2:DescribeNetworkAcls',
        'ec2:DescribeInternetGateways',
        'ec2:DescribeNatGateways',
        'ec2:DescribeVpcEndpoints',
        'ec2:DescribeDhcpOptions',
      ],
      resources: ['*'], // EC2 describe operations require wildcard resources
    });
    processJobTask.addToTaskRolePolicy(ec2VpcLookupPolicyStatement);

    // Create security group for the Fargate task
    const taskSecurityGroup = new SecurityGroup(
      this,
      `${props.stage}-${props.appName}-TenantDeployerTaskSecurityGroup`,
      {
        vpc: vpc,
        description: 'Security group for tenant deployer Fargate task',
      }
    );

    // Restrict outbound HTTPS to only VPC endpoints
    taskSecurityGroup.addEgressRule(
      Peer.ipv4(vpc.vpcCidrBlock),
      Port.tcp(443),
      'Allow outbound HTTPS to VPC endpoints for AWS services only'
    );

    // Allow outbound HTTPS to Datadog (DD agent + FluentBit)
    taskSecurityGroup.addEgressRule(
      Peer.anyIpv4(),
      Port.tcp(443),
      'Allow outbound HTTPS to Datadog'
    );

    return new EcsRunTask(this, 'ProcessTenantJob', {
      cluster: escCluster,
      taskDefinition: processJobTask,
      launchTarget: new EcsFargateLaunchTarget({
        platformVersion: FargatePlatformVersion.VERSION1_4,
      }),
      integrationPattern: IntegrationPattern.RUN_JOB,
      subnets: {
        subnetType: SubnetType.PRIVATE_WITH_EGRESS,
      },
      securityGroups: [taskSecurityGroup],
      containerOverrides: [
        {
          containerDefinition: processJobTask.defaultContainer!,
          environment: [
            {
              name: 'TENANT_NAME',
              value: JsonPath.stringAt('$.tenant'),
            },
          ],
        },
      ],
      resultPath: '$.result',
    });
  }

  private createStateMachineDefinition(
    stackProps: StackProps,
    table: ITable,
    tenantDeployerTask: EcsRunTask
  ): DefinitionBody {
    // Define variables that will be available throughout the state machine
    const regionVariable = JsonPath.stringAt('$.region');
    const pkVariable = JsonPath.stringAt('$.pk');
    const skVariable = JsonPath.stringAt('$.sk');

    const ddbUpdateInProgress = new DynamoUpdateItem(
      this,
      'ddb-start-update-job',
      {
        key: {
          pk: DynamoAttributeValue.fromString(pkVariable),
          sk: DynamoAttributeValue.fromString(skVariable),
        },
        updateExpression: 'SET #state = :state',
        expressionAttributeNames: {
          '#state': 'state',
        },
        expressionAttributeValues: {
          ':state': DynamoAttributeValue.fromString('in-progress'),
        },
        table: table,
        resultPath: JsonPath.DISCARD,
      }
    );

    const ddbUpdateCompleted = new DynamoUpdateItem(
      this,
      'ddb-completed-update-job',
      {
        key: {
          pk: DynamoAttributeValue.fromString(pkVariable),
          sk: DynamoAttributeValue.fromString(skVariable),
        },
        updateExpression: 'REMOVE #state',
        expressionAttributeNames: {
          '#state': 'state',
        },
        table: table,
        resultPath: JsonPath.DISCARD,
      }
    );

    const ddbUpdateFailed = new DynamoUpdateItem(
      this,
      'ddb-failed-update-job',
      {
        key: {
          pk: DynamoAttributeValue.fromString(pkVariable),
          sk: DynamoAttributeValue.fromString(skVariable),
        },
        updateExpression: 'SET #state = :state',
        expressionAttributeNames: {
          '#state': 'state',
        },
        expressionAttributeValues: {
          ':state': DynamoAttributeValue.fromString('failed'),
        },
        table: table,
        resultPath: JsonPath.DISCARD,
      }
    );

    const failState = new Fail(this, 'TenantDeploymentFailed', {
      cause: 'Tenant deployment task failed',
      error: 'DeploymentError',
    });

    const isRegionChoiceStatement = new Choice(
      this,
      'is-region-conditional-choice-block'
    );
    const isRegionCondition = Condition.stringEquals(
      regionVariable,
      stackProps.env!.region!
    );

    // Process array input from EventBridge Pipes and extract first element
    // New key structure: pk = TENANT/tenant-name, sk = "REGION/region"
    // Extract tenant from pk by splitting on '/' and taking the second element
    const processArrayInput = new Pass(this, 'ProcessArrayInput', {
      parameters: {
        'pk.$': '$[0].dynamodb.NewImage.pk.S',
        'sk.$': '$[0].dynamodb.NewImage.sk.S',
        'tenant.$':
          "States.ArrayGetItem(States.StringSplit($[0].dynamodb.NewImage.pk.S, '/'), 1)",
        'region.$': '$[0].dynamodb.NewImage.region.S',
      },
      comment: 'Extract first element from EventBridge Pipes array input',
    });

    tenantDeployerTask.addCatch(ddbUpdateFailed.next(failState), {
      resultPath: '$.error',
    });

    return DefinitionBody.fromChainable(
      processArrayInput.next(
        isRegionChoiceStatement
          .when(
            isRegionCondition,
            ddbUpdateInProgress
              .next(tenantDeployerTask)
              .next(ddbUpdateCompleted)
          )
          .otherwise(
            new Pass(this, 'EndState', {
              parameters: {
                'tenant.$': '$.tenant',
                'region.$': regionVariable,
                message: 'Tenant deployment skipped - not in target region',
              },
            })
          )
      )
    );
  }

  private createTenantDeploymentStateMachine(
    props: LocalAppProps,
    definitionBody: DefinitionBody
  ) {
    const stateMachine = new StateMachine(
      this,
      `${props.stage}-${props.appName}-TenantDeploymentStateMachine`,
      {
        stateMachineName: `${props.stage}-${props.appName}-TenantDeploymentStateMachine`,
        definitionBody: definitionBody,
      }
    );

    return stateMachine;
  }

  private createDynamoDbStreamPipe(
    stackProps: StackProps,
    table: ITable,
    stateMachine: StateMachine
  ) {
    // Create IAM role for the pipe
    const pipeRole = new Role(this, 'TenantDeployerPipeRole', {
      assumedBy: new ServicePrincipal('pipes.amazonaws.com'),
    });

    // Add permissions to read from DynamoDB stream
    pipeRole.addToPolicy(
      new PolicyStatement({
        effect: Effect.ALLOW,
        actions: [
          'dynamodb:DescribeStream',
          'dynamodb:GetRecords',
          'dynamodb:GetShardIterator',
          'dynamodb:ListStreams',
        ],
        resources: [table.tableStreamArn!],
      })
    );

    // Add permissions to start Step Function execution
    pipeRole.addToPolicy(
      new PolicyStatement({
        effect: Effect.ALLOW,
        actions: ['states:StartExecution'],
        resources: [stateMachine.stateMachineArn],
      })
    );

    if (!table.tableStreamArn) {
      throw new Error('DynamoDB table stream ARN is not defined');
    }

    const pipeLogGroup = new LogGroup(this, 'TenantDeployerPipeLogGroup', {
      removalPolicy: RemovalPolicy.DESTROY,
      retention: RetentionDays.ONE_WEEK,
    });

    // Create the pipe
    new CfnPipe(this, 'TenantDeployerPipe', {
      roleArn: pipeRole.roleArn,
      source: table.tableStreamArn,
      target: stateMachine.stateMachineArn,
      logConfiguration: {
        cloudwatchLogsLogDestination: {
          logGroupArn: pipeLogGroup.logGroupArn,
        },
        level: 'INFO',
      },
      sourceParameters: {
        dynamoDbStreamParameters: {
          startingPosition: 'LATEST',
          batchSize: 1,
        },
        filterCriteria: {
          filters: [
            {
              pattern: JSON.stringify({
                eventName: ['INSERT', 'MODIFY'],
                dynamodb: {
                  NewImage: {
                    // Entity type encoded in PK: "TENANT/multitenant" for tenant records
                    pk: {
                      S: [{ prefix: 'TENANT/' }],
                    },
                    // Filter by region
                    region: {
                      S: [stackProps.env!.region!],
                    },
                    // Only trigger if state does not exist in new image
                    state: {
                      S: [
                        {
                          exists: false,
                        },
                      ],
                    },
                  },
                  OldImage: {
                    // Only trigger if state did not exist in old image OR was 'failed'
                    state: {
                      S: [
                        {
                          exists: false,
                        },
                        'failed',
                      ],
                    },
                  },
                },
              }),
            },
          ],
        },
      },
      targetParameters: {
        stepFunctionStateMachineParameters: {
          invocationType: 'FIRE_AND_FORGET',
        },
        // Pass the entire array to the step function for processing
        inputTemplate: '<aws.pipes.event>',
      },
    });
  }
}
