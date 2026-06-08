import {
  EventBridgeClient,
  ListTargetsByRuleCommand,
} from '@aws-sdk/client-eventbridge';
import { InvokeCommand, LambdaClient } from '@aws-sdk/client-lambda';
import { getBackendRestApiClient } from 'src/repositories/getBackendRestApiClient';
import type { SessionData } from 'src/session';

import { testScheduleCommandHandler } from './test-schedule-command-handler';

export const buildTestScheduleCommandHandler = (sessionData: SessionData) => {
  const riskSmartApiClient = getBackendRestApiClient(sessionData);
  const eventBridge = new EventBridgeClient({});
  const lambda = new LambdaClient({});

  const getDataExportSchedule = async (id: string) => {
    const result = await riskSmartApiClient.getActiveDataExportById({ Id: id });
    if (!result || result.data_export_schedule.length === 0) {
      return null;
    }

    return { cronArn: result.data_export_schedule[0]?.CronArn };
  };

  const getCronTargets = async (ruleName: string) => {
    const { Targets } = await eventBridge.send(
      new ListTargetsByRuleCommand({ Rule: ruleName })
    );

    return Targets || [];
  };

  const invokeLambda = async (arn: string, payload: string) => {
    await lambda.send(
      new InvokeCommand({
        FunctionName: arn,
        InvocationType: 'Event',
        Payload: payload,
      })
    );
  };

  return testScheduleCommandHandler({
    getDataExportSchedule,
    getCronTargets,
    invokeLambda,
  });
};

export class DataExportScheduleNotFoundError extends Error {
  constructor(scheduleId: string) {
    super(`No active data export schedule found for given Id: ${scheduleId}`);
    this.name = 'DataExportScheduleNotFoundError';
  }
}
