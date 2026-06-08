import type { PropertyFilterQuery } from '@cloudscape-design/collection-hooks';

import type { TypedCustomDatasource } from '../types';
import { combinedFilters } from './combineFilters';

describe('combineFilters', () => {
  it('creates filter groups for the custom data source filters and the property filters', () => {
    const customDatasource: Pick<TypedCustomDatasource, 'Filters'> = {
      Filters: {
        operation: 'and',
        filters: [
          {
            value: 'a',
            operator: '=',
            field: { fieldId: 'tier', dataSourceIndex: 0 },
          },
        ],
      },
    };
    const propertyFilter: PropertyFilterQuery = {
      tokenGroups: [
        {
          value: 'a',
          operator: '=',
          propertyKey: '0|title',
        },
      ],
      operation: 'and',
      tokens: [],
    };
    const result = combinedFilters(customDatasource, propertyFilter);
    // could potentially simplify the response further when all operations are "and" or only a single filter...
    expect(result).toEqual({
      operation: 'and',
      filters: [
        {
          operation: 'and',
          filters: [
            {
              value: 'a',
              operator: '=',
              field: { fieldId: 'tier', dataSourceIndex: 0 },
            },
          ],
        },
        {
          operation: 'and',
          filters: [
            {
              value: 'a',
              operator: '=',
              field: { dataSourceIndex: 0, fieldId: 'title' },
            },
          ],
        },
      ],
    });
  });

  it('ignores custom datasource filters if empty', () => {
    const customDatasource: Pick<TypedCustomDatasource, 'Filters'> = {
      Filters: {
        operation: 'or',
        filters: [],
      },
    };
    const propertyFilter: PropertyFilterQuery = {
      tokenGroups: [
        {
          value: 'a',
          operator: '=',
          propertyKey: '0|title',
        },
      ],
      operation: 'and',
      tokens: [],
    };
    const result = combinedFilters(customDatasource, propertyFilter);
    expect(result).toEqual({
      operation: 'and',
      filters: [
        {
          value: 'a',
          operator: '=',
          field: { dataSourceIndex: 0, fieldId: 'title' },
        },
      ],
    });
  });
  it('ignores property filters if empty', () => {
    const customDatasource: Pick<TypedCustomDatasource, 'Filters'> = {
      Filters: {
        operation: 'and',
        filters: [
          {
            value: 'a',
            operator: '=',
            field: { fieldId: 'tier', dataSourceIndex: 0 },
          },
        ],
      },
    };
    const propertyFilter: PropertyFilterQuery = {
      tokenGroups: [],
      operation: 'and',
      tokens: [],
    };
    const result = combinedFilters(customDatasource, propertyFilter);

    expect(result).toEqual({
      operation: 'and',
      filters: [
        {
          value: 'a',
          operator: '=',
          field: { fieldId: 'tier', dataSourceIndex: 0 },
        },
      ],
    });
  });
});
