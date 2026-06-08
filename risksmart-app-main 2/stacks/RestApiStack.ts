import { Duration, RemovalPolicy } from 'aws-cdk-lib';
import {
  Alarm,
  ComparisonOperator,
  TreatMissingData,
} from 'aws-cdk-lib/aws-cloudwatch';
import { BillingMode } from 'aws-cdk-lib/aws-dynamodb';
import { Rule } from 'aws-cdk-lib/aws-events';
import { SnsTopic } from 'aws-cdk-lib/aws-events-targets';
import {
  ArnPrincipal,
  Effect,
  ManagedPolicy,
  PolicyDocument,
  PolicyStatement,
  Role,
  ServicePrincipal,
} from 'aws-cdk-lib/aws-iam';
import { SqsDestination } from 'aws-cdk-lib/aws-lambda-destinations';
import { Secret } from 'aws-cdk-lib/aws-secretsmanager';
import { Queue } from 'aws-cdk-lib/aws-sqs';
import {
  Api,
  Bucket,
  Function,
  FunctionProps,
  Queue as SSTQueue,
  QueueProps,
  Stack,
  StackContext,
  Table,
  Topic,
  use,
} from 'sst/constructs';
import { ApiRouteProps } from 'sst/constructs/Api';

import {
  TABLE_NAME_IDEMPOTENCY,
  RISKSMART_REGION_PREFIX,
  DOMAIN_NAME_PREFIX,
} from './constants';
import { getEnv } from './environment';
import { isLocal } from './isLocal';
import { Secrets } from './SecretsStack';
import { SharedInfraStack } from './SharedInfraStack';
import { getEnvSettings } from './stageEnv/env';
import { getFunctionVpcProps } from './vpc';

const handlersDir = 'packages/rest-api/src/handlers';

