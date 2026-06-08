import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc';

import type { DashboardFilter } from '../useDashboardStore';
import { dashboardDateRangeClickthroughFilter } from './dataSourceHelpers';
import { dashboardFilterToQuery, getString } from './util';

dayjs.extend(utc);

describe('getString', () => {
  it('Gets the string value for a function', () => {
    expect(getString(() => 'test')).toBe('test');
  });

  it('Gets the string value for a string', () => {
    expect(getString('test')).toBe('test');
  });
});

describe('dashboardFilterToQuery', () => {
  it('Converts a dashboard filter to a table query correctly for tags/departments', () => {
    const filter: DashboardFilter = {
      departments: ['department1'],
      tags: ['tag1', 'tag2'],
      dateRange: null,
    };

    const propertyFilter = dashboardFilterToQuery(filter, 'day', undefined, {
      departments: true,
      tags: true,
    });

    expect(propertyFilter).toEqual({
      operation: 'and',
      tokens: [],
      tokenGroups: [
        {
          operation: 'or',
          tokens: [
            { operator: '=', propertyKey: 'tags', value: 'tag1' },
            {
              operator: '=',
              propertyKey: 'tags',
              value: 'tag2',
            },
          ],
        },

        {
          operation: 'or',
          tokens: [
            { operator: '=', propertyKey: 'departments', value: 'department1' },
          ],
        },
      ],
    });
  });

  it('Converts a dashboard filter correctly for a daterange filter', () => {
    const filter: DashboardFilter = {
      departments: [],
      tags: [],
      dateRange: {
        type: 'absolute',
        startDate: dayjs.utc('2021-09-01').toISOString(),
        endDate: dayjs.utc('2022-09-01').toISOString(),
      },
    };

    const filterFunction =
      dashboardDateRangeClickthroughFilter('CreatedAtTimestamp');

    const propertyFilter = dashboardFilterToQuery(
      filter,
      'day',
      filterFunction,
      {
        departments: false,
        tags: false,
      }
    );

    expect(propertyFilter).toEqual({
      operation: 'and',
      tokens: [],
      tokenGroups: [
        {
          operator: '=',
          propertyKey: 'CreatedAtTimestamp',
          value: {
            endDate: '2022-09-01T00:00:00.000Z',
            startDate: '2021-09-01T00:00:00.000Z',
            type: 'absolute',
          },
        },
      ],
    });
  });
});
