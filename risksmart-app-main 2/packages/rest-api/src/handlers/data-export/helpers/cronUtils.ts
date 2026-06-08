import { next, parse } from 'aws-cron-parser';
import type { DataExportScheduleFrequencyEnum } from 'generated/graphql';
import { getLogger } from 'src/logger';
const logger = getLogger();

const EXPRESSIONS: Record<string, string> = {
  daily: '0 0 * * ? *',
  weekly: '0 0 ? * MON *',
  monthly: '0 0 1 * ? *',
};

export const getCronExpression = (
  frequency: DataExportScheduleFrequencyEnum
): string => {
  const expression = EXPRESSIONS[frequency.toLowerCase()];
  if (!expression) {
    throw new Error(`Invalid cron expression for frequency: ${frequency}`);
  }

  return expression;
};

export const getNextExecutionTimestamp = (
  cronExpression: string,
  fromDate: Date = new Date()
): Date | null => {
  try {
    const cronParser = parse(cronExpression);

    return next(cronParser, fromDate);
  } catch (err) {
    logger.error('Error calculating next execution timestamp', err as Error);

    return null;
  }
};
