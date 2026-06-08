import type { DateRangePickerProps } from '@risk-smart/themed-cloudscape-components/date-range-picker';
import {
  DATE_TIME_FORMAT,
  DATE_TIME_FORMAT_WITH_TIME,
} from '@risksmart-app/i18n/src/i18n';
import { t } from 'i18next';

import { EMPTY_VALUE } from './collectionUtils';

// TODO: Test these functions properly
export const isValidDate = (date: Date) =>
  date instanceof Date && !isNaN(date.getTime());

// TODO: Test these functions properly
export function isValidDateString(dateString: string) {
  if (!dateString || typeof dateString !== 'string') {
    return false;
  }
  const date = new Date(dateString);
  if (isValidDate(date)) {
    return date;
  }

  return false;
}

// TODO: Test these functions properly
export const getCurrentDayDate = (addDays = 0) => {
  const date = new Date();
  date.setHours(0, 0, 0, 0);
  if (addDays) {
    date.setDate(date.getDate() + addDays);
  }

  return date;
};

// TODO: Test these functions properly
export const isPastDate = (dateString?: null | string) => {
  if (!dateString) {
    return false;
  }
  const date = isValidDateString(dateString);
  if (!date) {
    console.warn('Invalid date provided to isPastDate util', dateString);

    return false;
  }

  return date.getTime() < getCurrentDayDate().getTime();
};

// TODO: Test these functions properly
export const isDateBetween = (
  dateString: null | string | undefined,
  [from, to]: [Date, Date]
) => {
  if (!dateString) {
    return false;
  }
  const date = isValidDateString(dateString);

  return date > from && date < to;
};

export const toLocalDate = (dateString?: null | string): string => {
  if (!dateString || dateString === EMPTY_VALUE) {
    return EMPTY_VALUE;
  }

  const date = isValidDateString(dateString);

  if (!date) {
    console.warn('Invalid date provided to toLocalDate util', dateString);

    return dateString;
  }

  return date.toLocaleString('en-GB', DATE_TIME_FORMAT);
};

export const toLocalDateTime = (dateString?: null | string): string => {
  if (!dateString) {
    return '';
  }

  const date = isValidDateString(dateString);

  if (!date) {
    console.warn('Invalid date provided to toLocalDateTime util', dateString);

    return dateString;
  }

  return date.toLocaleString('en-GB', DATE_TIME_FORMAT_WITH_TIME);
};

export const tablePropertyFilterDateFormat = 'YYYY-MM-DDTHH:mm:ss';

export const getDateRangeFormat = (dateValue: null | string) => {
  const tDateValue = dateValue as unknown as DateRangePickerProps.Value;

  if (!tDateValue?.type) {
    return t('relativeTimes.error.invalidDateRangeFormatter');
  }

  if (tDateValue.type === 'absolute') {
    return `${toLocalDate(tDateValue.startDate)} - ${toLocalDate(
      tDateValue.endDate
    )}`;
  }

  const { amount, unit } = tDateValue;
  const isPast = amount < 0;

  return isPast
    ? t(`relativeTimes.previous.${unit}`, { count: -amount })
    : t(`relativeTimes.next.${unit}`, { count: amount });
};
