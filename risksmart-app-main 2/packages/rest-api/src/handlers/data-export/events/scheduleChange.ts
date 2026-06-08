import type { RemoveTargetsRequest } from '@aws-sdk/client-eventbridge';
import {
  EventBridgeClient,
  ListTargetsByRuleCommand,
  PutRuleCommand,
  PutTargetsCommand,
  RemoveTargetsCommand,
} from '@aws-sdk/client-eventbridge';
import dayjs from 'dayjs';
import type { DataExportSchedule } from 'generated/graphql';
import {
  DataExportScheduleExecutionStatusEnum,
  DataExportScheduleStatusEnum,
} from 'generated/graphql';
import { singleEventBridgeHandler } from 'src/eventBridgeHandler';
import { getLogger } from 'src/logger';
import { getBackendRestApiClient } from 'src/repositories/getBackendRestApiClient';
import { getSessionData } from 'src/session';

import type { DataChangeEvent } from '../../events/DataChangeEvent';
import {
  getCronExpression,
  getNextExecutionTimestamp,
} from '../helpers/cronUtils';
import type { ScheduledDataExportInput } from '../types';

const logger = getLogger();

export const handler = singleEventBridgeHandler<
  string,
  DataChangeEvent<DataExportSchedule, 'data_export_schedule'>,
  void
>(async (event) => {
  logger.info('Start creating cron job for data export schedule', {
    scheduleId: event?.detail?.event?.data?.new?.Id,
  });

  const eventBridge = new EventBridgeClient({});
  const sessionData = getSessionData(event.detail.event.session_variables);
  const riskSmartApiClient = getBackendRestApiClient(sessionData);

  const {
    Id: ScheduleId,
    SecretArn,
    OrgKey,
    Frequency,
    StartTimestamp,
    EndTimestamp,
  } = event.detail.event.data.new as DataExportSchedule;

  const ruleName = `${process.env.SST_STAGE}-DataExportScheduleRule-${OrgKey}`;

  const cronExpression = getCronExpression(Frequency);

  const scheduledDataExportHandlerArn =
    process.env.SCHEDULED_DATA_EXPORT_HANDLER_ARN;
  if (!scheduledDataExportHandlerArn) {
    throw new Error(
      'SCHEDULED_DATA_EXPORT_HANDLER_ARN environment variable is not set'
    );
  }

  try {
    // Create or update EventBridge rule
    const { RuleArn } = await eventBridge.send(
      new PutRuleCommand({
        Name: ruleName,
        ScheduleExpression: `cron(${cronExpression})`,
        State: 'ENABLED',
        Description: `Data export cron for schedule ${ScheduleId}`,
      })
    );
    logger.info('Created/updated EventBridge rule', { ruleName });

    // Calculate the next execution time based on the cron expression and StartTimestamp or current date if in the past
    const startDate = dayjs(StartTimestamp);
    const now = dayjs();
    const effectiveStartDate = startDate.isAfter(now) ? startDate : now;
    let nextExecution = getNextExecutionTimestamp(
      cronExpression,
      effectiveStartDate.toDate()
    );

    logger.info('Calculated next execution time', {
      nextExecution: nextExecution?.toISOString(),
      startTimestamp: StartTimestamp,
      cronExpression,
    });

    // if the next execution is after the end timestamp, set the next execution to null
    if (EndTimestamp) {
      const endDate = new Date(EndTimestamp);
      if (nextExecution && nextExecution > endDate) {
        logger.info(
          'Next execution is after end timestamp, skipping rule setup',
          {
            nextExecution: nextExecution.toISOString(),
            endTimestamp: EndTimestamp,
          }
        );
        nextExecution = null;
      }
    }

    // If the rule already exists, it may have old targets that need to be removed.
    // Otherwise, they will be triggered alongside the new target.
    const targetsList = await eventBridge.send(
      new ListTargetsByRuleCommand({
        Rule: ruleName,
      })
    );

    if (targetsList.Targets && targetsList.Targets.length > 0) {
      const input: RemoveTargetsRequest = {
        Rule: ruleName,
        Ids: targetsList.Targets.map((target) => target.Id).filter(
          (id): id is string => Boolean(id)
        ),
      };
      await eventBridge.send(new RemoveTargetsCommand(input));
    }

    // Set the target for the rule (the Lambda function that will execute the export)
    await eventBridge.send(
      new PutTargetsCommand({
        Rule: ruleName,
        Targets: [
          {
            Id: `data-export-executor-${ScheduleId}`, //Used internally by AWS
            Arn: scheduledDataExportHandlerArn,
            Input: JSON.stringify({
              ruleName,
              scheduleId: ScheduleId,
              secretArn: SecretArn,
              startTimestamp: StartTimestamp,
              ...(EndTimestamp && { endTimestamp: EndTimestamp }),
            } satisfies ScheduledDataExportInput),
          },
        ],
      })
    );

    await riskSmartApiClient.deactivateDataExportScheduleByArn({
      CronArn: RuleArn!,
    });
    logger.info(
      'Deactivated previous data export schedule associated with cron rule',
      {
        cronArn: RuleArn,
      }
    );

    await riskSmartApiClient.updateDataExportSchedule({
      Id: ScheduleId,
      CronArn: RuleArn!,
      Status: DataExportScheduleStatusEnum.Active,
      Executions: nextExecution
        ? [
            {
              ExecutionTimestamp: nextExecution.toISOString(),
              Status: DataExportScheduleExecutionStatusEnum.Scheduled,
              ParentId: ScheduleId,
            },
          ]
        : [],
    });
    logger.info('Updated current data export schedule', {
      cronArn: RuleArn,
      scheduleStatus: DataExportScheduleStatusEnum.Active,
    });
  } catch (error) {
    logger.error('Error creating EventBridge rule', error as Error);
    throw error;
  }
});
