import { Duration } from 'aws-cdk-lib';
import {
  Alarm,
  ComparisonOperator,
  TreatMissingData,
} from 'aws-cdk-lib/aws-cloudwatch';
import { ISecurityGroup, SecurityGroup } from 'aws-cdk-lib/aws-ec2';
import { EventField, RuleTargetInput } from 'aws-cdk-lib/aws-events';
import {
  Effect,
  ManagedPolicy,
  PolicyStatement,
  Role,
  ServicePrincipal,
} from 'aws-cdk-lib/aws-iam';
import { SqsDestination } from 'aws-cdk-lib/aws-lambda-destinations';
import { ISecret, Secret } from 'aws-cdk-lib/aws-secretsmanager';
import { Queue } from 'aws-cdk-lib/aws-sqs';
import { StringParameter } from 'aws-cdk-lib/aws-ssm';
import {
  Config,
  Cron,
  EventBus,
  Function,
  FunctionProps,
  Queue as SSTQueue,
  Stack,
  StackContext,
  Table,
  use,
} from 'sst/constructs';

import { BindingResource } from 'sst/constructs/util/binding';
import { TABLE_NAME_IDEMPOTENCY, RISKSMART_REGION_PREFIX } from './constants';
import { getEnv } from './environment';
import { isLocal } from './isLocal';
import { Secrets } from './SecretsStack';
import { SharedInfraStack } from './SharedInfraStack';
import { getEnvSettings } from './stageEnv/env';
import { getFunctionVpcProps } from './vpc';

const handlersDir = 'packages/rest-api/src/handlers';
const isRiskSmartRegion = process.env.IS_RISKSMART_REGION === 'true';
const appSuffix = isRiskSmartRegion ? '-app' : '-risksmartApp';

