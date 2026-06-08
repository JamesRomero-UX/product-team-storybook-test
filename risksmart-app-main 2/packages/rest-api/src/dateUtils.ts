import dayjs from 'dayjs';
import quarterOfYear from 'dayjs/plugin/quarterOfYear';
import type { TestFrequencyEnum } from 'generated/graphql';

import { getLogger } from './logger';
const logger = getLogger();
export const getNextDate = (
  date: Date | string | null,
  frequency: TestFrequencyEnum | null
): Date | null => {
  if (!frequency || !date) {
    return null;
  }
  const d = dayjs(date);

  if (d.isValid() === false) {
    return null;
  }

  dayjs.extend(quarterOfYear);

  let nextDate = null;
  switch (frequency) {
    case 'daily':
      nextDate = d.add(1, 'day');
      break;
    case 'weekly':
      nextDate = d.add(1, 'week');
      break;
    case 'fortnightly':
      nextDate = d.add(2, 'week');
      break;
    case 'fourweekly':
      nextDate = d.add(4, 'week');
      break;
    case 'monthly':
      nextDate = d.add(1, 'month');
      break;
    case 'quarterly':
      nextDate = d.add(1, 'quarter');
      break;
    case 'biannually':
      nextDate = d.add(182, 'day');
      break;
    case 'annually':
      nextDate = d.add(1, 'year');
      break;
    default:
      logger.error(`Unsupported frequency ${frequency}`);
      break;
  }

  return nextDate?.toDate() || null;
};
