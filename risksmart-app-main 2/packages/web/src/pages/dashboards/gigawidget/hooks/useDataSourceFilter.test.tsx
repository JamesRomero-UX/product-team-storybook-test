import { renderHook } from '@testing-library/react';
import { defaultDashboardFilter } from 'src/context/defaultDashboardFilter';
import type { Mock } from 'vitest';
import { vi } from 'vitest';

import { useIsFeatureFlagEnabled } from '@/hooks/useIsFeatureFlagEnabled';
import { useOrgScopedLocalStorage } from '@/hooks/useOrgScopedLocalStorage';

import getMyItemWidgets from '../../my-items/privateWidgets';
import { setWidgets as setMyItemWidgets } from '../../my-items/widgets';
import { privateWidgets } from '../../widgetPrivate';
import { setWidgets } from '../../widgets';
import { filterWrapper, mockDataSource } from '../mocks';
import { useDataSourceFilter } from './useDataSourceFilter';

vi.mock('@/hooks/useOrgScopedLocalStorage');
vi.mock('@/hooks/useIsFeatureFlagEnabled');
const useIsFeatureFlagEnabledMock = vi.mocked(useIsFeatureFlagEnabled);

setWidgets(privateWidgets);
setMyItemWidgets(getMyItemWidgets());

describe('useDataSourceFilter', () => {
  beforeAll(() => {
    useIsFeatureFlagEnabledMock.mockReturnValue(true);
  });
  it.each([
    {
      description: 'undefined',
      filters: { departments: [], tags: [], dateRange: null },
      expected: {},
    },
    {
      description: 'a department',
      filters: {
        departments: ['department 1'],
        tags: [],
        dateRange: null,
      },
      expected: {
        where: {
          departments: { DepartmentTypeId: { _in: ['department 1'] } },
        },
      },
    },
    {
      description: 'a tag',
      filters: {
        departments: [],
        tags: ['tag 1'],
        dateRange: null,
      },
      expected: {
        where: {
          tags: { TagTypeId: { _in: ['tag 1'] } },
        },
      },
    },
    {
      description: 'a department and a tag',
      filters: {
        departments: ['department 1'],
        tags: ['tag 1'],
        dateRange: null,
      },
      expected: {
        where: {
          tags: { TagTypeId: { _in: ['tag 1'] } },
          departments: { DepartmentTypeId: { _in: ['department 1'] } },
        },
      },
    },
  ])(
    `returns the correct filters when the filter is set to $description`,
    ({ filters, expected }) => {
      (useOrgScopedLocalStorage as Mock).mockReturnValue([
        { filters: defaultDashboardFilter, widgets: [] },
        vi.fn(),
      ]);
      const { result } = renderHook(
        () => useDataSourceFilter(mockDataSource, undefined),
        {
          wrapper: filterWrapper(filters),
        }
      );

      expect(result.current).toEqual(expected);
    }
  );
});
