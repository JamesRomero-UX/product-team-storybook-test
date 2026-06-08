import {
  Alarm,
  ComparisonOperator,
  TreatMissingData,
} from 'aws-cdk-lib/aws-cloudwatch';
import { EventField, RuleTargetInput } from 'aws-cdk-lib/aws-events';
import { Queue } from 'aws-cdk-lib/aws-sqs';
import {
  Config,
  Cron,
  CronProps,
  EventBus,
  Function,
  FunctionProps,
  Stack,
  StackContext,
  Table,
  use,
} from 'sst/constructs';

import { TABLE_NAME_IDEMPOTENCY } from './constants';
import { getEnv, getEnvBoolean } from './environment';
import { isLocal } from './isLocal';
import { Secrets } from './SecretsStack';
import { SharedInfraStack } from './SharedInfraStack';
import { getEnvSettings } from './stageEnv/env';
import { getFunctionVpcProps } from './vpc';

const handlersDir = 'packages/rest-api/src/handlers';
const localScheduledNotificationsEnabled = getEnvBoolean(
  'LOCAL_SCHEDULED_NOTIFICATIONS_ENABLED',
  true
);

const nonScheduledTableNames = [
  'acceptance',
  'action',
  'action_update',
  'appetite',
  'approver_response',
  'attestation_record',
  'cause',
  'control',
  'consequence',
  'document',
  'document_file',
  'indicator',
  'indicator_result',
  'issue',
  'issue_update',
  'performance',
  'risk',
  'risk_assessment_result',
  'test_result',
  'third_party_response',
  'user_group',
  'user_group_user',
];

export function Notifications(tenant: string) {
  return ({ stack }: StackContext) => {
    const { KNOCK_SECRET_KEY, HASURA_ADMIN_SECRET, PDP_API_KEY } = use(Secrets);
    const { sharedEventBus } = use(SharedInfraStack);

    const vpcSettings = getFunctionVpcProps(stack);

    const table = new Table(stack, `${tenant}_${TABLE_NAME_IDEMPOTENCY}`, {
      fields: {
        id: 'string',
      },
      primaryIndex: { partitionKey: 'id' },
      cdk: {
        table: {
          deletionProtection: !isLocal(stack.stage),
        },
      },
    });

    createScheduledNotification({
      stack,
      eventBus: sharedEventBus,
      table,
      hasuraSecret: HASURA_ADMIN_SECRET,
      knockSecret: KNOCK_SECRET_KEY,
      vpcSettings,
      tenant,
    });

    createNotification(
      stack,
      sharedEventBus,
      table,
      HASURA_ADMIN_SECRET,
      KNOCK_SECRET_KEY,
      PDP_API_KEY,
      vpcSettings,
      tenant
    );

    return { KNOCK_SECRET_KEY, table };
  };
}

const createNotification = (
  stack: Stack,
  eventBus: EventBus,
  table: Table,
  hasuraSecret: Config.Secret,
  knockSecret: Config.Secret,
  pdpApiKey: Config.Secret,
  vpcSettings:
    | Pick<FunctionProps, 'vpc' | 'vpcSubnets' | 'securityGroups'>
    | undefined,
  tenant: string
) => {
  const notifierDlq = new Queue(stack, `${tenant}$NotifierDlq`, {
    queueName: `${stack.stage}-${tenant}-notifier-dlq`,
  });

  new Alarm(stack, `${tenant}NotifierDLQAlarm`, {
    alarmName: `${stack.stage}-${tenant}-notifier-dlq`,
    actionsEnabled: true,
    alarmDescription: `Error notifying for ${tenant}`,
    threshold: 1,
    treatMissingData: TreatMissingData.NOT_BREACHING,
    metric: notifierDlq.metricApproximateNumberOfMessagesVisible(),
    evaluationPeriods: 1,
    comparisonOperator: ComparisonOperator.GREATER_THAN_OR_EQUAL_TO_THRESHOLD,
    datapointsToAlarm: 1,
  });
  const KNOCK_HOST = getEnv('KNOCK_HOST', true);

  const providerFunction = new Function(stack, `${tenant}Notifier`, {
    handler: `${handlersDir}/notifications/orchestrators/notifier.handler`,
    bind: [knockSecret, hasuraSecret, table, pdpApiKey],
    environment: {
      ...(KNOCK_HOST ? { KNOCK_HOST } : {}),
      HASURA_ENDPOINT: getEnv('HASURA_ENDPOINT'),
      HASURA_TENANT_ENDPOINT: getEnv('HASURA_TENANT_ENDPOINT'),
      POWERTOOLS_DEV: isLocal(stack.stage) ? '1' : '0',
      LOCAL_NOTIFICATIONS_ENABLED:
        getEnv('LOCAL_NOTIFICATIONS_ENABLED', true) ?? 'false',
    },
    functionName: `${stack.stage}-${tenant}-notifier`,
    retryAttempts: 2,
    ...vpcSettings,
    deadLetterQueue: notifierDlq,
  });

  eventBus.addRules(stack, {
    [`${tenant}-dataChangedNotifier`.substring(0, 20)]: {
      pattern: {
        detailType: ['DataChanged'],
        detail: {
          meta: {
            tenant: [tenant],
          },
          event: {
            op: ['INSERT', 'UPDATE', 'DELETE'],
          },
          table: {
            name: nonScheduledTableNames,
          },
        },
      },
      targets: {
        func: providerFunction,
      },
    },
    [`${tenant}-polled-notifier`]: {
      pattern: {
        detailType: [
          'IssueDue',
          'IssueOverdue',
          'ActionDue',
          'ActionOverdue',
          'ScheduleDue',
          'ScheduleOverdue',
          'PolicyAttestationReminder',
          'PolicyDocumentVersionReviewDue',
          'PolicyDocumentVersionReviewUpcoming',
        ],
        detail: {
          meta: {
            tenant: [tenant],
          },
        },
      },
      targets: {
        func: providerFunction,
      },
    },
  });
};

