import type { PropertyFilterQuery } from '@cloudscape-design/collection-hooks';
import { renderHook, waitFor } from '@testing-library/react';
import type { FC, ReactNode } from 'react';
import { act } from 'react';
import { createMemoryRouter, RouterProvider } from 'react-router';
import { getWrapper } from 'src/testing/wrapper';

import type { TableFieldsWithCustomAttributes } from './useAddCustomAttributeFieldData';
import {
  convertObjectValues,
  useFiltersFromUrlHash,
} from './useFiltersFromUrlHash';

describe('useFiltersFromUrlHash', () => {
  const fields: TableFieldsWithCustomAttributes<{ col1: string }> = {
    col1: { cell: () => 'test', custom: false, header: 'test' },
  };

  // Helper function to create a custom wrapper with MemoryRouter with specific hash
  const getWrapperWithHash = (hash: string = '') => {
    const TestComponent: FC<{ children: ReactNode }> = ({ children }) => {
      const router = createMemoryRouter(
        [
          {
            path: '/*',
            element: <div>{children}</div>,
          },
        ],
        {
          initialEntries: [`/${hash}`],
        }
      );

      return <RouterProvider router={router} />;
    };

    return TestComponent;
  };

  it('updates hash when sorting set', async () => {
    const result = renderHook(() => useFiltersFromUrlHash({ fields }), {
      wrapper: getWrapper([], 'router'),
    });
    act(() => {
      result.result.current.setSortingState({
        sortingColumn: {
          sortingField: 'col1',
        },
      });
    });

    await waitFor(() =>
      expect(result.result.current.hash).toEqual('#sb=col1&so=ASCENDING')
    );
  });

  it('updates hash when filtering set', async () => {
    const result = renderHook(() => useFiltersFromUrlHash({ fields }), {
      wrapper: getWrapper([], 'router'),
    });
    act(() => {
      result.result.current.setPropertyFilter({
        operation: 'and',
        tokens: [{ value: 'val1', propertyKey: 'prop1', operator: 'and' }],
      });
    });

    await waitFor(() =>
      expect(result.result.current.hash).toEqual(
        '#filters=%7B%22operation%22%3A%22and%22%2C%22tokens%22%3A%5B%5D%2C%22tokenGroups%22%3A%5B%7B%22value%22%3A%22val1%22%2C%22propertyKey%22%3A%22prop1%22%2C%22operator%22%3A%22and%22%7D%5D%7D'
      )
    );
  });

  it('updates hash when both filtering and sorting set', async () => {
    const result = renderHook(() => useFiltersFromUrlHash({ fields }), {
      wrapper: getWrapper([], 'router'),
    });

    act(() => {
      result.result.current.setSortingState({
        sortingColumn: {
          sortingField: 'col1',
        },
      });
    });

    act(() => {
      result.result.current.setPropertyFilter({
        operation: 'and',
        tokens: [],
        tokenGroups: [{ value: 'val1', propertyKey: 'prop1', operator: 'and' }],
      });
    });

    await waitFor(() =>
      expect(result.result.current.hash).toEqual(
        '#filters=%7B%22operation%22%3A%22and%22%2C%22tokens%22%3A%5B%5D%2C%22tokenGroups%22%3A%5B%7B%22value%22%3A%22val1%22%2C%22propertyKey%22%3A%22prop1%22%2C%22operator%22%3A%22and%22%7D%5D%7D&sb=col1&so=ASCENDING'
      )
    );
  });

  describe('cross-table contamination prevention', () => {
    it('ignores sorting from URL hash when field does not exist in current table', () => {
      // Use MemoryRouter with initial hash containing invalid field
      const result = renderHook(() => useFiltersFromUrlHash({ fields }), {
        wrapper: getWrapperWithHash('#sb=nonExistentField&so=ASCENDING'),
      });

      // Should ignore the invalid sorting field and return undefined
      expect(result.result.current.sortingState).toBeUndefined();
    });

    it('applies sorting from URL hash when field exists in current table', () => {
      // Use MemoryRouter with initial hash containing valid field
      const result = renderHook(() => useFiltersFromUrlHash({ fields }), {
        wrapper: getWrapperWithHash('#sb=col1&so=DESCENDING'),
      });

      // Should apply the valid sorting field
      expect(result.result.current.sortingState).toEqual({
        isDescending: true,
        sortingColumn: {
          sortingField: 'col1',
          sortingComparator: undefined,
        },
      });
    });

    it('filters out invalid property filter tokens when fields do not exist in current table', () => {
      // Create filter query with both valid and invalid fields
      const filterQuery = {
        operation: 'and',
        tokens: [
          { value: 'val1', propertyKey: 'validField', operator: '=' },
          { value: 'val2', propertyKey: 'invalidField', operator: '=' },
        ],
      };
      const encodedFilter = encodeURIComponent(JSON.stringify(filterQuery));

      const fieldsWithValidField: TableFieldsWithCustomAttributes<{
        col1: string;
        validField: string;
      }> = {
        col1: { cell: () => 'test', custom: false, header: 'test' },
        validField: { cell: () => 'test', custom: false, header: 'valid' },
      };

      const result = renderHook(
        () => useFiltersFromUrlHash({ fields: fieldsWithValidField }),
        {
          wrapper: getWrapperWithHash(`#filters=${encodedFilter}`),
        }
      );

      // Should filter out the invalid token and keep only the valid one
      expect(result.result.current.propertyFilter).toEqual({
        operation: 'and',
        tokens: [{ value: 'val1', propertyKey: 'validField', operator: '=' }],
        tokenGroups: undefined,
      });
    });

    it('filters out invalid property filter token groups when fields do not exist in current table', () => {
      // Create filter query with token groups
      const filterQuery = {
        operation: 'and',
        tokens: [],
        tokenGroups: [
          { value: 'val1', propertyKey: 'validField', operator: '=' },
          { value: 'val2', propertyKey: 'invalidField', operator: '=' },
        ],
      };
      const encodedFilter = encodeURIComponent(JSON.stringify(filterQuery));

      const fieldsWithValidField: TableFieldsWithCustomAttributes<{
        col1: string;
        validField: string;
      }> = {
        col1: { cell: () => 'test', custom: false, header: 'test' },
        validField: { cell: () => 'test', custom: false, header: 'valid' },
      };

      const result = renderHook(
        () => useFiltersFromUrlHash({ fields: fieldsWithValidField }),
        {
          wrapper: getWrapperWithHash(`#filters=${encodedFilter}`),
        }
      );

      // Should filter out the invalid token group and keep only the valid one
      expect(result.result.current.propertyFilter).toEqual({
        operation: 'and',
        tokens: [],
        tokenGroups: [
          { value: 'val1', propertyKey: 'validField', operator: '=' },
        ],
      });
    });

    it('returns empty property filter when all tokens are invalid', () => {
      // Create filter query with only invalid fields
      const filterQuery = {
        operation: 'and',
        tokens: [
          { value: 'val1', propertyKey: 'invalidField1', operator: '=' },
          { value: 'val2', propertyKey: 'invalidField2', operator: '=' },
        ],
      };
      const encodedFilter = encodeURIComponent(JSON.stringify(filterQuery));

      const result = renderHook(() => useFiltersFromUrlHash({ fields }), {
        wrapper: getWrapperWithHash(`#filters=${encodedFilter}`),
      });

      // Should return an empty filter when all tokens are invalid (for clearing)
      expect(result.result.current.propertyFilter).toEqual({
        operation: 'and',
        tokens: [],
        tokenGroups: undefined,
      });
    });

    it('applies default sorting when URL hash has invalid field but default is provided', () => {
      const defaultSortingState = {
        sortingColumn: 'col1' as const,
        sortingDirection: 'desc' as const,
      };

      const result = renderHook(
        () => useFiltersFromUrlHash({ fields, defaultSortingState }),
        {
          wrapper: getWrapperWithHash('#sb=nonExistentField&so=ASCENDING'),
        }
      );

      // Should apply the default sorting when URL hash is invalid
      expect(result.result.current.sortingState).toEqual({
        isDescending: true,
        sortingColumn: {
          sortingField: 'col1',
          sortingComparator: undefined,
        },
      });
    });

    it('allows all filter tokens through when fields is empty (CDS dynamic columns)', () => {
      const emptyFields: TableFieldsWithCustomAttributes<
        Record<string, never>
      > = {};

      const filterQuery = {
        operation: 'and',
        tokens: [
          { value: 'High', propertyKey: '0_riskRating', operator: '=' },
          { value: 'Open', propertyKey: '0_status', operator: '=' },
        ],
      };
      const encodedFilter = encodeURIComponent(JSON.stringify(filterQuery));

      const result = renderHook(
        () => useFiltersFromUrlHash({ fields: emptyFields }),
        {
          wrapper: getWrapperWithHash(`#filters=${encodedFilter}`),
        }
      );

      // Should retain all tokens when fields is empty (no validation)
      expect(result.result.current.propertyFilter).toEqual({
        operation: 'and',
        tokens: [
          { value: 'High', propertyKey: '0_riskRating', operator: '=' },
          { value: 'Open', propertyKey: '0_status', operator: '=' },
        ],
      });
    });

    it('allows all filter token groups through when fields is empty (CDS dynamic columns)', () => {
      const emptyFields: TableFieldsWithCustomAttributes<
        Record<string, never>
      > = {};

      const filterQuery = {
        operation: 'and',
        tokens: [],
        tokenGroups: [
          { value: 'High', propertyKey: '0_riskRating', operator: '=' },
          {
            tokens: [
              {
                value: '2026-01-01',
                propertyKey: '0_reviewDate',
                operator: '>=',
              },
              {
                value: '2026-02-01',
                propertyKey: '0_reviewDate',
                operator: '<',
              },
            ],
          },
        ],
      };
      const encodedFilter = encodeURIComponent(JSON.stringify(filterQuery));

      const result = renderHook(
        () => useFiltersFromUrlHash({ fields: emptyFields }),
        {
          wrapper: getWrapperWithHash(`#filters=${encodedFilter}`),
        }
      );

      // Should retain all token groups when fields is empty (no validation)
      expect(result.result.current.propertyFilter).toEqual({
        operation: 'and',
        tokens: [],
        tokenGroups: [
          { value: 'High', propertyKey: '0_riskRating', operator: '=' },
          {
            tokens: [
              {
                value: '2026-01-01',
                propertyKey: '0_reviewDate',
                operator: '>=',
              },
              {
                value: '2026-02-01',
                propertyKey: '0_reviewDate',
                operator: '<',
              },
            ],
          },
        ],
      });
    });

    it('allows sorting through when fields is empty (CDS dynamic columns)', () => {
      const emptyFields: TableFieldsWithCustomAttributes<
        Record<string, never>
      > = {};

      const result = renderHook(
        () => useFiltersFromUrlHash({ fields: emptyFields }),
        {
          wrapper: getWrapperWithHash('#sb=0_riskRating&so=DESCENDING'),
        }
      );

      expect(result.result.current.sortingState).toEqual({
        isDescending: true,
        sortingColumn: {
          sortingField: '0_riskRating',
        },
      });
    });

    it('allows empty filter queries for clearing filters functionality', () => {
      // Create an empty filter query (what happens when "Clear filters" is clicked)
      const filterQuery = {
        operation: 'and',
        tokens: [],
        tokenGroups: [],
      };
      const encodedFilter = encodeURIComponent(JSON.stringify(filterQuery));

      const result = renderHook(() => useFiltersFromUrlHash({ fields }), {
        wrapper: getWrapperWithHash(`#filters=${encodedFilter}`),
      });

      // Should return the empty filter (not undefined) to allow clearing
      expect(result.result.current.propertyFilter).toEqual({
        operation: 'and',
        tokens: [],
        tokenGroups: [],
      });
    });
  });

  describe('custom datasource field key validation', () => {
    it('preserves filter tokens when fields use pipe-delimited CDS key format', () => {
      const filterQuery = {
        operation: 'and',
        tokens: [
          { value: 'test-value', propertyKey: '0|Title', operator: '=' },
          { value: 'other-value', propertyKey: '1|Status', operator: '=' },
        ],
      };
      const encodedFilter = encodeURIComponent(JSON.stringify(filterQuery));

      const cdsFields: TableFieldsWithCustomAttributes<{
        '0|Title': string;
        '1|Status': string;
      }> = {
        '0|Title': { cell: () => 'test', custom: false, header: '' },
        '1|Status': { cell: () => 'test', custom: false, header: '' },
      };

      const result = renderHook(
        () => useFiltersFromUrlHash({ fields: cdsFields }),
        {
          wrapper: getWrapperWithHash(`#filters=${encodedFilter}`),
        }
      );

      expect(result.result.current.propertyFilter).toEqual({
        operation: 'and',
        tokens: [
          { value: 'test-value', propertyKey: '0|Title', operator: '=' },
          { value: 'other-value', propertyKey: '1|Status', operator: '=' },
        ],
        tokenGroups: undefined,
      });
    });

    it('preserves filter tokens when fields map is empty (e.g. during loading)', () => {
      const filterQuery = {
        operation: 'and',
        tokens: [
          { value: 'test-value', propertyKey: '0|Title', operator: '=' },
        ],
      };
      const encodedFilter = encodeURIComponent(JSON.stringify(filterQuery));

      const result = renderHook(() => useFiltersFromUrlHash({ fields: {} }), {
        wrapper: getWrapperWithHash(`#filters=${encodedFilter}`),
      });

      // When fields is empty (e.g. CDS detail page where columns are dynamic
      // and still loading), filters are preserved to avoid losing them
      expect(result.result.current.propertyFilter).toEqual({
        operation: 'and',
        tokens: [
          { value: 'test-value', propertyKey: '0|Title', operator: '=' },
        ],
        tokenGroups: undefined,
      });
    });
  });

  describe('convertObjectValues', () => {
    it('does nothing when there are no tokens', () => {
      const query: PropertyFilterQuery = {
        tokens: [],
        operation: 'and',
      };
      const result = convertObjectValues(query);
      expect(result).toEqual(query);
    });

    it('does nothing when values are not json', () => {
      const query: PropertyFilterQuery = {
        tokens: [
          {
            value: 'test',
            propertyKey: 'myKey',
            operator: '=',
          },
        ],
        operation: 'and',
      };
      const result = convertObjectValues(query);
      expect(result).toEqual(query);
    });

    it('converts json string values to objects', () => {
      const query: PropertyFilterQuery = {
        tokens: [
          {
            value: '{ "test": "result" }',
            propertyKey: 'myKey',
            operator: '=',
          },
        ],
        operation: 'and',
      };
      const result = convertObjectValues(query);
      expect(result).toEqual({
        tokens: [
          {
            value: { test: 'result' },
            propertyKey: 'myKey',
            operator: '=',
          },
        ],
        operation: 'and',
      });
    });

    it('converts json string values to objects on token groups', () => {
      const query: PropertyFilterQuery = {
        tokens: [],
        tokenGroups: [
          {
            value: '{ "test": "result" }',
            propertyKey: 'myKey',
            operator: '=',
          },
        ],
        operation: 'and',
      };
      const result = convertObjectValues(query);
      expect(result).toEqual({
        tokens: [],
        tokenGroups: [
          {
            value: { test: 'result' },
            propertyKey: 'myKey',
            operator: '=',
          },
        ],
        operation: 'and',
      });
    });
  });
});
