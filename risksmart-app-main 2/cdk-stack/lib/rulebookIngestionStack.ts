import type { aws_events, StackProps } from 'aws-cdk-lib';
import {
  aws_dynamodb,
  aws_s3,
  aws_stepfunctions,
  aws_stepfunctions_tasks,
  Duration,
  RemovalPolicy,
  Stack,
} from 'aws-cdk-lib';
import type { IVpc } from 'aws-cdk-lib/aws-ec2';
import { PolicyStatement } from 'aws-cdk-lib/aws-iam';
import type { IFunction } from 'aws-cdk-lib/aws-lambda';
import type { LocalAppProps } from 'bin/cdk-stack';
import type { Construct } from 'constructs';
import * as path from 'path';

import { RisksmartFunction } from './constructs/risksmartFunction';

export interface RulebookIngestionStackProps extends LocalAppProps {
  sharedEventBus: aws_events.EventBus;
  sentryRelease: string;
  vpc?: IVpc;
}

export class RulebookIngestionStack extends Stack {
  private readonly relativeHandlerDirectoryPath =
    '../../services/rulebook-ingestion/src/handlers' as const;

  private readonly initialisationLambda: IFunction;
  private readonly ascentPrefetchTasksLambda: IFunction;
  private readonly ingestionLambda: IFunction;
  private readonly ingestObligationChangesLambda: IFunction;
  private readonly changeDetectionLambda: IFunction;
  private readonly concludeIngestionLambda: IFunction;

  private readonly table: aws_dynamodb.Table;
  private readonly bucket: aws_s3.IBucket;
  private readonly eventBus: aws_events.IEventBus;

  constructor(
    scope: Construct,
    id: string,
    stackProps: StackProps,
    props: RulebookIngestionStackProps
  ) {
    super(scope, id, stackProps);

    this.eventBus = props.sharedEventBus;

    this.table = this.createDynamoTable(props.stage, props.appName);

    this.bucket = this.createS3Bucket(props);

    const { lambda: initialisationLambda } =
      this.createInitialiseIngestionHandler(props);
    this.initialisationLambda = initialisationLambda;

    const { lambda: ingestionLambda } =
      this.createAscentIngestionHandler(props);
    this.ingestionLambda = ingestionLambda;

    const { lambda: ingestObligationChangesLambda } =
      this.createAscentIngestObligationChangesHandler(props);
    this.ingestObligationChangesLambda = ingestObligationChangesLambda;

    const { lambda: ascentPrefetchTasksLambda } =
      this.createAscentPrefetchTasksHandler(props);
    this.ascentPrefetchTasksLambda = ascentPrefetchTasksLambda;

    const { lambda: changeDetectionLambda } =
      this.createAscentChangeDetectionHandler(props);
    this.changeDetectionLambda = changeDetectionLambda;

    const { lambda: concludeIngestionLambda } =
      this.createConcludeIngestionHandler(props);
    this.concludeIngestionLambda = concludeIngestionLambda;

    this.createAscentStateMachine(props);
  }

  private createS3Bucket = (props: RulebookIngestionStackProps) => {
    const bucket = new aws_s3.Bucket(this, 'RulebookChangesS3Bucket', {
      bucketName:
        `${props.riskSmartRegionProps.regionStackNamePrefix}${props.stage}-rulebook-changes`.toLowerCase(),
      removalPolicy: RemovalPolicy.DESTROY,
      autoDeleteObjects: true,
      lifecycleRules: [
        {
          enabled: true,
          expiration: Duration.days(7),
        },
      ],
    });

    return bucket;
  };

  private createDynamoTable = (stage: string, appName: string) => {
    const table = new aws_dynamodb.Table(this, 'RulebookIngestionTable', {
      tableName: `${stage}-${appName}-RulebookIngestion`,
      partitionKey: { name: 'pk', type: aws_dynamodb.AttributeType.STRING },
      sortKey: { name: 'sk', type: aws_dynamodb.AttributeType.STRING },
      billingMode: aws_dynamodb.BillingMode.PAY_PER_REQUEST,
      removalPolicy: RemovalPolicy.DESTROY,
      //   replicationRegions: [
      //             'us-east-1',
      //             'eu-west-1',
      //             'me-central-1',
      //             'ca-central-1',
      //           ],
      //           stream: StreamViewType.NEW_AND_OLD_IMAGES,
    });

    return table;
  };

