import { act, renderHook } from '@testing-library/react';
import { when } from 'jest-when';
import { defaultDashboardFilter } from 'src/context/defaultDashboardFilter';
import { processWidgets } from 'src/context/processWidgets';
import type { Mock } from 'vitest';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { useIsFeatureFlagEnabled } from '@/hooks/useIsFeatureFlagEnabled';

import {
  defaultMyItemsDashboardLayout,
  defaultOverallDashboardLayout,
} from './defaultLayout';
import type { StoredWidgetPlacement } from './types';
import { defaultMyItemsFilter, useDashboardStore } from './useDashboardStore';

vi.mock('src/context/processWidgets');
vi.mock('@/hooks/useIsFeatureFlagEnabled');
const useIsFeatureFlagEnabledMock = vi.mocked(useIsFeatureFlagEnabled);

describe('useDashboardStore', () => {
  beforeEach(() => {
    vi.resetAllMocks();
    (processWidgets as Mock).mockImplementation((widgets) => widgets);
    localStorage.clear();
  });

  it('should initialize with empty widgets when empty_default_dashboard feature is on', () => {
    when(useIsFeatureFlagEnabledMock)
      .calledWith('empty_default_dashboard')
      .mockReturnValue(true);
    const { result } = renderHook(() => useDashboardStore());
    expect(result.current.widgets).toEqual([]);
  });

  it('should initialize with default values', () => {
    const { result } = renderHook(() => useDashboardStore());

    expect(result.current.filters).toEqual(defaultDashboardFilter);
    expect(result.current.widgets).toEqual(defaultOverallDashboardLayout);
    expect(result.current.myItemsFilters).toEqual(defaultMyItemsFilter);
    expect(result.current.myItemsWidgets).toEqual(
      defaultMyItemsDashboardLayout
    );
    expect(result.current.id).toBeUndefined();
  });

  it('should initialize with default value for dashboard', () => {
    const { result } = renderHook(() => useDashboardStore());
    expect(result.current.selectedDashboard).toBe('my-items');
  });

  it('should set filters', () => {
    const { result } = renderHook(() => useDashboardStore());
    const newFilters = {
      departments: ['HR'],
      tags: ['urgent'],
      dateRange: null,
    };

    act(() => {
      result.current.setFilters(newFilters);
    });

    expect(result.current.filters).toEqual(newFilters);
    expect(
      JSON.parse(localStorage.getItem('Dashboard-PreferencesV3')!)
    ).toMatchObject({ filters: newFilters });
  });

  it('should set widgets', () => {
    const { result } = renderHook(() => useDashboardStore());
    const newWidgets: StoredWidgetPlacement[] = [
      {
        id: 'test-widget-1',
        widgetType: 'kpi',
        rowSpan: 4,
        columnSpan: 2,
      },
    ];

    act(() => {
      result.current.setWidgets(newWidgets);
    });

    expect(result.current.widgets).toEqual(newWidgets);
    expect(
      JSON.parse(localStorage.getItem('Dashboard-PreferencesV3')!)
    ).toMatchObject({ widgets: newWidgets });
  });

  it('should set id', () => {
    const { result } = renderHook(() => useDashboardStore());
    const newId = 'dashboard-id';

    act(() => {
      result.current.setId(newId);
    });

    expect(result.current.id).toBe(newId);
    expect(
      JSON.parse(localStorage.getItem('Dashboard-PreferencesV3')!)
    ).toMatchObject({ id: newId });
  });

  it('should set dashboard preferences', () => {
    const { result } = renderHook(() => useDashboardStore());
    const newPreferences = {
      filters: { departments: ['IT'], tags: ['important'], dateRange: null },
      widgets: [
        {
          id: 'test-widget-2',
          widgetType: 'openIssueSeverity',
          rowSpan: 4,
          columnSpan: 2,
        },
      ],
      id: 'new-dashboard-id',
      myItemsWidgets: defaultMyItemsDashboardLayout,
      myItemsFilters: {
        contributor: false,
        groupContributor: false,
        groupOwner: false,
        inheritedContributor: false,
        inheritedGroupContributor: false,
        inheritedGroupOwner: false,
        inheritedOwner: false,
        owner: true,
      },
    };

    act(() => {
      result.current.setDashboardPreferences(newPreferences);
    });

    expect(result.current.filters).toEqual(newPreferences.filters);
    expect(result.current.widgets).toEqual(newPreferences.widgets);
    expect(result.current.id).toBe(newPreferences.id);
    expect(
      JSON.parse(localStorage.getItem('Dashboard-PreferencesV3')!)
    ).toEqual(newPreferences);
  });
});