export function EventStack({ stack }: StackContext) {
  const {
    HASURA_ADMIN_SECRET,
    KNOCK_SECRET_KEY,
    PDP_API_KEY,
    PENSIONBEE_EXPORT_BUCKET,
  } = use(Secrets);
  const { sharedEventBus, dataChangeDlq: sharedDataChangeDlq } =
    use(SharedInfraStack);

  const vpcSettings = getFunctionVpcProps(stack);
  const envSettings = getEnvSettings(stack.stage);
  const lambdaPermitRole = new Role(
    stack,
    `${RISKSMART_REGION_PREFIX}lambdaPermitPermissionsRole`,
    {
      roleName: `${RISKSMART_REGION_PREFIX}${stack.stage}-lambdaPermitPermissionsRole`,
      assumedBy: new ServicePrincipal('lambda.amazonaws.com'),
      managedPolicies: [
        ManagedPolicy.fromAwsManagedPolicyName(
          'service-role/AWSLambdaVPCAccessExecutionRole'
        ),
      ],
    }
  );

  const tenantConfigDynamoReadPolicy = new PolicyStatement({
    actions: ['dynamodb:GetItem', 'dynamodb:Query', 'dynamodb:Scan'],
    resources: [
      `arn:aws:dynamodb:${stack.region}:${stack.account}:table/${envSettings.cdkStagePrefix(
        stack.stage
      )}-risksmartApp-GlobalTenantConfig`,
      `arn:aws:dynamodb:${stack.region}:${stack.account}:table/${envSettings.cdkStagePrefix(
        stack.stage
      )}-risksmartApp-GlobalTenantConfig/index/*`,
    ],
    effect: Effect.ALLOW,
  });
  const rdsSecretPolicyStatement = new PolicyStatement({
    effect: Effect.ALLOW,
    actions: ['secretsmanager:GetSecretValue'],
    resources: [
      `arn:aws:secretsmanager:${stack.region}:${stack.account}:secret:${envSettings.cdkStagePrefix(
        stack.stage
      )}-risksmartApp-*-ConnectionSecret-??????`,
    ],
  });
  lambdaPermitRole.addToPolicy(rdsSecretPolicyStatement);
  lambdaPermitRole.addToPolicy(tenantConfigDynamoReadPolicy);

  let securityGroups: ISecurityGroup[] | undefined = undefined;

  // Set permitEndpoint value based on environment
  if (!isLocal(stack.stage)) {
    if (!vpcSettings?.vpc) {
      throw new Error('VPC required');
    }

    // Name needs fixing for multi-region deploys when we add SST to new regions

    // Set up security groups
    const trpcDataSg = SecurityGroup.fromLookupByName(
      stack,
      'TRPCDataSG',
      `${envSettings.cdkStagePrefix(stack.stage)}${appSuffix}-TRPCDataSg`,
      vpcSettings?.vpc
    );

    securityGroups = [trpcDataSg];
    securityGroups.push(...(vpcSettings.securityGroups ?? []));
  }

  sharedEventBus.addRules(stack, {
    riskScoreAggregatorTrigger: {
      pattern: {
        detailType: ['DataChanged'],
        detail: {
          event: {
            op: ['INSERT', 'UPDATE', 'DELETE'],
          },
          table: {
            name: [
              'assessment_result_parent',
              'risk_assessment_result',
              'test_result',
              'control_parent',
              'risk',
            ],
          },
        },
      },
      targets: {
        riskScoreAggregator: {
          function: {
            onFailure: new SqsDestination(sharedDataChangeDlq),
            handler: `${handlersDir}/aggregations/riskScore.handler`,
            functionName: `${stack.stage}-event-RiskScoreAggregator`,
            bind: [HASURA_ADMIN_SECRET],
            environment: {
              HASURA_ENDPOINT: getEnv('HASURA_ENDPOINT'),
              HASURA_TENANT_ENDPOINT: getEnv('HASURA_TENANT_ENDPOINT'),
              POWERTOOLS_DEV: isLocal(stack.stage) ? '1' : '0',
            },
          },
        },
      },
    },
  });

  sharedEventBus.addRules(stack, {
    permitPermissionsTrigger: {
      pattern: {
        detailType: ['DataChanged'],
        detail: {
          event: {
            op: ['INSERT', 'UPDATE', 'DELETE'],
          },
          table: {
            name: [
              'node',
              'linked_item',
              'owner',
              'contributor',
              'owner_group',
              'contributor_group',
              'user',
              'user_group',
              'user_group_user',
              'user_role',
            ],
          },
        },
      },
      targets: {
        permitPermissionsProcessor: {
          function: {
            onFailure: new SqsDestination(sharedDataChangeDlq),
            handler: `${handlersDir}/permit/events/handler.handler`,
            functionName: `${stack.stage}-event-PermitPermissionsProcessor`,
            bind: [HASURA_ADMIN_SECRET, PDP_API_KEY],
            role: lambdaPermitRole,
            timeout: '2 minutes',
            environment: Object.assign({
              HASURA_ENDPOINT: getEnv('HASURA_ENDPOINT'),
              HASURA_TENANT_ENDPOINT: getEnv('HASURA_TENANT_ENDPOINT'),
              POWERTOOLS_DEV: isLocal(stack.stage) ? '1' : '0',
              PERMIT_LOG_LEVEL: 'debug',
              PERMIT_API_URL: 'https://api.permit.io',
              // TODO: this is blank for now, expecting entire lambda to be replaced in EDA work
              PDP_ENDPOINT: '-',
              TENANT_CONFIG_TABLE: isLocal(stack.stage)
                ? getEnv('TENANT_CONFIG_TABLE', true)
                : `${envSettings.cdkStagePrefix(stack.stage)}-risksmartApp-GlobalTenantConfig`,
              PERMIT_ENABLED: !['prod'].includes(stack.stage)
                ? 'true'
                : 'false',
              LOCAL_DATABASE_CONNECTION_STRING:
                getEnv('LOCAL_DATABASE_CONNECTION_STRING', true) ?? '',
              DYNAMODB_ENDPOINT: isLocal(stack.stage)
                ? getEnv('DYNAMODB_ENDPOINT', true)
                : '',
            }),
            ...vpcSettings,
            securityGroups,
          },
        },
      },
    },
  });

  sharedEventBus.addRules(stack, {
    appetiteAggregatorTrigger: {
      pattern: {
        detailType: ['DataChanged'],
        detail: {
          event: {
            op: ['INSERT', 'UPDATE', 'DELETE'],
          },
          table: {
            name: ['appetite_parent', 'risk'],
          },
        },
      },
      targets: {
        appetiteAggregator: {
          function: {
            onFailure: new SqsDestination(sharedDataChangeDlq),
            handler: `${handlersDir}/aggregations/appetiteAggregation.handler`,
            functionName: `${stack.stage}-event-AppetiteAggregator`,
            bind: [HASURA_ADMIN_SECRET],
            environment: {
              HASURA_ENDPOINT: getEnv('HASURA_ENDPOINT'),
              HASURA_TENANT_ENDPOINT: getEnv('HASURA_TENANT_ENDPOINT'),
              POWERTOOLS_DEV: isLocal(stack.stage) ? '1' : '0',
            },
          },
        },
      },
    },
  });

  sharedEventBus.addRules(stack, {
    impactRatingChangedTrigger: {
      pattern: {
        detailType: ['DataChanged'],
        detail: {
          event: {
            op: ['INSERT', 'UPDATE'],
          },
          table: {
            name: ['impact_rating'],
          },
        },
      },
      targets: {
        impactRatingChanged: {
          function: {
            onFailure: new SqsDestination(sharedDataChangeDlq),
            handler: `${handlersDir}/impact-ratings/events/impactRatingChangedHandler.handler`,
            functionName: `${stack.stage}-event-ImpactRatingChanged`,
            bind: [HASURA_ADMIN_SECRET],
            environment: {
              HASURA_ENDPOINT: getEnv('HASURA_ENDPOINT'),
              HASURA_TENANT_ENDPOINT: getEnv('HASURA_TENANT_ENDPOINT'),
            },
          },
        },
      },
    },
  });

  sharedEventBus.addRules(stack, {
    controlTestChangedTrigger: {
      pattern: {
        detailType: ['DataChanged'],
        detail: {
          event: {
            op: ['INSERT', 'UPDATE'],
          },
          table: {
            name: ['test_result'],
          },
        },
      },
      targets: {
        controlTestChanged: {
          function: {
            onFailure: new SqsDestination(sharedDataChangeDlq),
            handler: `${handlersDir}/controls/events/testResultChanged.handler`,
            functionName: `${stack.stage}-event-ControlTestChanged`,
            bind: [HASURA_ADMIN_SECRET],
            environment: {
              HASURA_ENDPOINT: getEnv('HASURA_ENDPOINT'),
              HASURA_TENANT_ENDPOINT: getEnv('HASURA_TENANT_ENDPOINT'),
            },
          },
        },
      },
    },
  });

  sharedEventBus.addRules(stack, {
    indicatorResultChangedTrigger: {
      pattern: {
        detailType: ['DataChanged'],
        detail: {
          event: {
            op: ['INSERT', 'UPDATE', 'DELETE'],
          },
          table: {
            name: ['indicator_result'],
          },
        },
      },
      targets: {
        controlTestChanged: {
          function: {
            onFailure: new SqsDestination(sharedDataChangeDlq),
            handler: `${handlersDir}/indicators/events/indicatorResultChanged.handler`,
            functionName: `${stack.stage}-event-IndicatorResultChanged`,
            bind: [HASURA_ADMIN_SECRET],
            environment: {
              HASURA_ENDPOINT: getEnv('HASURA_ENDPOINT'),
              HASURA_TENANT_ENDPOINT: getEnv('HASURA_TENANT_ENDPOINT'),
              POWERTOOLS_DEV: isLocal(stack.stage) ? '1' : '0',
            },
          },
        },
      },
    },
  });

  sharedEventBus.addRules(stack, {
    attestationsChangedTrigger: {
      pattern: {
        detailType: ['DataChanged'],
        detail: {
          event: {
            op: ['INSERT', 'UPDATE', 'DELETE'],
          },
          table: {
            name: [
              'attestation_config',
              'attestation_group',
              'organisationuser',
              'user_group',
              'user_group_user',
            ],
          },
        },
      },
      targets: {
        refreshAttestations: {
          function: {
            onFailure: new SqsDestination(sharedDataChangeDlq),
            handler: `${handlersDir}/attestations/events/refreshAttestations.handler`,
            functionName: `${stack.stage}-event-refreshAttestations`,
            bind: [HASURA_ADMIN_SECRET],
            environment: {
              POWERTOOLS_DEV: isLocal(stack.stage) ? '1' : '0',
              HASURA_ENDPOINT: getEnv('HASURA_ENDPOINT'),
              HASURA_TENANT_ENDPOINT: getEnv('HASURA_TENANT_ENDPOINT'),
              THIRD_PARTY_CONNECTION_NAME: getEnv(
                'AUTH0_THIRD_PARTY_CONNECTION_NAME'
              ),
            },
          },
        },
      },
    },
  });

  sharedEventBus.addRules(stack, {
    newAttestationRequired: {
      pattern: {
        detailType: ['DataChanged'],
        detail: {
          event: {
            op: ['INSERT', 'UPDATE'],
          },
          table: {
            name: ['document_file'],
          },
        },
      },
      targets: {
        checkAttestations: {
          function: {
            onFailure: new SqsDestination(sharedDataChangeDlq),
            handler: `${handlersDir}/attestations/events/checkAttestations.handler`,
            functionName: `${stack.stage}-event-checkAttestations`,
            bind: [HASURA_ADMIN_SECRET],
            environment: {
              HASURA_ENDPOINT: getEnv('HASURA_ENDPOINT'),
              HASURA_TENANT_ENDPOINT: getEnv('HASURA_TENANT_ENDPOINT'),
              POWERTOOLS_DEV: isLocal(stack.stage) ? '1' : '0',
            },
          },
        },
      },
    },
  });

  sharedEventBus.addRules(stack, {
    documentAssessmentResultChangedT: {
      pattern: {
        detailType: ['DataChanged'],
        detail: {
          event: {
            op: ['INSERT', 'UPDATE', 'DELETE'],
          },
          table: {
            name: ['assessment_result_parent'],
          },
        },
      },
      targets: {
        documentAssessmentResultChanged: {
          function: {
            onFailure: new SqsDestination(sharedDataChangeDlq),
            handler: `${handlersDir}/assessment-results/events/assessmentResultParentChanged.handler`,
            functionName: `${stack.stage}-event-AssessmentResultParentChange`,
            bind: [HASURA_ADMIN_SECRET],
            environment: {
              HASURA_ENDPOINT: getEnv('HASURA_ENDPOINT'),
              HASURA_TENANT_ENDPOINT: getEnv('HASURA_TENANT_ENDPOINT'),
              POWERTOOLS_DEV: isLocal(stack.stage) ? '1' : '0',
            },
          },
        },
      },
    },
  });

  const ratingUpdateScheduleRecalculateFunction = new Function(
    stack,
    'RatingUpdateScheduleRecalc',
    {
      onFailure: new SqsDestination(sharedDataChangeDlq),
      handler: `${handlersDir}/assessment-results/events/ratingUpdateScheduleRecalculate.handler`,
      functionName: `${stack.stage}-event-RatingUpdateScheduleRecalc`,
      bind: [HASURA_ADMIN_SECRET],
      environment: {
        HASURA_ENDPOINT: getEnv('HASURA_ENDPOINT'),
        HASURA_TENANT_ENDPOINT: getEnv('HASURA_TENANT_ENDPOINT'),
        POWERTOOLS_DEV: isLocal(stack.stage) ? '1' : '0',
      },
    }
  );

  sharedEventBus.addRules(stack, {
    ratingUpdateScheduleRecalcTrig: {
      pattern: {
        detailType: ['DataChanged'],
        detail: {
          event: {
            op: ['UPDATE'],
          },
          table: {
            name: [
              'risk_assessment_result',
              'document_assessment_result',
              'obligation_assessment_result',
            ],
          },
        },
      },
      targets: {
        ratingUpdateScheduleRecalc: ratingUpdateScheduleRecalculateFunction,
      },
    },
  });

  sharedEventBus.addRules(stack, {
    approverResponseUpdatedTrigger: {
      pattern: {
        detailType: ['DataChanged'],
        detail: {
          event: {
            op: ['INSERT', 'UPDATE'],
          },
          table: {
            name: ['approver_response'],
          },
        },
      },
      targets: {
        updateChangeRequestStatus: {
          function: {
            bind: [HASURA_ADMIN_SECRET, KNOCK_SECRET_KEY, PDP_API_KEY],
            handler: `${handlersDir}/change-requests/updateStatus.handler`,
            functionName: `${stack.stage}-event-updateCRStatus`,
            environment: {
              HASURA_ENDPOINT: getEnv('HASURA_ENDPOINT'),
              HASURA_TENANT_ENDPOINT: getEnv('HASURA_TENANT_ENDPOINT'),
            },
          },
        },
      },
    },
  });

  sharedEventBus.addRules(stack, {
    relationFileChangedTrigger: {
      pattern: {
        detailType: ['DataChanged'],
        detail: {
          event: {
            op: ['DELETE'],
          },
          table: {
            name: ['relation_file'],
          },
        },
      },
      targets: {
        relationFileChanged: {
          function: {
            onFailure: new SqsDestination(sharedDataChangeDlq),
            handler: `${handlersDir}/relation-file/events/relationFileDeleted.handler`,
            functionName: `${stack.stage}-event-relationFileDeleted`,
            bind: [HASURA_ADMIN_SECRET],
            environment: {
              HASURA_ENDPOINT: getEnv('HASURA_ENDPOINT'),
              HASURA_TENANT_ENDPOINT: getEnv('HASURA_TENANT_ENDPOINT'),
              POWERTOOLS_DEV: isLocal(stack.stage) ? '1' : '0',
            },
          },
        },
      },
    },
  });

  // Attestation Cycle Events
  sharedEventBus.addRules(stack, {
    onAttestationRecordChanged: {
      pattern: {
        detailType: ['DataChanged'],
        detail: {
          event: {
            op: ['UPDATE'],
          },
          table: {
            name: ['attestation_record'],
          },
        },
      },
      targets: {
        onAttestationRecordChanged: {
          function: {
            onFailure: new SqsDestination(sharedDataChangeDlq),
            handler: `${handlersDir}/attestation-cycle/events/on-attestation-record-changed.handler`,
            functionName: `${stack.stage}-event-on-attestation-record-changed`,
            bind: [HASURA_ADMIN_SECRET],
            environment: {
              POWERTOOLS_DEV: isLocal(stack.stage) ? '1' : '0',
              HASURA_ENDPOINT: getEnv('HASURA_ENDPOINT'),
              HASURA_TENANT_ENDPOINT: getEnv('HASURA_TENANT_ENDPOINT'),
              THIRD_PARTY_CONNECTION_NAME: getEnv(
                'AUTH0_THIRD_PARTY_CONNECTION_NAME'
              ),
            },
          },
        },
      },
    },
  });

  sharedEventBus.addRules(stack, {
    onAttestationCycleChanged: {
      pattern: {
        detailType: ['DataChanged'],
        detail: {
          event: {
            op: ['UPDATE', 'INSERT'],
          },
          table: {
            name: ['attestation_cycle'],
          },
        },
      },
      targets: {
        onAttestationCycleChanged: {
          function: {
            onFailure: new SqsDestination(sharedDataChangeDlq),
            handler: `${handlersDir}/attestation-cycle/events/on-attestation-cycle-changed.handler`,
            functionName: `${stack.stage}-on-attestation-cycle-changed`,
            bind: [HASURA_ADMIN_SECRET],
            environment: {
              POWERTOOLS_DEV: isLocal(stack.stage) ? '1' : '0',
              HASURA_ENDPOINT: getEnv('HASURA_ENDPOINT'),
              HASURA_TENANT_ENDPOINT: getEnv('HASURA_TENANT_ENDPOINT'),
              THIRD_PARTY_CONNECTION_NAME: getEnv(
                'AUTH0_THIRD_PARTY_CONNECTION_NAME'
              ),
            },
          },
        },
      },
    },
  });

  sharedEventBus.addRules(stack, {
    onUserGroupUserChanged: {
      pattern: {
        detailType: ['DataChanged'],
        detail: {
          event: {
            op: ['INSERT', 'DELETE'],
          },
          table: {
            name: ['user_group_user'],
          },
        },
      },
      targets: {
        onUserGroupUserChanged: {
          function: {
            onFailure: new SqsDestination(sharedDataChangeDlq),
            handler: `${handlersDir}/attestation-cycle/events/on-user-group-user-changed.handler`,
            functionName: `${stack.stage}-event-on-user-group-user-changed`,
            bind: [HASURA_ADMIN_SECRET],
            environment: {
              POWERTOOLS_DEV: isLocal(stack.stage) ? '1' : '0',
              HASURA_ENDPOINT: getEnv('HASURA_ENDPOINT'),
              HASURA_TENANT_ENDPOINT: getEnv('HASURA_TENANT_ENDPOINT'),
              THIRD_PARTY_CONNECTION_NAME: getEnv(
                'AUTH0_THIRD_PARTY_CONNECTION_NAME'
              ),
            },
          },
        },
      },
    },
  });

  sharedEventBus.addRules(stack, {
    onOrganisationUserChanged: {
      pattern: {
        detailType: ['DataChanged'],
        detail: {
          event: {
            op: ['INSERT', 'DELETE'],
          },
          table: {
            name: ['organisationuser'],
          },
        },
      },
      targets: {
        onOrganisationUserChanged: {
          function: {
            onFailure: new SqsDestination(sharedDataChangeDlq),
            handler: `${handlersDir}/attestation-cycle/events/on-organisation-user-changed.handler`,
            functionName: `${stack.stage}-event-on-organisation-user-changed`,
            bind: [HASURA_ADMIN_SECRET],
            environment: {
              POWERTOOLS_DEV: isLocal(stack.stage) ? '1' : '0',
              HASURA_ENDPOINT: getEnv('HASURA_ENDPOINT'),
              HASURA_TENANT_ENDPOINT: getEnv('HASURA_TENANT_ENDPOINT'),
              THIRD_PARTY_CONNECTION_NAME: getEnv(
                'AUTH0_THIRD_PARTY_CONNECTION_NAME'
              ),
            },
          },
        },
      },
    },
  });

  // embed region name if risksmart region = true
  const dataExportScheduleChangeRole = new Role(
    stack,
    'DataExportScheduleChangeRole',
    {
      roleName: `${RISKSMART_REGION_PREFIX}${stack.stage}-dataExportScheduleChange`,
      assumedBy: new ServicePrincipal('lambda.amazonaws.com'),
      managedPolicies: [
        ManagedPolicy.fromAwsManagedPolicyName(
          'service-role/AWSLambdaVPCAccessExecutionRole'
        ),
      ],
    }
  );
  const dataExportScheduleChangeStatement = new PolicyStatement({
    actions: [
      'events:PutRule',
      'events:PutTargets',
      'events:ListTargetsByRule',
      'events:RemoveTargets',
    ],
    resources: [
      `arn:aws:events:${stack.region}:${stack.account}:rule/${stack.stage}-DataExportScheduleRule-*`,
    ],
    effect: Effect.ALLOW,
  });
  dataExportScheduleChangeRole.addToPolicy(dataExportScheduleChangeStatement);

  const scheduledDataExportDlq = new Queue(stack, `ScheduledDataExport-Dlq`, {
    queueName: `${stack.stage}-scheduledDataExport-dlq`,
  });

  new Alarm(stack, `ScheduledDataExport-DLQAlarm`, {
    alarmName: `${stack.stage}-scheduledDataExport-dlq`,
    actionsEnabled: true,
    alarmDescription: `Error processing scheduled data export`,
    threshold: 1,
    treatMissingData: TreatMissingData.NOT_BREACHING,
    metric: scheduledDataExportDlq.metricApproximateNumberOfMessagesVisible(),
    evaluationPeriods: 1,
    comparisonOperator: ComparisonOperator.GREATER_THAN_OR_EQUAL_TO_THRESHOLD,
    datapointsToAlarm: 1,
  });

  const lambdaScheduledDataExportRole = new Role(
    stack,
    'LambdaScheduledDataExportRole',
    {
      roleName: `${RISKSMART_REGION_PREFIX}${stack.stage}-lambdaScheduledDataExport`,
      assumedBy: new ServicePrincipal('lambda.amazonaws.com'),
      managedPolicies: [
        ManagedPolicy.fromAwsManagedPolicyName(
          'service-role/AWSLambdaVPCAccessExecutionRole'
        ),
      ],
    }
  );
  const scheduledDataExportStatement = new PolicyStatement({
    actions: [
      'secretsmanager:DescribeSecret',
      'secretsmanager:GetSecretValue',
      'events:DisableRule',
    ],
    resources: [
      `arn:aws:secretsmanager:${stack.region}:${stack.account}:secret:${stack.stage}-*-data-export-schedule-secret-*`,
      `arn:aws:events:${stack.region}:${stack.account}:rule/${stack.stage}-DataExportScheduleRule-*`,
    ],
    effect: Effect.ALLOW,
  });
  lambdaScheduledDataExportRole.addToPolicy(scheduledDataExportStatement);
  const scheduledDataExportHandlerFunction = new Function(
    stack,
    'ScheduledDataExport',
    {
      functionName: `${stack.stage}-scheduledDataExport`,
      handler: `${handlersDir}/data-export/events/scheduledDataExport.handler`,
      ...vpcSettings,
      bind: [HASURA_ADMIN_SECRET],
      role: lambdaScheduledDataExportRole,
      timeout: '15 minutes',
      nodejs: {
        sourcemap: true,
        loader: {
          '.node': 'file',
        },
      },
      environment: {
        HASURA_ENDPOINT: getEnv('HASURA_ENDPOINT'),
        HASURA_TENANT_ENDPOINT: getEnv('HASURA_TENANT_ENDPOINT'),
      },
      onFailure: new SqsDestination(scheduledDataExportDlq),
    }
  );

  scheduledDataExportHandlerFunction.addPermission(
    'AllowEventBridgeInvocation',
    {
      principal: new ServicePrincipal('events.amazonaws.com'),
      action: 'lambda:InvokeFunction',
    }
  );

  sharedEventBus.addRules(stack, {
    dataExportScheduleTrigger: {
      pattern: {
        detailType: ['DataChanged'],
        detail: {
          event: {
            op: ['INSERT'],
          },
          table: {
            name: ['data_export_schedule'],
          },
        },
      },
      targets: {
        handleDataExportSchedule: {
          function: {
            onFailure: new SqsDestination(sharedDataChangeDlq),
            handler: `${handlersDir}/data-export/events/scheduleChange.handler`,
            functionName: `${stack.stage}-event-DataExportScheduleChange`,
            bind: [HASURA_ADMIN_SECRET],
            role: dataExportScheduleChangeRole,
            environment: {
              HASURA_TENANT_ENDPOINT: getEnv('HASURA_TENANT_ENDPOINT'),
              SCHEDULED_DATA_EXPORT_HANDLER_ARN:
                scheduledDataExportHandlerFunction.functionArn,
            },
          },
        },
      },
    },
  });

  const table = new Table(
    stack,
    `${RISKSMART_REGION_PREFIX}Events_${TABLE_NAME_IDEMPOTENCY}`,
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

  createFunctionWithConcurrencyQueue(
    'identifyKnockUser',
    ['user'],
    ['INSERT', 'UPDATE'],
    stack,
    sharedEventBus,
    table,
    HASURA_ADMIN_SECRET,
    KNOCK_SECRET_KEY,
    vpcSettings,
    undefined,
    60,
    1,
    undefined,
    30
  );

  createFunctionWithConcurrencyQueue(
    'deleteKnockUser',
    ['user'],
    ['DELETE'],
    stack,
    sharedEventBus,
    table,
    HASURA_ADMIN_SECRET,
    KNOCK_SECRET_KEY,
    vpcSettings,
    undefined,
    5,
    1,
    undefined,
    30
  );

  const mountstreetSecret = Secret.fromSecretNameV2(
    stack,
    'mountstreetSecret',
    'mountstreet-export-config'
  );
  createScheduledEvent({
    name: 'mountstreetDataExport',
    stack,
    schedule: 'cron(0 0 * * ? *)', // Every day at midnight
    handler: 'mountstreetDataExport',
    vpcSettings,
    sharedEventBus,
    hasuraSecret: HASURA_ADMIN_SECRET,
    eventDetails: {},
    environment: {
      MOUNTSTREET_EXPORT_SECRET_NAME: 'mountstreet-export-config',
    },
    secrets: [mountstreetSecret],
    enabled: stack.stage === 'prod',
  });

  const ENTRA_SECRET_ARN_NAME = 'entra-risksmart-data-export-uploader-secret';
  const entraSecret = Secret.fromSecretNameV2(
    stack,
    'entraSecret',
    ENTRA_SECRET_ARN_NAME
  );
  createScheduledEvent({
    name: 'relianceBankDataExport',
    stack,
    schedule: 'cron(0 0 ? * MON *)', // Every Monday at midnight
    handler: 'relianceBankDataExport',
    vpcSettings,
    sharedEventBus,
    hasuraSecret: HASURA_ADMIN_SECRET,
    eventDetails: {},
    environment: {
      ENTRA_SECRET_NAME: ENTRA_SECRET_ARN_NAME,
    },
    secrets: [entraSecret],
    enabled: stack.stage === 'prod',
  });

  const PENSIONBEE_EXPORT_SECRET_NAME = 'pensionbee-export-config';
  const pensionBeeSecret = Secret.fromSecretNameV2(
    stack,
    'pensionBeeSecret',
    PENSIONBEE_EXPORT_SECRET_NAME
  );
  createScheduledEvent({
    name: 'pensionbeeDataExport',
    stack,
    schedule: 'rate(1 hour)',
    handler: 'pensionbeeDataExport',
    vpcSettings,
    sharedEventBus,
    hasuraSecret: HASURA_ADMIN_SECRET,
    eventDetails: {},
    environment: {
      PENSIONBEE_EXPORT_SECRET_NAME,
    },
    secrets: [pensionBeeSecret],
    bind: [PENSIONBEE_EXPORT_BUCKET],
    enabled: stack.stage === 'prod',
    policyStatements: [
      new PolicyStatement({
        actions: ['s3:PutObject'],
        effect: Effect.ALLOW,
        resources: [`arn:aws:s3:::${PENSIONBEE_EXPORT_BUCKET.value}/*`],
      }),
    ],
  });
}

const createFunctionWithConcurrencyQueue = (
  name: string,
  tableNames: string[],
  tableOps: string[],
  stack: Stack,
  sharedEventBus: EventBus,
  table: Table,
  hasuraSecret: Config.Secret,
  knockSecret: Config.Secret,
  vpcSettings:
    | Pick<FunctionProps, 'vpc' | 'vpcSubnets' | 'securityGroups'>
    | undefined,
  lambdaReservedConcurrency?: number,
  maxConcurrency?: number,
  batchSize?: number,
  maxBatchingWindowInSeconds?: number,
  visibilityTimeoutInSeconds?: number
) => {
  const dlq = new Queue(stack, `${name}-Dlq`, {
    queueName: `${stack.stage}-${name}-dlq`,
  });

  new Alarm(stack, `${name}-DLQAlarm`, {
    alarmName: `${stack.stage}-${name}-dlq`,
    actionsEnabled: true,
    alarmDescription: `Error processing messages for ${name}`,
    threshold: 1,
    treatMissingData: TreatMissingData.NOT_BREACHING,
    metric: dlq.metricApproximateNumberOfMessagesVisible(),
    evaluationPeriods: 1,
    comparisonOperator: ComparisonOperator.GREATER_THAN_OR_EQUAL_TO_THRESHOLD,
    datapointsToAlarm: 1,
  });

  const providerFunction = new Function(stack, `${name}`, {
    handler: `${handlersDir}/notifications/${name}.handler`,
    bind: [knockSecret, hasuraSecret, table],
    environment: {
      HASURA_ENDPOINT: getEnv('HASURA_ENDPOINT'),
      HASURA_TENANT_ENDPOINT: getEnv('HASURA_TENANT_ENDPOINT'),
      POWERTOOLS_DEV: isLocal(stack.stage) ? '1' : '0',
    },
    functionName: `${stack.stage}-${name}`,
    timeout: '30 seconds',
    retryAttempts: 2,
    ...vpcSettings,
    reservedConcurrentExecutions: lambdaReservedConcurrency,
  });

  const concurrencyQueue = new SSTQueue(stack, `${name}-Concurrency-Queue`, {
    consumer: {
      function: providerFunction,
      cdk: {
        eventSource: {
          batchSize,
          maxConcurrency,
          maxBatchingWindow: maxBatchingWindowInSeconds
            ? Duration.seconds(maxBatchingWindowInSeconds)
            : undefined,
        },
      },
    },
    cdk: {
      queue: {
        queueName: `${stack.stage}-${name}-concurrency-queue`,
        visibilityTimeout: visibilityTimeoutInSeconds
          ? Duration.seconds(visibilityTimeoutInSeconds)
          : undefined,
        deadLetterQueue: {
          queue: dlq,
          maxReceiveCount: 3,
        },
      },
    },
  });

  sharedEventBus.addRules(stack, {
    [`${name.substring(0, 55)}-sqs-rule`]: {
      pattern: {
        detailType: ['DataChanged'],
        detail: {
          event: {
            op: tableOps,
          },
          table: {
            name: tableNames,
          },
        },
      },
      targets: {
        concurrencyQueue,
      },
    },
  });
};

const createScheduledEvent = ({
  name,
  stack,
  schedule,
  handler,
  vpcSettings,
  sharedEventBus,
  hasuraSecret,
  eventDetails = {},
  environment = {},
  secrets = [],
  bind = [],
  enabled = true,
  policyStatements = [],
}: {
  stack: Stack;
  name: string;
  schedule: `rate(${string})` | `cron(${string})` | undefined;
  handler: string;
  vpcSettings:
    | Pick<FunctionProps, 'vpc' | 'vpcSubnets' | 'securityGroups'>
    | undefined;
  sharedEventBus: EventBus;
  hasuraSecret: Config.Secret;
  eventDetails: { [key: string]: string };
  environment?: { [key: string]: string };
  secrets?: ISecret[];
  bind?: BindingResource[];
  enabled?: boolean;
  policyStatements?: PolicyStatement[];
}) => {
  const dlq = new Queue(stack, `${stack.stage}-${name}-dlq`, {
    queueName: `${stack.stage}-${name}-dlq`,
  });

  new Alarm(stack, `${stack.stage}-${name}-dlq-alarm`, {
    alarmName: `${stack.stage}-${name}-dlq`,
    actionsEnabled: true,
    alarmDescription: `Error running scheduler for ${stack.stage}-${name}`,
    threshold: 1,
    treatMissingData: TreatMissingData.NOT_BREACHING,
    metric: dlq.metricApproximateNumberOfMessagesVisible(),
    evaluationPeriods: 1,
    comparisonOperator: ComparisonOperator.GREATER_THAN_OR_EQUAL_TO_THRESHOLD,
    datapointsToAlarm: 1,
  });

  const handlerFunction = new Function(stack, name, {
    functionName: `${stack.stage}-${name}`,
    handler: `${handlersDir}/scheduled-functions/${handler}.handler`,
    ...vpcSettings,
    bind: [hasuraSecret, sharedEventBus, ...bind],
    environment: {
      HASURA_ENDPOINT: getEnv('HASURA_ENDPOINT'),
      HASURA_TENANT_ENDPOINT: getEnv('HASURA_TENANT_ENDPOINT'),
      POWERTOOLS_DEV: isLocal(stack.stage) ? '1' : '0',
      ...environment,
    },
    nodejs: {
      sourcemap: true,
      loader: {
        '.node': 'file',
      },
    },
    deadLetterQueue: dlq,
  });

  secrets.forEach((secret) => {
    handlerFunction.addToRolePolicy(
      new PolicyStatement({
        actions: ['secretsmanager:GetSecretValue'],
        effect: Effect.ALLOW,
        resources: [`${secret.secretArn}-*`],
      })
    );
    secret.addToResourcePolicy(
      new PolicyStatement({
        actions: ['secretsmanager:GetSecretValue'],
        principals: [handlerFunction.role!],
        effect: Effect.ALLOW,
        resources: [`${secret.secretArn}-*`],
      })
    );
  });

  policyStatements.forEach((statement) => {
    handlerFunction.addToRolePolicy(statement);
  });

  new Cron(stack, `${name}-cron`, {
    enabled,
    schedule,
    job: {
      function: handlerFunction,
      cdk: {
        target: {
          event: RuleTargetInput.fromObject({
            id: EventField.eventId,
            'detail-type': EventField.detailType,
            source: EventField.source,
            account: EventField.account,
            time: EventField.time,
            region: EventField.region,
            resources: EventField.fromPath('$.resources'),
            detail: eventDetails,
          }),
        },
      },
    },
  });
};
