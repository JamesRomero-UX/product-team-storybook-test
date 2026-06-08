import dayjs from 'dayjs';
import { DataExportScheduleExecutionStatusEnum } from 'generated/graphql';
import { scheduledEventHandler } from 'src/eventBridgeHandler';
import { getLogger } from 'src/logger';
import { getBackendRestApiClient } from 'src/repositories/getBackendRestApiClient';
import { SYSTEM_ADMIN_ROLE, SYSTEM_USER } from 'src/repositories/types';

import {
  getCronExpression,
  getNextExecutionTimestamp,
} from '../helpers/cronUtils';
import { disableDataExportRule } from '../helpers/disableDataExportRule';
import { getSecretFromArn } from '../helpers/getSecretFromArn';
import { processCustomAttributes } from '../helpers/processCustomAttributes';
import { uploadData } from '../helpers/scheduledDataUpload';
import type {
  ScheduledDataExportInput,
  SftpCredentials,
  SharePointCredentials,
} from '../types';

const logger = getLogger();

export const handler = scheduledEventHandler<ScheduledDataExportInput>(
  async (input) => {
    const {
      ruleName,
      scheduleId,
      secretArn,
      startTimestamp,
      endTimestamp,
      manualTrigger,
    } = input;
    logger.appendKeys({ scheduleId, ruleName });
    logger.info('Starting scheduled data export');

    const shouldSkipExecution = dayjs().isBefore(
      dayjs(startTimestamp).startOf('day')
    );

    if (shouldSkipExecution && !manualTrigger) {
      logger.info('Data export scheduled for future date, skipping execution', {
        scheduleId,
        startTimestamp,
      });

      return;
    }

    const credentials = await getSecretFromArn<
      SharePointCredentials | SftpCredentials
    >(secretArn);

    logger.appendKeys({
      orgKey: credentials.orgKey,
      tenant: credentials.tenant,
    });
    const riskSmartApiClient = getBackendRestApiClient({
      tenant: credentials.tenant,
      orgKey: credentials.orgKey,
      userId: SYSTEM_USER,
      userRole: SYSTEM_ADMIN_ROLE,
    });

    let executionTimestamp = dayjs();
    const { data_export_schedule } =
      await riskSmartApiClient.getActiveDataExportById({
        Id: scheduleId,
      });
    if (!data_export_schedule || data_export_schedule.length === 0) {
      logger.error('Data export schedule not found', { scheduleId });
      throw new Error('Data export schedule not found');
    }
    const dataExportSchedule = data_export_schedule[0];
    if (!dataExportSchedule) {
      logger.info('No active data export schedule found', {
        scheduleId,
      });

      return;
    }

    if (!manualTrigger) {
      if (dataExportSchedule.dataExportScheduleExecutions) {
        // Get the next execution to run ordered by ExecutionTimestamp descending
        const nextExecution = dataExportSchedule.dataExportScheduleExecutions
          .filter(
            (execution) =>
              execution.Status ===
              DataExportScheduleExecutionStatusEnum.Scheduled
          )
          .sort((a, b) =>
            dayjs(b.ExecutionTimestamp).diff(dayjs(a.ExecutionTimestamp))
          )[0];

        if (nextExecution) {
          executionTimestamp = dayjs(nextExecution.ExecutionTimestamp);
        }
      }
    }

    const shouldDisableSchedule =
      endTimestamp &&
      dayjs(endTimestamp).isBefore(dayjs().add(1, 'day').startOf('day'));

    if (shouldDisableSchedule) {
      logger.info('Data export schedule expired', {
        scheduleId,
        endTimestamp,
      });

      try {
        await disableDataExportRule(ruleName);

        const scheduledExecutions =
          dataExportSchedule.dataExportScheduleExecutions.filter(
            (execution) =>
              execution.Status ===
              DataExportScheduleExecutionStatusEnum.Scheduled
          );

        if (scheduledExecutions.length > 0) {
          const cancelledExecutions = scheduledExecutions.flatMap((execution) =>
            getExecutionSchedules({
              scheduleId,
              executionTimestamp: new Date(execution.ExecutionTimestamp),
              nextExecutionTimestamp: null,
              credentials,
              executionStatus: DataExportScheduleExecutionStatusEnum.Cancelled,
            })
          );

          await riskSmartApiClient.upsertDataExportScheduleExecutions({
            inputs: cancelledExecutions,
          });

          logger.info('Cancelled scheduled execution', {
            scheduleId,
          });
        }

        await riskSmartApiClient.systemDeactivateDataExportScheduleByArn({
          CronArn: dataExportSchedule.CronArn!,
          ModifiedAtTimestamp: new Date().toISOString(),
        });
        logger.info('Data export schedule deactivated', {
          cronArn: dataExportSchedule.CronArn,
        });

        return;
      } catch (error) {
        logger.error('Disabling data export schedule failed', error as Error);
        throw error;
      }
    }

    let nextExecutionTimestamp = getNextExecutionTimestamp(
      getCronExpression(dataExportSchedule.Frequency),
      executionTimestamp.toDate()
    );

    // If the next execution is beyond the end timestamp, do not schedule another execution
    if (
      endTimestamp &&
      nextExecutionTimestamp &&
      dayjs(nextExecutionTimestamp).isAfter(dayjs(endTimestamp).endOf('day'))
    ) {
      nextExecutionTimestamp = null;
    }
    try {
      const data = await riskSmartApiClient.getNormalisedExportData({
        orgKey: credentials.orgKey,
      });

      const processedData = processCustomAttributes(data);
      await uploadData(processedData, credentials);
      logger.info('Scheduled data export complete');
      logger.info(
        `Recording execution status. executionTimestamp: ${executionTimestamp.toISOString()}, nextExecutionTimestamp: ${nextExecutionTimestamp?.toISOString()}`
      );

      await riskSmartApiClient.upsertDataExportScheduleExecutions({
        inputs: getExecutionSchedules({
          scheduleId,
          executionTimestamp: executionTimestamp.toDate(),
          nextExecutionTimestamp,
          credentials,
          manualTrigger,
          executionStatus: DataExportScheduleExecutionStatusEnum.Complete,
        }),
      });
    } catch (error) {
      logger.error('Scheduled data export failed', error as Error);
      logger.info(
        `Recording failed execution status. executionTimestamp: ${executionTimestamp.toISOString()}, nextExecutionTimestamp: ${nextExecutionTimestamp?.toISOString()}`
      );
      await riskSmartApiClient.upsertDataExportScheduleExecutions({
        inputs: getExecutionSchedules({
          scheduleId,
          executionTimestamp: executionTimestamp.toDate(),
          nextExecutionTimestamp,
          error,
          credentials,
          manualTrigger,
          executionStatus: DataExportScheduleExecutionStatusEnum.Failed,
        }),
      });
      throw error;
    }
  }
);

