import type { PropertyFilterQuery } from '@cloudscape-design/collection-hooks';

import {
  queryStringToTableOptions,
  type SortingState,
  tableOptionsToQueryString,
} from './tableUtils';

describe('tableUtils', () => {
  describe('queryStringToTableOptions', () => {
    it('generates sorting', () => {
      const result = queryStringToTableOptions('sb=packageType&so=DESCENDING');
      expect(result.sorting).toEqual<SortingState<unknown>>({
        sortingColumn: {
          sortingField: 'packageType',
        },
        isDescending: true,
      });
    });
    it('gracefully handles invalid json as filter', () => {
      const result = queryStringToTableOptions('filters={{{');
      expect(result.filtering).toBeUndefined();
    });

    it('generates propertyFilterQuery for a single token', () => {
      const result = queryStringToTableOptions(
        'filters=%7B%22operation%22%3A%22and%22%2C%22tokens%22%3A%5B%5D%2C%22tokenGroups%22%3A%5B%7B%22value%22%3A%22Zip%22%2C%22operator%22%3A%22%3D%22%2C%22propertyKey%22%3A%22packageType%22%7D%5D%7D'
      );
      expect(result.filtering).toEqual<PropertyFilterQuery>({
        operation: 'and',
        tokens: [],
        tokenGroups: [
          {
            value: 'Zip',
            operator: '=',
            propertyKey: 'packageType',
          },
        ],
      });
    });

    it('generates propertyFilterQuery for no tokens', () => {
      const result = queryStringToTableOptions('');
      expect(result.filtering).toEqual(undefined);
    });

    it('generates propertyFilterQuery for a multiple tokens', () => {
      const result = queryStringToTableOptions(
        'filters=%7B%22operation%22%3A%22and%22%2C%22tokens%22%3A%5B%5D%2C%22tokenGroups%22%3A%5B%7B%22value%22%3A%22Zip%22%2C%22operator%22%3A%22%3D%22%2C%22propertyKey%22%3A%22packageType%22%7D%2C%7B%22value%22%3A%22Node.js2016.x%22%2C%22operator%22%3A%22%3D%22%2C%22propertyKey%22%3A%22runtime%22%7D%5D%7D'
      );
      expect(result.filtering).toEqual<PropertyFilterQuery>({
        operation: 'and',
        tokens: [],
        tokenGroups: [
          {
            value: 'Zip',
            operator: '=',
            propertyKey: 'packageType',
          },
          {
            value: 'Node.js2016.x',
            operator: '=',
            propertyKey: 'runtime',
          },
        ],
      });
    });
  });

  describe('tableOptionsToQueryString', () => {
    it('generates a query string for sorting', () => {
      const result = tableOptionsToQueryString({
        sorting: {
          sortingColumn: {
            sortingField: 'packageType',
          },
          isDescending: true,
        },
      });
      expect(result).toEqual('sb=packageType&so=DESCENDING');
    });

    it('generates a query string for a single filter', () => {
      const result = tableOptionsToQueryString({
        filtering: {
          operation: 'and',
          tokens: [
            {
              value: 'Zip',
              operator: '=',
              propertyKey: 'packageType',
            },
          ],
        },
      });
      expect(result).toEqual(
        'filters=%7B%22operation%22%3A%22and%22%2C%22tokens%22%3A%5B%5D%2C%22tokenGroups%22%3A%5B%7B%22value%22%3A%22Zip%22%2C%22operator%22%3A%22%3D%22%2C%22propertyKey%22%3A%22packageType%22%7D%5D%7D'
      );
    });

    it('generates a query string for a multiple filters', () => {
      const result = tableOptionsToQueryString({
        filtering: {
          operation: 'and',
          tokens: [
            {
              value: 'Zip',
              operator: '=',
              propertyKey: 'packageType',
            },
            {
              value: 'Node.js2016.x',
              operator: '=',
              propertyKey: 'runtime',
            },
          ],
        },
      });
      expect(result).toEqual(
        'filters=%7B%22operation%22%3A%22and%22%2C%22tokens%22%3A%5B%5D%2C%22tokenGroups%22%3A%5B%7B%22value%22%3A%22Zip%22%2C%22operator%22%3A%22%3D%22%2C%22propertyKey%22%3A%22packageType%22%7D%2C%7B%22value%22%3A%22Node.js2016.x%22%2C%22operator%22%3A%22%3D%22%2C%22propertyKey%22%3A%22runtime%22%7D%5D%7D'
      );
    });
  });
});