  // Grant SSM read without referencing the parameter to prevent the stack
  // from failing to deploy if the parameter does not exist yet.
  private grantSsmReadAccess = (fn: RisksmartFunction, paramName: string) => {
    fn.lambda.addToRolePolicy(
      new PolicyStatement({
        actions: ['ssm:GetParameter'],
        resources: [
          `arn:aws:ssm:${this.region}:${this.account}:parameter${paramName}`,
        ],
      })
    );
  };

  private createInitialiseIngestionHandler = (
    props: RulebookIngestionStackProps
  ): RisksmartFunction => {
    const dataLayerSsmParam = `/${props.stage}/${props.appName}/api/data-layer/internal-url`;

    const fn = new RisksmartFunction(this, 'InitialisationIngestionHandler', {
      ...props,
      entry: path.join(
        __dirname,
        this.relativeHandlerDirectoryPath,
        'initialise-ingestion/index.ts'
      ),
      functionName: 'initialisation-ingestion-handler',
      timeout: Duration.minutes(15), // Max lambda timeout
      environment: {
        SENTRY_RELEASE: props.sentryRelease,
        DATA_LAYER_INTERNAL_API_URL_SSM_PARAM: dataLayerSsmParam,
        DYNAMODB_TABLE_NAME: this.table.tableName,
      },
    });

    this.grantSsmReadAccess(fn, dataLayerSsmParam);
    this.table.grantReadWriteData(fn.lambda);

    // Grant Secrets Manager access for per-org API credentials
    fn.lambda.addToRolePolicy(
      new PolicyStatement({
        actions: ['secretsmanager:GetSecretValue'],
        resources: [
          `arn:aws:secretsmanager:${this.region}:${this.account}:secret:${props.stage}-ingestion-config-secret-*`,
        ],
      })
    );

    // Grant API Gateway invoke for SigV4-signed data-layer requests
    fn.lambda.addToRolePolicy(
      new PolicyStatement({
        actions: ['execute-api:Invoke'],
        resources: [`arn:aws:execute-api:${this.region}:${this.account}:*`],
      })
    );

    return fn;
  };

  private createAscentPrefetchTasksHandler = (
    props: RulebookIngestionStackProps
  ): RisksmartFunction => {
    const fn = new RisksmartFunction(this, 'AscentPrefetchTasksHandler', {
      ...props,
      entry: path.join(
        __dirname,
        this.relativeHandlerDirectoryPath,
        'ascent/prefetch-tasks/index.ts'
      ),
      functionName: 'prefetch-ascent-tasks',
      timeout: Duration.minutes(15), // Max lambda timeout
      environment: {
        SENTRY_RELEASE: props.sentryRelease,
        DYNAMODB_TABLE_NAME: this.table.tableName,
        TASK_STORAGE_BUCKET_NAME: this.bucket.bucketName,
      },
    });

    this.table.grantReadWriteData(fn.lambda);
    this.bucket.grantWrite(fn.lambda);

    // Grant Secrets Manager access for per-org API credentials
    fn.lambda.addToRolePolicy(
      new PolicyStatement({
        actions: ['secretsmanager:GetSecretValue'],
        resources: [
          `arn:aws:secretsmanager:${this.region}:${this.account}:secret:${props.stage}-ingestion-config-secret-*`,
        ],
      })
    );

    return fn;
  };

  private createAscentIngestionHandler = (
    props: RulebookIngestionStackProps
  ): RisksmartFunction => {
    const fn = new RisksmartFunction(this, 'AscentIngestionHandler', {
      ...props,
      entry: path.join(
        __dirname,
        this.relativeHandlerDirectoryPath,
        'ascent/ingest-rulebooks/index.ts'
      ),
      functionName: 'ingest-ascent-rulebooks',
      timeout: Duration.minutes(15), // Max lambda timeout
      environment: {
        SENTRY_RELEASE: props.sentryRelease,
        DYNAMODB_TABLE_NAME: this.table.tableName,
        TASK_STORAGE_BUCKET_NAME: this.bucket.bucketName,
      },
    });

    this.table.grantReadWriteData(fn.lambda);
    this.bucket.grantRead(fn.lambda);

    // Grant Secrets Manager access for per-org API credentials
    fn.lambda.addToRolePolicy(
      new PolicyStatement({
        actions: ['secretsmanager:GetSecretValue'],
        resources: [
          `arn:aws:secretsmanager:${this.region}:${this.account}:secret:${props.stage}-ingestion-config-secret-*`,
        ],
      })
    );

    return fn;
  };

