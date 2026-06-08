import type { GroupByDatePrecision } from '@risksmart-app/shared/reporting/api/schema';

import { getFilterPropertyForCategory } from './categoryClickHandler';

describe('categoryClickHandler', () => {
  describe('getFilterPropertyForCategory', () => {
    it('returns single tokenGroup for non date value', () => {
      const result = getFilterPropertyForCategory({
        value: 'Group1',
        x1FieldDatePrecision: null,
        x1Field: { fieldId: 'title', dataSourceIndex: 0 },
        x1FieldType: 'text',
      });
      expect(result).toEqual({
        operation: 'and',
        tokenGroups: [
          { propertyKey: '0|title', operator: '=', value: 'Group1' },
        ],
        tokens: [],
      });
    });

    it('returns a single tokenGroup for a date when the value is null', () => {
      const result = getFilterPropertyForCategory({
        value: null,
        x1FieldDatePrecision: null,
        x1Field: { fieldId: 'title', dataSourceIndex: 0 },
        x1FieldType: 'date',
      });
      expect(result).toEqual({
        operation: 'and',
        tokenGroups: [{ propertyKey: '0|title', operator: '=', value: null }],
        tokens: [],
      });
    });

    it.each<{
      x1FieldDatePrecision: GroupByDatePrecision;
      expectedStartDate: string;
      expectedEndDate: string;
    }>([
      {
        x1FieldDatePrecision: 'day',
        expectedStartDate: '2021-02-03T00:00:00',
        expectedEndDate: '2021-02-04T00:00:00',
      },
      {
        x1FieldDatePrecision: 'month',
        expectedStartDate: '2021-02-01T00:00:00',
        expectedEndDate: '2021-03-01T00:00:00',
      },
      {
        x1FieldDatePrecision: 'year',
        expectedStartDate: '2021-01-01T00:00:00',
        expectedEndDate: '2022-01-01T00:00:00',
      },
    ])(
      'returns 2 tokenGroups based on precision ($x1FieldDatePrecision) for date value',
      ({ x1FieldDatePrecision, expectedStartDate, expectedEndDate }) => {
        const result = getFilterPropertyForCategory({
          value: '2021-02-03T00:33',
          x1FieldDatePrecision,
          x1Field: { fieldId: 'title', dataSourceIndex: 0 },
          x1FieldType: 'date',
        });

        expect(result).toEqual({
          operation: 'and',
          tokenGroups: [
            {
              propertyKey: '0|title',
              operator: '>=',
              value: expectedStartDate,
            },
            {
              propertyKey: '0|title',
              operator: '<',
              value: expectedEndDate,
            },
          ],
          tokens: [],
        });
      }
    );
  });
});