const createScheduledNotification = ({
  stack,
  eventBus,
  hasuraSecret,
  vpcSettings,
  tenant,
  cronSchedule,
}: {
  stack: Stack;
  eventBus: EventBus;
  table: Table;
  hasuraSecret: Config.Secret;
  knockSecret: Config.Secret;
  vpcSettings:
    | Pick<FunctionProps, 'vpc' | 'vpcSubnets' | 'securityGroups'>
    | undefined;
  tenant: string;
  cronSchedule?: CronProps['schedule'];
}) => {
  const pollerDlq = new Queue(stack, `${tenant}ScheduledPollerFunctionDlq`, {
    queueName: `${stack.stage}-${tenant}-scheduled-poller-dlq`,
  });

  new Alarm(stack, `${tenant}ScheduledPollerDLQAlarm`, {
    alarmName: `${stack.stage}-${tenant}-scheduled-poller-dlq`,
    actionsEnabled: true,
    alarmDescription: `Error polling for ${tenant} scheduled`,
    threshold: 1,
    treatMissingData: TreatMissingData.NOT_BREACHING,
    metric: pollerDlq.metricApproximateNumberOfMessagesVisible(),
    evaluationPeriods: 1,
    comparisonOperator: ComparisonOperator.GREATER_THAN_OR_EQUAL_TO_THRESHOLD,
    datapointsToAlarm: 1,
  });

  const notifierDlq = new Queue(
    stack,
    `${tenant}ScheduledNotifierFunctionDlq`,
    {
      queueName: `${stack.stage}-${tenant}-scheduled-notifier-dlq`,
    }
  );

  new Alarm(stack, `${tenant}ScheduledNotifierDLQAlarm`, {
    alarmName: `${stack.stage}-${tenant}-scheduled-notifier-dlq`,
    actionsEnabled: true,
    alarmDescription: `Error notifying for ${tenant} scheduled`,
    threshold: 1,
    treatMissingData: TreatMissingData.NOT_BREACHING,
    metric: notifierDlq.metricApproximateNumberOfMessagesVisible(),
    evaluationPeriods: 1,
    comparisonOperator: ComparisonOperator.GREATER_THAN_OR_EQUAL_TO_THRESHOLD,
    datapointsToAlarm: 1,
  });

  const pollerFunction = new Function(stack, `${tenant}ScheduledPoller`, {
    functionName: `${stack.stage}-${tenant}-ScheduledPoller`,
    handler: `${handlersDir}/notifications/orchestrators/poller.handler`,
    ...vpcSettings,
    bind: [hasuraSecret, eventBus],
    timeout: '10 minutes',
    environment: {
      HASURA_ENDPOINT: getEnv('HASURA_ENDPOINT'),
      HASURA_TENANT_ENDPOINT: getEnv('HASURA_TENANT_ENDPOINT'),
      POWERTOOLS_DEV: isLocal(stack.stage) ? '1' : '0',
    },
    deadLetterQueue: pollerDlq,
  });
  const settings = getEnvSettings(stack.stage);
  if (settings.addTestingEventBridgeRules) {
    eventBus.addRules(stack, {
      [`on${tenant}-schedule-test`]: {
        pattern: {
          detailType: ['Testing'],
        },
        targets: {
          func: pollerFunction,
        },
      },
    });
  }
  const enabled = !isLocal(stack.stage) || localScheduledNotificationsEnabled;

  new Cron(stack, `${tenant}-Schedule`, {
    enabled,
    schedule: cronSchedule ?? 'cron(1 * ? * * *)', // run at 1 min past the hour to account for event being sent early (round down in handlers)
    job: {
      function: pollerFunction,
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
            detail: { tenant },
          }),
        },
      },
    },
  });
};
