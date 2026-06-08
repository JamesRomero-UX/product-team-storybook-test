import type { aws_ec2, Stack } from 'aws-cdk-lib';
import { Duration } from 'aws-cdk-lib';
import {
  type ISecurityGroup,
  type IVpc,
  SecurityGroup,
} from 'aws-cdk-lib/aws-ec2';
import { ManagedPolicy, Role, ServicePrincipal } from 'aws-cdk-lib/aws-iam';
import { Architecture, Runtime } from 'aws-cdk-lib/aws-lambda';
import { NodejsFunction } from 'aws-cdk-lib/aws-lambda-nodejs';
import { LogGroup, RetentionDays } from 'aws-cdk-lib/aws-logs';
import { Construct } from 'constructs';

const isLocal = (stage: string) =>
  ['dev-cloud', 'staging', 'prod'].indexOf(stage) === -1;

interface RequiredEnvironmentVariables {
  SENTRY_RELEASE: string;
}

export interface RisksmartFunctionProps {
  appName: string;
  entry: string;
  environment: { [key: string]: string } & RequiredEnvironmentVariables;
  functionName: string; // function name should be kebab case
  securityGroups?: aws_ec2.ISecurityGroup[];
  stage: string; // e.g., app, dev-cloud, staging, prod. Might be better to use enum
  timeout?: Duration;
  vpc?: IVpc;
}

export class RisksmartFunction extends Construct {
  public lambda: NodejsFunction;
  public role: Role;

  constructor(scope: Stack, id: string, props: RisksmartFunctionProps) {
    super(scope, id);

    const shouldUseVpc =
      props.vpc &&
      ['app', 'prod', 'staging', 'dev-cloud'].includes(props.stage);

    let securityGroups: ISecurityGroup[] | undefined;
    if (shouldUseVpc) {
      const lambdaSecurityGroup = new SecurityGroup(this, `LambdaSG`, {
        vpc: props.vpc!,
        description: `Security group for ${props.functionName} Lambda function`,
        allowAllOutbound: true,
      });
      securityGroups = [...(props.securityGroups ?? []), lambdaSecurityGroup];
    }

    const logGroup = new LogGroup(this, `LogGroup`, {
      logGroupName: `/aws/lambda/${props.stage}-${props.functionName}`,
      retention: RetentionDays.THREE_MONTHS,
    });

    this.role = new Role(this, `Role`, {
      roleName: `${scope.region}-${props.stage}-${props.functionName}-role`,
      assumedBy: new ServicePrincipal('lambda.amazonaws.com'),
      managedPolicies: [
        ManagedPolicy.fromAwsManagedPolicyName(
          shouldUseVpc
            ? 'service-role/AWSLambdaVPCAccessExecutionRole'
            : 'service-role/AWSLambdaBasicExecutionRole'
        ),
      ],
    });

    this.lambda = new NodejsFunction(this, `Lambda`, {
      functionName: `${scope.region}-${props.stage}-${props.functionName}`,
      runtime: Runtime.NODEJS_22_X,
      timeout: props.timeout ?? Duration.minutes(5),
      memorySize: 512,
      role: this.role,
      logGroup,
      vpc: shouldUseVpc ? props.vpc : undefined,
      securityGroups,
      entry: props.entry,
      handler: 'handler',
      architecture: Architecture.ARM_64,
      bundling: {
        target: 'ES2022',
        minify: true,
        sourceMap: true,
        externalModules: ['@aws-sdk/*'], // Node.js 22 includes SDK v3; aws-sdk (v2) must be bundled if used
      },
      environment: {
        ...props.environment,
        NODE_ENV: props.stage === 'app' ? 'production' : 'development',
        STAGE: props.stage,
        APP_NAME: props.appName,
        POWERTOOLS_DEV: isLocal(props.stage) ? '1' : '0',
        NODE_OPTIONS: '--enable-source-maps',
        IS_LOCAL: isLocal(props.stage) ? 'true' : 'false',
      },
    });
  }
}
