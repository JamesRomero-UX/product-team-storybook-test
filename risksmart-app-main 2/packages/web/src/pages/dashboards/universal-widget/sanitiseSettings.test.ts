import type { PropertyFilterToken } from '@cloudscape-design/collection-hooks';
import { Parent_Type_Enum } from '@risksmart-app/web-graphql-client/generated/graphql';

import { sanitiseSettings, sanitiseTokens } from './sanitiseSettings';
import type { GigawidgetSettings } from './util';

describe('sanitizeTokens', () => {
  it('should sanitize tokens with valid date values', () => {
    const tokens: PropertyFilterToken[] = [
      {
        propertyKey: 'createdAt',
        operator: '>=',
        value: '2023-01-01T00:00:00',
      },
      { propertyKey: 'createdAt', operator: '=', value: '2023-01-01T00:00:00' },
    ];

    const sanitizedTokens = sanitiseTokens(tokens);

    expect(sanitizedTokens).toEqual([
      {
        propertyKey: 'createdAt',
        operator: '=',
        value: {
          type: 'absolute',
          startDate: '2023-01-01',
          endDate: '2033-01-01',
        },
      },
      {
        propertyKey: 'createdAt',
        operator: '=',
        value: {
          type: 'absolute',
          startDate: '2023-01-01',
          endDate: '2023-01-01',
        },
      },
    ]);
  });

  it('should return tokens unchanged if date is invalid', () => {
    const tokens: PropertyFilterToken[] = [
      { propertyKey: 'createdAt', operator: '>=', value: 'invalid-date' },
    ];

    const sanitizedTokens = sanitiseTokens(tokens);

    expect(sanitizedTokens).toEqual(tokens);
  });
});

describe('sanitiseSettings', () => {
  it('should sanitize settings with valid tokens', () => {
    const settings: GigawidgetSettings = {
      dataSource: Parent_Type_Enum.Issue,
      title: 'title',
      chartType: 'pie',
      categoryGetter: 'status',
      showFilters: true,
      ignoreDashboardDateFilter: false,
      unit: '',
      filtering: {
        operation: 'and',
        tokens: [
          {
            propertyKey: 'CreatedAtTimestamp' as Extract<keyof object, string>,
            operator: '>=',
            value: '2023-01-01T00:00:00',
          },
        ],
      },
    };

    const sanitizedSettings = sanitiseSettings(settings);

    expect(sanitizedSettings?.filtering?.tokens).toEqual([
      {
        propertyKey: 'CreatedAtTimestamp',
        operator: '=',
        value: {
          type: 'absolute',
          startDate: '2023-01-01',
          endDate: '2033-01-01',
        },
      },
    ]);
  });

  it('should return settings unchanged if there are no tokens', () => {
    const settings: GigawidgetSettings = {
      dataSource: Parent_Type_Enum.Issue,
      title: 'title',
      chartType: 'pie',
      categoryGetter: 'status',
      showFilters: true,
      ignoreDashboardDateFilter: false,
      unit: '',
      filtering: {
        operation: 'and',
        tokens: [],
      },
    };

    const sanitizedSettings = sanitiseSettings(settings);

    expect(sanitizedSettings).toEqual(settings);
  });
});
