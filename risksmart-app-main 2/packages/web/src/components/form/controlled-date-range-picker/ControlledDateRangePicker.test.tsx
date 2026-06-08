import { DateRangePickerProps } from '@risk-smart/themed-cloudscape-components/date-range-picker';
import { vi } from 'vitest';

import { createDefaultValidator } from './dateRangePickerUtils';
import RelativeValue = DateRangePickerProps.RelativeValue;
import type { TFunction } from 'i18next';

const mockedTranslation = vi.fn() as unknown as jest.MockedFunction<
  TFunction<'common'>
>;

describe('ControlledDateRangePicker', () => {
  describe('createDefaultValidator', () => {
    const validator = (range: DateRangePickerProps.Value | null) =>
      createDefaultValidator(mockedTranslation)(range);

    describe('is valid when date range is less than 10 years in the past or future', () => {
      const range: RelativeValue = {
        amount: 0,
        unit: 'day',
        type: 'relative',
      };

      it('for the time unit: days', () => {
        range.unit = 'day';

        range.amount = -3650;
        expect(validator(range).valid).toBe(true);

        range.amount = 3650;
        expect(validator(range).valid).toBe(true);
      });

      it('for the time unit: weeks', () => {
        range.unit = 'week';

        range.amount = -520;
        expect(validator(range).valid).toBe(true);

        range.amount = 520;
        expect(validator(range).valid).toBe(true);
      });

      it('for the time unit: months', () => {
        range.unit = 'month';

        range.amount = -120;
        expect(validator(range).valid).toBe(true);

        range.amount = 120;
        expect(validator(range).valid).toBe(true);
      });

      it('for the time unit: years', () => {
        range.unit = 'year';

        range.amount = -10;
        expect(validator(range).valid).toBe(true);

        range.amount = 10;
        expect(validator(range).valid).toBe(true);
      });
    });

    describe('is not valid when date range is more than 10 years in the past or future', () => {
      const range: RelativeValue = {
        amount: 0,
        unit: 'day',
        type: 'relative',
      };

      it('for the time unit: days', () => {
        range.unit = 'day';

        range.amount = -3651;
        expect(validator(range).valid).toBe(false);

        range.amount = 3651;
        expect(validator(range).valid).toBe(false);
      });

      it('for the time unit: weeks', () => {
        range.unit = 'week';

        range.amount = -521;
        expect(validator(range).valid).toBe(false);

        range.amount = 521;
        expect(validator(range).valid).toBe(false);
      });

      it('for the time unit: months', () => {
        range.unit = 'month';

        range.amount = -121;
        expect(validator(range).valid).toBe(false);

        range.amount = 121;
        expect(validator(range).valid).toBe(false);
      });

      it('for the time unit: years', () => {
        range.unit = 'year';

        range.amount = -11;
        expect(validator(range).valid).toBe(false);

        range.amount = 11;
        expect(validator(range).valid).toBe(false);
      });
    });
  });
});