  private createAscentIngestObligationChangesHandler = (
    props: RulebookIngestionStackProps
  ): RisksmartFunction => {
    const fn = new RisksmartFunction(
      this,
      'AscentIngestObligationChangesHandler',
      {
        ...props,
        entry: path.join(
          __dirname,
          this.relativeHandlerDirectoryPath,
          'ascent/ingest-obligation-changes/index.ts'
        ),
        functionName: 'ingest-ascent-obligation-changes',
        timeout: Duration.minutes(15), // Max lambda timeout
        environment: {
          SENTRY_RELEASE: props.sentryRelease,
          DYNAMODB_TABLE_NAME: this.table.tableName,
          TASK_STORAGE_BUCKET_NAME: this.bucket.bucketName,
        },
      }
    );

    this.table.grantReadWriteData(fn.lambda);
    this.bucket.grantRead(fn.lambda);

    return fn;
  };

  private createAscentChangeDetectionHandler = (
    props: RulebookIngestionStackProps
  ): RisksmartFunction => {
    const fn = new RisksmartFunction(this, 'AscentChangeDetectionHandler', {
      ...props,
      entry: path.join(
        __dirname,
        this.relativeHandlerDirectoryPath,
        'rulebook-change-detection/index.ts'
      ),
      functionName: 'rulebook-change-detection',
      environment: {
        SENTRY_RELEASE: props.sentryRelease,
        DYNAMODB_TABLE_NAME: this.table.tableName,
        CHANGES_BUCKET_NAME: this.bucket.bucketName,
      },
    });

    this.table.grantReadWriteData(fn.lambda);
    this.bucket.grantReadWrite(fn.lambda);

    return fn;
  };

  private createConcludeIngestionHandler = (
    props: RulebookIngestionStackProps
  ): RisksmartFunction => {
    const fn = new RisksmartFunction(this, 'ConcludeIngestionHandler', {
      ...props,
      entry: path.join(
        __dirname,
        this.relativeHandlerDirectoryPath,
        'conclude-ingestion/index.ts'
      ),
      functionName: 'conclude-ingestion-handler',
      environment: {
        SENTRY_RELEASE: props.sentryRelease,
        DYNAMODB_TABLE_NAME: this.table.tableName,
        CHANGES_BUCKET_NAME: this.bucket.bucketName,
        EVENT_BUS_NAME: this.eventBus.eventBusName,
      },
    });

    this.table.grantReadWriteData(fn.lambda);
    this.bucket.grantReadWrite(fn.lambda);
    this.eventBus.grantPutEventsTo(fn.lambda);

    return fn;
  };

  private createStep = (
    id: string,
    lambdaFunction: IFunction,
    handleError?: aws_stepfunctions.Fail,
    overrides?: Partial<aws_stepfunctions_tasks.LambdaInvokeProps>
  ) => {
    const step = new aws_stepfunctions_tasks.LambdaInvoke(this, id, {
      lambdaFunction,
      outputPath: '$.Payload',
      retryOnServiceExceptions: true,
      ...overrides,
    });

    if (handleError) {
      step.addCatch(handleError, {
        errors: ['States.ALL'],
        resultPath: '$.error',
      });
    }

    return step;
  };

