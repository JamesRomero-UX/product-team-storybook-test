import {
  TestFrequency,
  UnitOfTime,
} from '@risksmart-app/domain/src/types/consts';
import type { Dayjs } from 'dayjs';
import dayjs from 'dayjs';
import quarterOfYear from 'dayjs/plugin/quarterOfYear';
import utc from 'dayjs/plugin/utc';

dayjs.extend(quarterOfYear);
dayjs.extend(utc);

/**
 * Aligns two dates based on the specified options.
 * @param date1 The first date to align.
 * @param date2 Properties of this date will be set onto date1.
 * @param options The alignment options.
 * @returns The aligned date.
 */
const alignDates = (
  date1: Dayjs,
  date2: Dayjs,
  options: {
    date?: boolean;
    time?: boolean;
    month?: boolean;
    dateOfWeek?: boolean;
  }
): Dayjs => {
  let newDate = date1.clone();
  if (options.time) {
    newDate = newDate
      .hour(date2.hour())
      .minute(date2.minute())
      .second(date2.second())
      .millisecond(date2.millisecond());
  }
  if (options.dateOfWeek) {
    newDate = newDate.day(date2.day());
  }
  if (options.date) {
    newDate = newDate.date(date2.date());
  }
  if (options.month) {
    newDate = newDate.month(date2.month());
  }

  return newDate;
};

export const getDueDate = ({
  startDate,
  frequency,
  latestDate,
}: {
  startDate?: string | null;
  frequency?: TestFrequency | null;
  latestDate?: string | null;
}): string | null => {
  if (!frequency) {
    return null;
  }

  if (!startDate || frequency === TestFrequency.Adhoc) {
    return null;
  }

  if (!latestDate || dayjs(startDate).isAfter(latestDate)) {
    return startDate;
  }
  const startDateDayjs = dayjs.utc(startDate);
  const latestDateDayjs = dayjs.utc(latestDate);

  let nextDate: Dayjs;
  switch (frequency) {
    case TestFrequency.Daily:
      nextDate = alignDates(latestDateDayjs, startDateDayjs, { time: true });
      break;
    case TestFrequency.Weekly:
      nextDate = alignDates(latestDateDayjs, startDateDayjs, {
        time: true,
        dateOfWeek: true,
      });
      break;
    case TestFrequency.Fortnightly:
      {
        nextDate = alignDates(latestDateDayjs, startDateDayjs, {
          time: true,
        });
        const remainder = startDateDayjs.diff(nextDate, 'days') % 14;
        nextDate = nextDate.add(remainder, 'days');
      }
      break;
    case TestFrequency.FourWeekly:
      {
        nextDate = alignDates(latestDateDayjs, startDateDayjs, {
          time: true,
        });
        const remainder = startDateDayjs.diff(nextDate, 'days') % 28;
        nextDate = nextDate.add(remainder, 'days');
      }
      break;
    case TestFrequency.Monthly:
      nextDate = alignDates(latestDateDayjs, startDateDayjs, {
        time: true,
        date: true,
      });

      break;
    case TestFrequency.Quarterly:
      {
        nextDate = alignDates(latestDateDayjs, startDateDayjs, {
          time: true,
          date: true,
        });
        const remainder = startDateDayjs.diff(nextDate, 'month') % 3;
        nextDate = nextDate.add(remainder, 'month');
      }
      break;
    case TestFrequency.Biannually:
      {
        nextDate = alignDates(latestDateDayjs, startDateDayjs, {
          time: true,
          date: true,
        });
        const remainder = startDateDayjs.diff(nextDate, 'month') % 6;
        nextDate = nextDate.add(remainder, 'month');
      }
      break;
    case TestFrequency.Annually:
      nextDate = alignDates(latestDateDayjs, startDateDayjs, {
        time: true,
        date: true,
        month: true,
      });
      break;

    default:
      return null;
  }

  // The process of matching day/minute etc above may have been enough to move into the next period, so ensure that's not the case before adding the next interval
  if (nextDate.isAfter(latestDate)) {
    return nextDate.utc().toISOString();
  }

  return addIntervalToDate(nextDate, frequency)?.utc().toISOString() ?? null;
};

const unitOfTimeToQUnitType: {
  [unitOfTime in UnitOfTime]: dayjs.ManipulateType;
} = {
  [UnitOfTime.Day]: 'day',
  [UnitOfTime.Week]: 'week',
};

export const getOverdueDate = ({
  nextTestDate,
  timeToCompleteUnit,
  timeToCompleteValue,
}: {
  nextTestDate: string | null | undefined;
  timeToCompleteUnit: UnitOfTime | null | undefined;
  timeToCompleteValue: number | null | undefined;
}): string | null => {
  if (!nextTestDate || !timeToCompleteUnit || !timeToCompleteValue) {
    return null;
  }
  const d = dayjs(nextTestDate);
  if (d.isValid() === false) {
    return null;
  }

  const unit = unitOfTimeToQUnitType[timeToCompleteUnit];
  if (!unit) {
    throw new Error(`Missing unit for ${timeToCompleteUnit}`);
  }

  return d.add(timeToCompleteValue, unit).toISOString();
};

export const addIntervalToDate = (
  d: Dayjs | null,
  frequency: TestFrequency | null
): Dayjs | null => {
  if (!frequency || !d) {
    return null;
  }

  if (d.isValid() === false) {
    return null;
  }

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
      nextDate = d.add(6, 'month');
      break;
    case 'annually':
      nextDate = d.add(1, 'year');
      break;
    default:
      break;
  }

  return nextDate || null;
};