export function RestAPI({ stack }: StackContext) {
  const {
    KNOCK_SECRET_KEY,
    HASURA_ADMIN_SECRET,
    REST_API_KEY,
    SLACK_CLIENT_SECRET,
    AUTH0_CLIENT_SECRET,
    INTEGRATION_SECRET,
    HYBISCUS_API_KEY,
  } = use(Secrets);
  const { sharedEventBus, invokeInternalApiPermission } = use(SharedInfraStack);
  const envSettings = getEnvSettings(stack.stage);
  const basicAPIGatewayLambdaRole = new Role(stack, 'LambdaApiGatewayRole', {
    roleName: `${RISKSMART_REGION_PREFIX}${stack.stage}-lambdaApiGatewayRole`,
    assumedBy: new ServicePrincipal('lambda.amazonaws.com'),
    managedPolicies: [
      ManagedPolicy.fromAwsManagedPolicyName(
        'service-role/AWSLambdaVPCAccessExecutionRole'
      ),
    ],
  });

  const apiKeyHandler = (fn: Function): ApiRouteProps<'key'> => ({
    authorizer: 'key',
    cdk: {
      function: fn,
    },
  });

  const apiHandler = (
    name: string,
    handlerPath: string,
    options?: Partial<FunctionProps>
  ): ApiRouteProps<'key'> => ({
    authorizer: 'key',
    function: {
      bind: [HASURA_ADMIN_SECRET],
      handler: `${handlersDir}/${handlerPath}`,
      functionName: `${stack.stage}-${name}`,
      role: basicAPIGatewayLambdaRole,
      ...options,
    },
  });

  const vpcSettings = getFunctionVpcProps(stack);

  const fileStorageBucket = new Bucket(stack, 'OrganisationFiles', {
    name: `${RISKSMART_REGION_PREFIX}${stack.stage}-risksmart-org-files`.toLowerCase(),
    blockPublicACLs: true,
    cdk: {
      bucket: {
        // Setting to avoid the "The bucket policy already exists on bucket" error
        // See https://github.com/aws/aws-cdk/issues/18676
        enforceSSL: false,
      },
    },
  });

  const dataExportBucket = new Bucket(stack, 'DataExport', {
    name: `${RISKSMART_REGION_PREFIX}${stack.stage}-risksmart-data-export`.toLowerCase(),
    blockPublicACLs: true,
    cdk: {
      bucket: {
        enforceSSL: true,
        lifecycleRules: [
          {
            id: 'delete-after-1-day',
            enabled: true,
            abortIncompleteMultipartUploadAfter: Duration.days(1),
            expiration: Duration.days(1),
          },
        ],
      },
    },
  });

  const lambdaBedRockRole = new Role(stack, 'LambdaBedrockRole', {
    roleName: `${RISKSMART_REGION_PREFIX}${stack.stage}-lambdaBedrock`,
    assumedBy: new ServicePrincipal('lambda.amazonaws.com'),
    managedPolicies: [
      ManagedPolicy.fromAwsManagedPolicyName(
        'service-role/AWSLambdaVPCAccessExecutionRole'
      ),
    ],
  });

  lambdaBedRockRole.addToPolicy(
    new PolicyStatement({
      actions: ['bedrock:InvokeModel'],
      resources: ['arn:*:bedrock:eu-west-2::foundation-model/*'],
      conditions: {
        StringLike: {
          'bedrock:GuardrailIdentifier': 'arn:aws:bedrock:eu-west-2:*:guardrail/*',
        },
      },
    })
  );

  lambdaBedRockRole.addToPolicy(
    new PolicyStatement({
      actions: ['bedrock:ApplyGuardrail'],
      resources: [`arn:aws:bedrock:eu-west-2:*:guardrail/*`],
    })
  );

  const lambdaFilesRole = new Role(stack, 'LambdaOrgRole', {
    roleName: `${RISKSMART_REGION_PREFIX}${stack.stage}-lambdaS3`,
    assumedBy: new ServicePrincipal('lambda.amazonaws.com'),
    managedPolicies: [
      ManagedPolicy.fromAwsManagedPolicyName(
        'service-role/AWSLambdaVPCAccessExecutionRole'
      ),
    ],
  });

  const lambdaOneOffExportRole = new Role(stack, 'LambdaOneOffExportRole', {
    roleName: `${RISKSMART_REGION_PREFIX}${stack.stage}-lambdaOneOffExport`,
    assumedBy: new ServicePrincipal('lambda.amazonaws.com'),
    managedPolicies: [
      ManagedPolicy.fromAwsManagedPolicyName(
        'service-role/AWSLambdaVPCAccessExecutionRole'
      ),
    ],
  });

  const lambdaCreateExportScheduleRole = new Role(
    stack,
    'LambdaCreateExportScheduleRole',
    {
      roleName: `${RISKSMART_REGION_PREFIX}${stack.stage}-lambdaCreateExportSchedule`,
      assumedBy: new ServicePrincipal('lambda.amazonaws.com'),
      managedPolicies: [
        ManagedPolicy.fromAwsManagedPolicyName(
          'service-role/AWSLambdaVPCAccessExecutionRole'
        ),
      ],
    }
  );

  const lambdaTestScheduleRole = new Role(stack, 'LambdaTestScheduleRole', {
    roleName: `${RISKSMART_REGION_PREFIX}${stack.stage}-lambdaTestSchedule`,
    assumedBy: new ServicePrincipal('lambda.amazonaws.com'),
    managedPolicies: [
      ManagedPolicy.fromAwsManagedPolicyName(
        'service-role/AWSLambdaVPCAccessExecutionRole'
      ),
    ],
  });

  const testScheduleEventBridgeStatement = new PolicyStatement({
    actions: ['events:ListTargetsByRule'],
    resources: [
      `arn:aws:events:${stack.region}:${stack.account}:rule/${stack.stage}-DataExportScheduleRule-*`,
    ],
    effect: Effect.ALLOW,
  });
  lambdaTestScheduleRole.addToPolicy(testScheduleEventBridgeStatement);

  const testScheduleLambdaInvokeStatement = new PolicyStatement({
    actions: ['lambda:InvokeFunction'],
    resources: [
      `arn:aws:lambda:${stack.region}:${stack.account}:function:${stack.stage}-scheduledDataExport`,
    ],
    effect: Effect.ALLOW,
  });
  lambdaTestScheduleRole.addToPolicy(testScheduleLambdaInvokeStatement);

  const skyscannerJiraSecret = Secret.fromSecretNameV2(
    stack,
    'skyscanner-jira-config',
    'skyscanner-jira-config'
  );
  const skyscannerJiraSecretStatement = new PolicyStatement({
    resources: [`${skyscannerJiraSecret.secretArn}-*`],
    actions: ['secretsmanager:GetSecretValue'],
    effect: Effect.ALLOW,
  });

  const lambdaSkyscannerJiraIntegrationRole = new Role(
    stack,
    `${RISKSMART_REGION_PREFIX}LambdaSkyscannerJiraIntegrationRole`,
    {
      roleName: `${RISKSMART_REGION_PREFIX}${stack.stage}-lambdaSkyscannerJiraIntegration`,
      description:
        'Allow Jira integration lambda to access customer-specific Jira secrets',
      assumedBy: new ServicePrincipal('lambda.amazonaws.com'),
      managedPolicies: [
        ManagedPolicy.fromAwsManagedPolicyName(
          'service-role/AWSLambdaVPCAccessExecutionRole'
        ),
      ],
      inlinePolicies: {
        jiraSecretsAccess: new PolicyDocument({
          statements: [skyscannerJiraSecretStatement],
        }),
      },
    }
  );

  const allicaJiraSecret = Secret.fromSecretNameV2(
    stack,
    'allica-jira-config',
    'allica-jira-config'
  );
  const allicaJiraSecretStatement = new PolicyStatement({
    resources: [`${allicaJiraSecret.secretArn}-*`],
    actions: ['secretsmanager:GetSecretValue'],
    effect: Effect.ALLOW,
  });

  const lambdaAllicaJiraIntegrationRole = new Role(
    stack,
    `${RISKSMART_REGION_PREFIX}LambdaAllicaJiraIntegrationRole`,
    {
      roleName: `${RISKSMART_REGION_PREFIX}${stack.stage}-lambdaAllicaJiraIntegration`,
      description:
        'Allow Jira integration lambda to access customer-specific Jira secrets',
      assumedBy: new ServicePrincipal('lambda.amazonaws.com'),
      managedPolicies: [
        ManagedPolicy.fromAwsManagedPolicyName(
          'service-role/AWSLambdaVPCAccessExecutionRole'
        ),
      ],
      inlinePolicies: {
        jiraSecretsAccess: new PolicyDocument({
          statements: [allicaJiraSecretStatement],
        }),
      },
    }
  );

  const s3ObjectStatement = new PolicyStatement({
    resources: [
      `${fileStorageBucket.bucketArn}/\${aws:PrincipalTag/OrganisationId}/*`,
    ],
    actions: ['s3:GetObject', 's3:PutObject', 's3:DeleteObject'],
    effect: Effect.ALLOW,
  });

  const s3DataExportObjectStatement = new PolicyStatement({
    resources: [
      `${dataExportBucket.bucketArn}/\${aws:PrincipalTag/OrganisationId}/*`,
    ],
    actions: ['s3:GetObject', 's3:PutObject'],
    effect: Effect.ALLOW,
  });

  const fileOrgRole = new Role(
    stack,
    `${RISKSMART_REGION_PREFIX}OrganisationFilesRole`,
    {
      assumedBy: new ArnPrincipal(lambdaFilesRole.roleArn).withSessionTags(),
      description:
        'Allow lambda to save and retrieve files from s3 based on organisation',

      inlinePolicies: {
        s3Access: new PolicyDocument({
          statements: [s3ObjectStatement],
        }),
      },
    }
  );

  const dataExportRole = new Role(
    stack,
    `${RISKSMART_REGION_PREFIX}DataExportRole`,
    {
      assumedBy: new ArnPrincipal(
        lambdaOneOffExportRole.roleArn
      ).withSessionTags(),
      description: 'Allow lambda to perform data export to S3',
      inlinePolicies: {
        s3Access: new PolicyDocument({
          statements: [s3DataExportObjectStatement],
        }),
      },
    }
  );

  const tagSessionStatement = new PolicyStatement({
    resources: [fileOrgRole.roleArn],
    actions: ['sts:AssumeRole', 'sts:TagSession'],
    effect: Effect.ALLOW,
  });
  lambdaFilesRole.addToPolicy(tagSessionStatement);
  fileOrgRole.addToPolicy(tagSessionStatement);

  const dataExportTagSessionStatement = new PolicyStatement({
    resources: [dataExportRole.roleArn],
    actions: ['sts:AssumeRole', 'sts:TagSession'],
    effect: Effect.ALLOW,
  });
  lambdaOneOffExportRole.addToPolicy(dataExportTagSessionStatement);
  dataExportRole.addToPolicy(dataExportTagSessionStatement);

  const exportScheduleStatement = new PolicyStatement({
    actions: [
      'secretsmanager:DescribeSecret',
      'secretsmanager:CreateSecret',
      'secretsmanager:PutSecretValue',
    ],
    resources: [
      `arn:aws:secretsmanager:${stack.region}:${stack.account}:secret:${stack.stage}-*-data-export-schedule-secret-*`,
    ],
    effect: Effect.ALLOW,
  });
  lambdaCreateExportScheduleRole.addToPolicy(exportScheduleStatement);

  const ingestionConfigSecretStatement = new PolicyStatement({
    actions: [
      'secretsmanager:CreateSecret',
      'secretsmanager:PutSecretValue',
      'secretsmanager:DeleteSecret',
      'secretsmanager:GetSecretValue',
    ],
    resources: [
      `arn:aws:secretsmanager:${stack.region}:${stack.account}:secret:${stack.stage}-ingestion-config-secret-*`,
    ],
    effect: Effect.ALLOW,
  });
  basicAPIGatewayLambdaRole.addToPolicy(ingestionConfigSecretStatement);

  const dataChangeDlq = new Queue(stack, `DataChangeDlq`, {
    queueName: `${stack.stage}-data-change-dql`,
  });

  new Alarm(stack, `DataChangeLetterQueueAlarm`, {
    alarmName: `${stack.stage}-data-change-dead-letter-alarm`,
    actionsEnabled: true,
    alarmDescription: `Error notifying for data change events`,
    threshold: 1,
    treatMissingData: TreatMissingData.NOT_BREACHING,
    metric: dataChangeDlq.metricApproximateNumberOfMessagesVisible(),
    evaluationPeriods: 1,
    comparisonOperator: ComparisonOperator.GREATER_THAN_OR_EQUAL_TO_THRESHOLD,
    datapointsToAlarm: 1,
  });

  const s3FileDeleterFunction = new Function(stack, 'S3FileDeleter', {
    handler: `${handlersDir}/files/s3FileDeleter.handler`,
    functionName: `${stack.stage}-S3FileDeleter`,
    onFailure: new SqsDestination(dataChangeDlq),
    role: lambdaFilesRole,
    environment: {
      ORGANISATION_FILE_BUCKET: fileStorageBucket.cdk.bucket.bucketName,
      ORG_ROLE_ARN: fileOrgRole.roleArn,
    },
    ...vpcSettings,
  });

  const integrationSnsTopic = new Topic(stack, 'IntegrationSnsTopic');

  const integrationSnsTopicTarget = new SnsTopic(integrationSnsTopic.cdk.topic);

  new Rule(stack, 'IssueChangedEventRule', {
    description: 'Rule to trigger when an issue is changed',
    eventBus: sharedEventBus.cdk.eventBus,
    ruleName: `${stack.stage}-IssueChangedRule`,
    targets: [integrationSnsTopicTarget],
    eventPattern: {
      detailType: ['DataChanged'],
      detail: {
        event: {
          op: ['INSERT', 'UPDATE', 'DELETE'],
        },
        table: {
          name: ['issue', 'issue_assessment'],
        },
      },
    },
  });

  sharedEventBus.addRules(stack, {
    onFileDeleted: {
      pattern: {
        detailType: ['DataChanged'],
        detail: {
          event: {
            op: ['DELETE'],
          },
          table: {
            name: ['file'],
          },
        },
      },
      targets: {
        s3FileDeleter: s3FileDeleterFunction,
      },
    },
  });

  const dataImportFunction = new Function(stack, 'DataImporter', {
    handler: `${handlersDir}/data-import/import.handler`,
    functionName: `${stack.stage}-DataImporter`,
    onFailure: new SqsDestination(dataChangeDlq),
    role: lambdaFilesRole,
    timeout: '15 minutes',
    bind: [HASURA_ADMIN_SECRET],
    environment: {
      ORGANISATION_FILE_BUCKET: fileStorageBucket.cdk.bucket.bucketName,
      ORG_ROLE_ARN: fileOrgRole.roleArn,
      HASURA_ENDPOINT: getEnv('HASURA_ENDPOINT'),
      HASURA_TENANT_ENDPOINT: getEnv('HASURA_TENANT_ENDPOINT'),
      POWERTOOLS_DEV: isLocal(stack.stage) ? '1' : '0',
    },
    ...vpcSettings,
  });

  sharedEventBus.addRules(stack, {
    onDataImportUpdated: {
      pattern: {
        detailType: ['DataChanged'],
        detail: {
          event: {
            op: ['UPDATE'],
            data: {
              new: { Status: ['initiatingImport'] },
              old: { Status: ['valid'] },
            },
          },
          table: {
            name: ['data_import'],
          },
        },
      },
      targets: {
        dataImportImporter: dataImportFunction,
      },
    },
  });

  const draftPolicyDocumentCreatorFunction = new Function(
    stack,
    'DraftPolicyDocumentCreator',
    {
      handler: `${handlersDir}/document-version/draftCreator.handler`,
      onFailure: new SqsDestination(dataChangeDlq),
      functionName: `${stack.stage}-DraftPolicyDocumentCreator`,
      bind: [HASURA_ADMIN_SECRET],
      ...vpcSettings,
      environment: {
        HASURA_ENDPOINT: getEnv('HASURA_ENDPOINT'),
        HASURA_TENANT_ENDPOINT: getEnv('HASURA_TENANT_ENDPOINT'),
      },
    }
  );

  sharedEventBus.addRules(stack, {
    onPolicyDocumentVersionReviewDue: {
      pattern: {
        detailType: ['PolicyDocumentVersionReviewDue'],
      },
      targets: {
        s3FileDeleter: draftPolicyDocumentCreatorFunction,
      },
    },
  });

  // Third party idempotency table
  const thirdPartyIdempotencyTable = new Table(
    stack,
    `${RISKSMART_REGION_PREFIX}ThirdParty_${TABLE_NAME_IDEMPOTENCY}`,
    {
      fields: {
        id: 'string',
      },
      primaryIndex: { partitionKey: 'id' },
      cdk: {
        table: {
          deletionProtection: !isLocal(stack.stage),
        },
      },
    }
  );
  // Third party invitation queue
  const { queue: thirdPartyInvitationSqsQueue } = createQueue(
    stack,
    'ThirdPartyInvitationSqsQueue',
    {
      consumer: {
        function: {
          handler: `${handlersDir}/third-party/invite.handler`,
          bind: [
            HASURA_ADMIN_SECRET,
            AUTH0_CLIENT_SECRET,
            KNOCK_SECRET_KEY,
            thirdPartyIdempotencyTable,
          ],
          retryAttempts: 2,
          environment: {
            AUTH0_DOMAIN: getEnv('AUTH0_DOMAIN_NONCUSTOM'),
            AUTH0_MANAGEMENT_CLIENT_ID: getEnv('AUTH0_MANAGEMENT_CLIENT_ID'),
            AUTH0_THIRD_PARTY_CONNECTION_NAME: getEnv(
              'AUTH0_THIRD_PARTY_CONNECTION_NAME'
            ),
            AUTH0_THIRD_PARTY_CLIENT_ID: getEnv('AUTH0_THIRD_PARTY_CLIENT_ID'),
            HASURA_ENDPOINT: getEnv('HASURA_ENDPOINT'),
            HASURA_TENANT_ENDPOINT: getEnv('HASURA_TENANT_ENDPOINT'),
          },
        },
      },
    }
  );

  // Third party questionnaire update status queue
  const { queue: thirdPartyUpdateStatusQueue } = createQueue(
    stack,
    'ThirdPartyResponseUpdateStatusSqsQueue',
    {
      consumer: {
        function: {
          handler: `${handlersDir}/notifications/thirdPartyUpdateQuestionnaireResponseStatusNotifier.handler`,
          bind: [
            HASURA_ADMIN_SECRET,
            AUTH0_CLIENT_SECRET,
            KNOCK_SECRET_KEY,
            thirdPartyIdempotencyTable,
          ],
          retryAttempts: 2,
          deadLetterQueueEnabled: true,
          environment: {
            AUTH0_DOMAIN: getEnv('AUTH0_DOMAIN_NONCUSTOM'),
            AUTH0_MANAGEMENT_CLIENT_ID: getEnv('AUTH0_MANAGEMENT_CLIENT_ID'),
            AUTH0_THIRD_PARTY_CONNECTION_NAME: getEnv(
              'AUTH0_THIRD_PARTY_CONNECTION_NAME'
            ),
            AUTH0_THIRD_PARTY_CLIENT_ID: getEnv('AUTH0_THIRD_PARTY_CLIENT_ID'),
            HASURA_ENDPOINT: getEnv('HASURA_ENDPOINT'),
            HASURA_TENANT_ENDPOINT: getEnv('HASURA_TENANT_ENDPOINT'),
          },
        },
      },
    }
  );

  const authApiKeyFunction = new Function(stack, 'ApiKeyAuthoriserV2', {
    handler: `${handlersDir}/auth/key.handler`,
    bind: [REST_API_KEY],
    environment: {
      JWT_ISS: `https://${getEnv('AUTH0_DOMAIN')}/`,
      JWT_AUD: getEnv('AUTH0_API_REST_AUDIENCE'),
    },
    ...vpcSettings,
  });

  const sqsEndpoint = getEnv('SQS_ENDPOINT', true);

  const catchAllHandler = new Function(stack, 'catchAllRouteHandler', {
    bind: [
      HASURA_ADMIN_SECRET,
      AUTH0_CLIENT_SECRET,
      KNOCK_SECRET_KEY,
      thirdPartyInvitationSqsQueue,
      sharedEventBus,
      thirdPartyUpdateStatusQueue,
    ],
    handler: `${handlersDir}/router/router.handler`,
    functionName: `${stack.stage}-catchAllRouteHandler`,
    role: basicAPIGatewayLambdaRole,
    timeout: '30 seconds',
    environment: {
      POWERTOOLS_DEV: isLocal(stack.stage) ? '1' : '0',
      HASURA_ENDPOINT: getEnv('HASURA_ENDPOINT'),
      HASURA_TENANT_ENDPOINT: getEnv('HASURA_TENANT_ENDPOINT'),
      ORGANISATION_FILE_BUCKET: fileStorageBucket.cdk.bucket.bucketName,
      ORG_ROLE_ARN: fileOrgRole.roleArn,
      AUTH0_DOMAIN: getEnv('AUTH0_DOMAIN_NONCUSTOM'),
      AUTH0_MANAGEMENT_CLIENT_ID: getEnv('AUTH0_MANAGEMENT_CLIENT_ID'),
      AUTH0_THIRD_PARTY_CONNECTION_NAME: getEnv(
        'AUTH0_THIRD_PARTY_CONNECTION_NAME'
      ),
      AUTH0_THIRD_PARTY_CLIENT_ID: getEnv('AUTH0_THIRD_PARTY_CLIENT_ID'),
      AUTH0_RISK_SMART_REST_API_CLIENT_ID: getEnv(
        'AUTH0_RISK_SMART_REST_API_CLIENT_ID'
      ),
      REACT_APP_AUTH0_CLIENT_ID: getEnv('REACT_APP_AUTH0_CLIENT_ID'),
      AUTH0_RISK_SMART_CIRCLE_CLIENT_ID:
        getEnv('AUTH0_RISK_SMART_CIRCLE_CLIENT_ID', true) ?? '',
      SCIM_INTERNAL_API_URL: getEnv('SCIM_INTERNAL_API_URL'),
      ...(sqsEndpoint ? { SQS_ENDPOINT: sqsEndpoint } : {}),
    },
    permissions: [invokeInternalApiPermission],
    ...vpcSettings,
  });

  const api = new Api(stack, 'api', {
    authorizers: {
      auth0: {
        type: 'jwt',
        jwt: {
          issuer: `https://${getEnv('AUTH0_DOMAIN')}/`,
          audience: [
            // Standard user token audience
            getEnv('AUTH0_API_REST_AUDIENCE'),
          ],
        },
      },
      auth0Integrations: {
        type: 'jwt',
        jwt: {
          issuer: `https://${getEnv('AUTH0_DOMAIN_NONCUSTOM')}/`,
          audience: [
            // Allow integration tokens to access certain REST API functions (from n8n workflows)
            getEnv('AUTH0_API_INTEGRATIONS_AUDIENCE'),
          ],
        },
      },
      key: {
        type: 'lambda',
        function: authApiKeyFunction,
        identitySource: ['$request.header.RestApiKey'],
      },
    },
    defaults: {
      authorizer: 'auth0',
      function: {
        ...vpcSettings,
        timeout: '30 seconds',
        bind: [sharedEventBus],
        environment: {
          POWERTOOLS_DEV: isLocal(stack.stage) ? '1' : '0',
          HASURA_ENDPOINT: getEnv('HASURA_ENDPOINT'),
          HASURA_TENANT_ENDPOINT: getEnv('HASURA_TENANT_ENDPOINT'),
        },
      },
    },
    customDomain: isLocal(stack.stage)
      ? undefined
      : {
          domainName: `rest-api.${DOMAIN_NAME_PREFIX}${envSettings.subdomain}.risksmart.link`,
        },
    routes: {
      // CREATE
      'POST /bedrock': {
        function: {
          handler: `${handlersDir}/bedrock/post.handler`,
          functionName: `${RISKSMART_REGION_PREFIX}${stack.stage}-postBedrockSuggestion`,
          role: lambdaBedRockRole,
          environment: {
            BEDROCK_GUARDRAIL_IDENTIFIER: getEnv('BEDROCK_GUARDRAIL_IDENTIFIER'),
            BEDROCK_GUARDRAIL_VERSION: getEnv('BEDROCK_GUARDRAIL_VERSION'),
          },
        },
      },
      'POST /files/presigned': {
        function: {
          handler: `${handlersDir}/files/presigned/post.handler`,
          functionName: `${RISKSMART_REGION_PREFIX}${stack.stage}-postRelationFilesPresignedUrls`,
          role: lambdaFilesRole,
          environment: {
            ORGANISATION_FILE_BUCKET: fileStorageBucket.cdk.bucket.bucketName,
            ORG_ROLE_ARN: fileOrgRole.roleArn,
          },
        },
      },
      'POST /files/save': {
        function: {
          handler: `${handlersDir}/files/save/post.handler`,
          functionName: `${RISKSMART_REGION_PREFIX}${stack.stage}-postRelationFilesSave`,
          role: lambdaFilesRole,
          environment: {
            ORG_ROLE_ARN: fileOrgRole.roleArn,
          },
        },
      },
      'POST /data-import/start-import': apiHandler(
        'dataImportStartImport',
        'data-import/startImport.handler',
        {
          role: lambdaFilesRole,
        }
      ),
      'POST /data-export/one-off-export': apiHandler(
        'dataExportOneOffExport',
        'data-export/oneOffExport.handler',
        {
          role: lambdaOneOffExportRole,
          environment: {
            DATA_EXPORT_BUCKET: dataExportBucket.cdk.bucket.bucketName,
            ORGANISATION_FILE_BUCKET: fileStorageBucket.cdk.bucket.bucketName,
            ORG_ROLE_ARN: dataExportRole.roleArn,
          },
        }
      ),
      'POST /data-export/create-schedule': apiHandler(
        'dataExportCreateSchedule',
        'data-export/createSchedule.handler',
        {
          role: lambdaCreateExportScheduleRole,
        }
      ),
      'POST /data-export/test-schedule': apiHandler(
        'dataExportTestSchedule',
        'data-export/testSchedule.handler',
        {
          role: lambdaTestScheduleRole,
        }
      ),
      'POST /pdf/generate': {
        function: {
          handler: `${handlersDir}/pdf/generatePdf.handler`,
          functionName: `${RISKSMART_REGION_PREFIX}${stack.stage}-generatePdf`,
          bind: [HYBISCUS_API_KEY],
          environment: {
            HYBISCUS_API_URL: getEnv('HYBISCUS_API_URL'),
          },
        },
      },
      'GET /pdf/status/{taskId}': {
        function: {
          handler: `${handlersDir}/pdf/checkPdfStatus.handler`,
          bind: [HYBISCUS_API_KEY],
          functionName: `${RISKSMART_REGION_PREFIX}${stack.stage}-checkPdfStatus`,
          environment: {
            HYBISCUS_API_URL: getEnv('HYBISCUS_API_URL'),
          },
        },
      },
      'GET /pdf/download/{taskId}': {
        function: {
          handler: `${handlersDir}/pdf/downloadPdf.handler`,
          bind: [HYBISCUS_API_KEY],
          functionName: `${stack.stage}-downloadPdf`,
          environment: {
            HYBISCUS_API_URL: getEnv('HYBISCUS_API_URL'),
          },
        },
      },
      'POST /data-import/validate': apiHandler(
        'dataImportValidate',
        'data-import/validate.handler',
        {
          role: lambdaFilesRole,
          environment: {
            ORGANISATION_FILE_BUCKET: fileStorageBucket.cdk.bucket.bucketName,
            ORG_ROLE_ARN: fileOrgRole.roleArn,
            GENERATE_GUID_IDS: 'true',
          },
        }
      ),
      'POST /events': {
        authorizer: 'key',
        function: {
          handler: `${handlersDir}/events/data.handler`,
          functionName: `${RISKSMART_REGION_PREFIX}${stack.stage}-postEventV2`,
          memorySize: 128,
        },
      },
      'POST /slack/callback': {
        authorizer: 'auth0',
        function: {
          handler: `${handlersDir}/slack/callback.handler`,
          functionName: `${RISKSMART_REGION_PREFIX}${stack.stage}-slackCallback`,
          environment: {
            SLACK_CLIENT_ID: getEnv('SLACK_CLIENT_ID'),
          },
          bind: [SLACK_CLIENT_SECRET, KNOCK_SECRET_KEY],
        },
      },
      'POST /third-party-contact/resend-password-reset': {
        authorizer: 'auth0',
        function: {
          handler: `${handlersDir}/third-party-contact/resendPasswordReset.handler`,
          functionName: `${RISKSMART_REGION_PREFIX}${stack.stage}-tppResendPasswordReset`,
          environment: {
            AUTH0_DOMAIN: getEnv('AUTH0_DOMAIN_NONCUSTOM'),
            AUTH0_MANAGEMENT_CLIENT_ID: getEnv('AUTH0_MANAGEMENT_CLIENT_ID'),
            AUTH0_THIRD_PARTY_CONNECTION_NAME: getEnv(
              'AUTH0_THIRD_PARTY_CONNECTION_NAME'
            ),
            AUTH0_THIRD_PARTY_CLIENT_ID: getEnv('AUTH0_THIRD_PARTY_CLIENT_ID'),
          },
          bind: [AUTH0_CLIENT_SECRET],
        },
      },
      'POST /integration/skyscanner-jira-to-risk': {
        authorizer: 'auth0Integrations',
        function: {
          bind: [HASURA_ADMIN_SECRET],
          handler: `${handlersDir}/integration/jira-to-risk/skyscanner/skyscannerJiraToRisk.handler`,
          functionName: `${RISKSMART_REGION_PREFIX}${stack.stage}-skyscannerJiraToRisk`,
          role: lambdaSkyscannerJiraIntegrationRole,
          environment: {
            WEB_APP_URL: getEnv('WEB_APP_URL'),
          },
        },
      },
      'POST /integration/allica-jira-to-issue': {
        authorizer: 'auth0Integrations',
        function: {
          bind: [HASURA_ADMIN_SECRET],
          handler: `${handlersDir}/integration/jira-to-issue/allica/jiraToIssue.handler`,
          functionName: `${RISKSMART_REGION_PREFIX}${stack.stage}-allicaJiraToIssue`,
          role: lambdaAllicaJiraIntegrationRole,
          environment: {
            WEB_APP_URL: getEnv('WEB_APP_URL'),
          },
        },
      },
      // READ
      'GET /integration/asos-data': {
        authorizer: 'auth0Integrations',
        function: {
          bind: [HASURA_ADMIN_SECRET],
          handler: `${handlersDir}/integration/asos/asosDataQuery.handler`,
          functionName: `${stack.stage}-asosDataQuery`,
        },
      },
      'GET /data-import/template': {
        function: {
          bind: [HASURA_ADMIN_SECRET],
          handler: `${handlersDir}/data-import/getTemplate.handler`,
          functionName: `${RISKSMART_REGION_PREFIX}${stack.stage}-dataImportGetTemplate`,
        },
      },
      'GET /logo': `${handlersDir}/logo/get.handler`,
      'GET /files/{fileId}': {
        function: {
          handler: `${handlersDir}/files/get.handler`,
          functionName: `${RISKSMART_REGION_PREFIX}${stack.stage}-getFile`,
          role: lambdaFilesRole,
          environment: {
            ORGANISATION_FILE_BUCKET: fileStorageBucket.cdk.bucket.bucketName,
            ORG_ROLE_ARN: fileOrgRole.roleArn,
          },
        },
      },

      // Have to split out routes rather than ANY to support CORS OPTIONS black-holing to 204.
      'POST /{proxy+}': apiKeyHandler(catchAllHandler),
      'PATCH /{proxy+}': apiKeyHandler(catchAllHandler),
      'PUT /{proxy+}': apiKeyHandler(catchAllHandler),
      'GET /{proxy+}': apiKeyHandler(catchAllHandler),
      'DELETE /{proxy+}': apiKeyHandler(catchAllHandler),
    },
  });
  stack.addOutputs({
    ApiEndpoint: api.url,
  });

  return { api };
}

const createQueue = (stack: Stack, id: string, props: QueueProps) => {
  const deadLetterQueueId = `${stack.stage}-${id}DLQ`;
  const alarmId = `${deadLetterQueueId}Alarm`;
  const dlq = new Queue(stack, deadLetterQueueId, {
    queueName: deadLetterQueueId,
  });

  const alarm = new Alarm(stack, alarmId, {
    alarmName: alarmId,
    actionsEnabled: true,
    alarmDescription: `Error notifying for ${id}`,
    threshold: 1,
    treatMissingData: TreatMissingData.NOT_BREACHING,
    metric: dlq.metricApproximateNumberOfMessagesVisible(),
    evaluationPeriods: 1,
    comparisonOperator: ComparisonOperator.GREATER_THAN_OR_EQUAL_TO_THRESHOLD,
    datapointsToAlarm: 1,
  });

  const queueProps: QueueProps = {
    ...props,
    cdk: {
      ...props.cdk,
      queue: {
        ...props.cdk?.queue,
        deadLetterQueue: {
          maxReceiveCount: 3,
          queue: dlq,
        },
      },
    },
  };

  const queue = new SSTQueue(stack, id, queueProps);

  return { queue, alarm, dlq };
};