  private createAscentStateMachine = (props: RulebookIngestionStackProps) => {
    const handleError = new aws_stepfunctions.Fail(this, 'IngestionFailed', {
      cause: 'Rulebook ingestion failed',
      error: 'IngestionError',
    });

    const handleSuccess = new aws_stepfunctions.Succeed(
      this,
      'IngestionSucceeded'
    );

    const initialiseIngestion = this.createStep(
      'InitialiseIngestion',
      this.initialisationLambda,
      handleError
    );

    // Prefetch receives { ingestionRun, apiRef } from initialise step
    const prefetchTasks = this.createStep(
      'PrefetchTasks',
      this.ascentPrefetchTasksLambda,
      handleError
    );

    // Ingest regulators sequentially - receives { ingestionRun, apiRef } and iterates over regulatorProgress
    const ingestRegulatorsSequentially = new aws_stepfunctions.Map(
      this,
      'IngestRegulatorsSequentially',
      {
        maxConcurrency: 1, // cant run in parallel due to rate limits on the Ascent API
        itemsPath: '$.ingestionRun.regulatorProgress',
        itemSelector: {
          'ingestionRun.$': '$.ingestionRun',
          'apiRef.$': '$.apiRef',
          'regulatorId.$': '$$.Map.Item.Value.regulatorId',
        },
        resultPath: '$.ingestionResults',
      }
    );

    ingestRegulatorsSequentially.itemProcessor(
      this.createStep('IngestSingleRegulator', this.ingestionLambda)
    );

    ingestRegulatorsSequentially.addCatch(handleError, {
      errors: ['States.ALL'],
      resultPath: '$.error',
    });

    const ingestObligationChangesSequentially = new aws_stepfunctions.Map(
      this,
      'IngestObligationChangesSequentially',
      {
        maxConcurrency: 1,
        itemsPath: '$.regulatorProgress',
        itemSelector: {
          'ingestionRun.$': '$',
          'regulatorId.$': '$$.Map.Item.Value.regulatorId',
        },
        resultPath: '$.obligationChangesResults',
      }
    );

    ingestObligationChangesSequentially.itemProcessor(
      this.createStep(
        'IngestObligationChangesForRegulator',
        this.ingestObligationChangesLambda
      )
    );

    ingestObligationChangesSequentially.addCatch(handleError, {
      errors: ['States.ALL'],
      resultPath: '$.error',
    });

    // Detect changes sequentially to avoid race conditions on ingestion run updates
    const detectChangesSequentially = new aws_stepfunctions.Map(
      this,
      'DetectChangesSequentially',
      {
        maxConcurrency: 1, // Sequential to avoid race conditions updating ingestion run
        itemsPath: '$.ingestionRun.regulatorProgress',
        itemSelector: {
          'ingestionRun.$': '$.ingestionRun',
          'regulatorId.$': '$$.Map.Item.Value.regulatorId',
        },
        resultPath: '$.changeDetectionResults',
        resultSelector: {
          'manifestEntries.$': '$[*].manifestEntry', // Extract manifestEntry from each result
        },
      }
    );

    detectChangesSequentially.itemProcessor(
      this.createStep('DetectChangesForRegulator', this.changeDetectionLambda)
    );

    detectChangesSequentially.addCatch(handleError, {
      errors: ['States.ALL'],
      resultPath: '$.error',
    });

    // Conclude ingestion and finalise manifest
    const concludeIngestion = this.createStep(
      'ConcludeIngestion',
      this.concludeIngestionLambda,
      handleError,
      {
        payload: aws_stepfunctions.TaskInput.fromObject({
          'ingestionRun.$': '$.ingestionRun',
          'manifestEntries.$': '$.changeDetectionResults.manifestEntries',
        }),
      }
    );

    // Check for regulators
    const hasRegulatorsChoice = new aws_stepfunctions.Choice(
      this,
      'HasRegulators?'
    );

    // only run the ingestion if there are regulators to ingest, otherwise skip to the end.
    hasRegulatorsChoice
      .when(
        aws_stepfunctions.Condition.isPresent(
          '$.ingestionRun.regulatorProgress[0]'
        ),
        prefetchTasks
          .next(ingestRegulatorsSequentially)
          .next(ingestObligationChangesSequentially)
          .next(detectChangesSequentially)
          .next(concludeIngestion)
          .next(handleSuccess)
      )
      .otherwise(handleSuccess);

    const definition = initialiseIngestion.next(hasRegulatorsChoice);

    const stateMachine = new aws_stepfunctions.StateMachine(
      this,
      'RulebookIngestionStateMachine',
      {
        stateMachineName: `${props.stage}-ascent-rulebook-ingestion`,
        definitionBody:
          aws_stepfunctions.DefinitionBody.fromChainable(definition),
        timeout: Duration.minutes(30),
      }
    );

    return stateMachine;
  };
}