const getExecutionSchedules = (inputs: {
  scheduleId: string;
  executionTimestamp: Date;
  nextExecutionTimestamp: Date | null;
  error?: unknown;
  credentials: SharePointCredentials | SftpCredentials;
  manualTrigger?: boolean;
  executionStatus: DataExportScheduleExecutionStatusEnum;
}): {
  ParentId: string;
  ExecutionTimestamp: string;
  Status: DataExportScheduleExecutionStatusEnum;
  Errors?: string | undefined;
  OrgKey: string;
}[] => {
  const {
    scheduleId,
    executionTimestamp,
    nextExecutionTimestamp,
    error,
    credentials,
    manualTrigger,
    executionStatus,
  } = inputs;
  // Safely parse error message
  let errorMessage: string | undefined = undefined;
  if (error) {
    errorMessage = 'Unknown error';
    if (error instanceof Error) {
      errorMessage = error.message;
    } else if (typeof error === 'string') {
      errorMessage = error;
    } else {
      try {
        errorMessage = JSON.stringify(error);
      } catch {
        // keep default message
      }
    }
  }
  const executionSchedules: {
    ParentId: string;
    ExecutionTimestamp: string;
    Status: DataExportScheduleExecutionStatusEnum;
    Errors?: string | undefined;
    OrgKey: string;
    ModifiedAtTimestamp: string;
    ModifiedByUser: string;
    CreatedAtTimestamp: string;
    CreatedByUser: string;
  }[] = [
    {
      ParentId: scheduleId,
      ExecutionTimestamp: executionTimestamp.toISOString(),
      Errors: errorMessage,
      Status: executionStatus,
      OrgKey: credentials.orgKey,
      ModifiedAtTimestamp: new Date().toISOString(),
      ModifiedByUser: SYSTEM_USER,
      CreatedAtTimestamp: new Date().toISOString(),
      CreatedByUser: SYSTEM_USER,
    },
  ];
  if (nextExecutionTimestamp && !manualTrigger) {
    executionSchedules.push({
      ExecutionTimestamp: nextExecutionTimestamp.toISOString(),
      Status: DataExportScheduleExecutionStatusEnum.Scheduled,
      ParentId: scheduleId,
      OrgKey: credentials.orgKey,
      ModifiedAtTimestamp: new Date().toISOString(),
      ModifiedByUser: SYSTEM_USER,
      CreatedAtTimestamp: new Date().toISOString(),
      CreatedByUser: SYSTEM_USER,
    });
  }

  return executionSchedules;
};
