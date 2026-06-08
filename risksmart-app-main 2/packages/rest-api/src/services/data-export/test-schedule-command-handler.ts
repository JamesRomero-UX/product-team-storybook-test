import { getLogger } from 'src/logger';
import { z } from 'zod';

import { DataExportScheduleNotFoundError } from '.';

const logger = getLogger();

const _testScheduleCommandSchema = z.object({
  scheduleId: z.string(),
});

export type TestScheduleCommand = Readonly<
  z.infer<typeof _testScheduleCommandSchema>
>;

interface Dependencies {
  getDataExportSchedule: (
    id: string
  ) => Promise<{ cronArn?: string | null } | null>;
  getCronTargets: (
    ruleName: string
  ) => Promise<Array<{ Input?: string; Arn?: string }>>;
  invokeLambda: (arn: string, payload: string) => Promise<void>;
}

export const testScheduleCommandHandler = ({
  getDataExportSchedule,
  getCronTargets,
  invokeLambda,
}: Dependencies) => ({
  execute: async (command: TestScheduleCommand) => {
    const activeDataExport = await getDataExportSchedule(command.scheduleId);

    if (!activeDataExport) {
      throw new DataExportScheduleNotFoundError(
        'No active data export schedule found for given Id'
      );
    }

    const cronArn = activeDataExport.cronArn;
    const cronName = cronArn?.split('/').pop();

    if (!cronName) {
      logger.error('No cron name found for active data export schedule', {
        scheduleId: command.scheduleId,
      });
      throw new Error('Error processing data export schedule test');
    }

    // Retrieve the rule targets from the cron ARN
    const targets = await getCronTargets(cronName);

    const targetInput =
      targets && targets.length > 0 && targets[0]
        ? targets[0].Input
        : undefined;

    if (!targetInput) {
      logger.error('No target input found for cron rule', {
        cronName,
      });
      throw new Error('No target input found for cron rule');
    }

    // Mutate the target input to set manualTrigger to true
    const parsedTargetInput = JSON.parse(targetInput);
    parsedTargetInput.manualTrigger = true;

    // Get the Lambda function ARN from the target
    const lambdaArn = targets?.[0]?.Arn;

    if (!lambdaArn) {
      logger.error('No Lambda ARN found for cron rule', {
        cronName,
      });
      throw new Error(
        'No Lambda function ARN found in EventBridge rule target'
      );
    }

    // Invoke the Lambda function with the mutated input
    await invokeLambda(lambdaArn, JSON.stringify(parsedTargetInput));

    logger.info('Successfully initiated data export schedule test', {
      scheduleId: command.scheduleId,
      lambdaArn,
    });
  },
});
