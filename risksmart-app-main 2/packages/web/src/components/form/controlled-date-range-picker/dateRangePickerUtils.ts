import type { DateRangePickerProps } from '@risk-smart/themed-cloudscape-components/date-range-picker';
import dayjs from 'dayjs';
import type { TFunction } from 'i18next';

import { isValidDateString } from '@/utils/dateUtils';

export const createDefaultValidator =
  (t: TFunction<'common'>) =>
  (
    range: DateRangePickerProps.Value | null
  ): DateRangePickerProps.ValidationResult => {
    if (range?.type === 'absolute') {
      if (
        !isValidDateString(range.startDate) ||
        !isValidDateString(range.endDate)
      ) {
        return {
          valid: false,
          errorMessage: t('dateRangeInput.missingStartOrEndDateError'),
        };
      }

      if (dayjs(range.startDate).isAfter(dayjs(range.endDate))) {
        return {
          valid: false,
          errorMessage: t('dateRangeInput.startDateAfterEndDateError'),
        };
      }
    }

    if (range?.type === 'relative') {
      if (!range.amount) {
        return {
          valid: false,
          errorMessage: t('dateRangeInput.relativeAmountEmptyError'),
        };
      }

      const timeLimit = 10;
      const isTooManyYears =
        range.unit === 'year' &&
        (range.amount < -timeLimit || range.amount > timeLimit);
      const isTooManyMonths =
        range.unit === 'month' &&
        (range.amount < -12 * timeLimit || range.amount > 12 * timeLimit);
      const isTooManyWeeks =
        range.unit === 'week' &&
        (range.amount < -52 * timeLimit || range.amount > 52 * timeLimit);
      const isTooManyDays =
        range.unit === 'day' &&
        (range.amount < -365 * timeLimit || range.amount > 365 * timeLimit);
      if (
        isTooManyYears ||
        isTooManyMonths ||
        isTooManyWeeks ||
        isTooManyDays
      ) {
        return {
          valid: false,
          errorMessage: t('dateRangeInput.relativeAmountTooLargeError'),
        };
      }
    }

    return { valid: true };
  };
