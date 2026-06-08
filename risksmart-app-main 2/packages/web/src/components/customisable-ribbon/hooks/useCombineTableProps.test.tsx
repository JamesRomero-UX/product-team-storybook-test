import { renderHook, waitFor } from '@testing-library/react';
import { mockedGetOrganisation } from 'src/testing/mock-data/mockedGetOrganisation';
import { getWrapper } from 'src/testing/wrapper';
import { vi } from 'vitest';

import type { TablePropsWithActions } from '@/utils/table/types';

import { useCombineTableProps } from './useCombineTableProps';

const MOCK_PROPS_1 = {
  actions: {
    setPropertyFiltering: vi.fn(),
  },
  allItems: [{ Title: 'test value', AnotherField: 'test value' }],
  fields: {
    Title: { header: 'test title' },
    AnotherField: { header: 'another header' },
  },
  filteringProperties: [],
  preferenceDetails: {
    preferences: {
      contentDisplay: [
        { visible: true, id: 'Title' },
        { visible: true, id: 'AnotherField' },
      ],
    },
  },
  propertyFilterProps: { filteringOptions: [] },
  propertyFilterQuery: { tokens: [], operation: 'and', tokenGroups: [] },
} as unknown as Pick<
  TablePropsWithActions<never>,
  | 'actions'
  | 'allItems'
  | 'fields'
  | 'filteringProperties'
  | 'preferenceDetails'
  | 'propertyFilterProps'
  | 'propertyFilterQuery'
>;

const MOCK_PROPS_2 = {
  actions: {
    setPropertyFiltering: vi.fn(),
  },
  allItems: [{ Title: 'test' }],
  fields: {
    Title: { header: 'another test title' },
  },
  filteringProperties: [],
  preferenceDetails: {
    preferences: { contentDisplay: [{ visible: true, id: 'Title' }] },
  },
  propertyFilterProps: { filteringOptions: [] },
  propertyFilterQuery: { tokens: [], operation: 'and', tokenGroups: [] },
} as unknown as Pick<
  TablePropsWithActions<never>,
  | 'actions'
  | 'allItems'
  | 'fields'
  | 'filteringProperties'
  | 'preferenceDetails'
  | 'propertyFilterProps'
  | 'propertyFilterQuery'
>;

describe('useCombineTableProps', () => {
  it('should combine both table prop items', async () => {
    const { result } = renderHook(
      () => useCombineTableProps(MOCK_PROPS_1, MOCK_PROPS_2, []),
      { wrapper: getWrapper([mockedGetOrganisation()], 'features', 'graphql') }
    );
    await waitFor(() => {
      expect(result.current).toBeDefined();
    });
    expect(result.current.allItems).toHaveLength(2);
    expect(result.current.allItems).toEqual([
      { Title: 'test value', AnotherField: 'test value' },
      { Title: 'test' },
    ]);
  });

  it('should combine property filtering actions from both tables', async () => {
    const mockPropertyFilterSpy1 = vi.spyOn(
      MOCK_PROPS_1.actions,
      'setPropertyFiltering'
    );

    const mockPropertyFilterSpy2 = vi.spyOn(
      MOCK_PROPS_2.actions,
      'setPropertyFiltering'
    );

    const { result } = renderHook(
      () => useCombineTableProps(MOCK_PROPS_1, MOCK_PROPS_2, []),
      { wrapper: getWrapper([mockedGetOrganisation()], 'features', 'graphql') }
    );
    await waitFor(() => {
      expect(result.current).toBeDefined();
    });
    result.current.actions.setPropertyFiltering({
      tokens: [],
      operation: 'and',
    });

    expect(mockPropertyFilterSpy1).toHaveBeenCalledTimes(1);
    expect(mockPropertyFilterSpy2).toHaveBeenCalledTimes(1);
  });

  it('should export combined items and fields from both tables', async () => {
    const { result } = renderHook(
      () => useCombineTableProps(MOCK_PROPS_1, MOCK_PROPS_2, []),
      { wrapper: getWrapper([mockedGetOrganisation()], 'features', 'graphql') }
    );
    await waitFor(() => {
      expect(result.current).toBeDefined();
    });
    expect(result.current.exportToCsvString()).toEqual(
      '"another test title","another header"\r\n"test value","test value"\r\n"test",'
    );
  });
});
