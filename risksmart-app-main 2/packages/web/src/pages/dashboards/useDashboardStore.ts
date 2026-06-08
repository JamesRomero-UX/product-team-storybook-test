import type { DateRangePickerProps } from '@risk-smart/themed-cloudscape-components/date-range-picker';
import { useEffect } from 'react';
import { defaultDashboardFilter } from 'src/context/defaultDashboardFilter';
import { processWidgets } from 'src/context/processWidgets';
import { create } from 'zustand';

import { useIsFeatureFlagEnabled } from '@/hooks/useIsFeatureFlagEnabled';
import { useOrgScopedLocalStorage } from '@/hooks/useOrgScopedLocalStorage';

import type { DashboardView } from './dashboard-view-toggle/types';
import {
  defaultMyItemsDashboardLayout,
  defaultOverallDashboardLayout,
} from './defaultLayout';
import type { StoredWidgetPlacement } from './types';

export interface DashboardFilter {
  departments: string[];
  tags: string[];
  dateRange: DateRangePickerProps.Value | null;
}

export interface MyItemsFilter {
  owner: boolean;
  contributor: boolean;
  groupOwner: boolean;
  groupContributor: boolean;
  inheritedOwner: boolean;
  inheritedContributor: boolean;
  inheritedGroupOwner: boolean;
  inheritedGroupContributor: boolean;
}

export type State = {
  id?: string;
  filters: DashboardFilter;
  widgets: StoredWidgetPlacement[];
  myItemsFilters: MyItemsFilter;
  myItemsWidgets: StoredWidgetPlacement[];
  selectedDashboard: DashboardView;
};

export type OverallDashboardState = Omit<
  State,
  'myItemsFilters' | 'myItemsWidgets' | 'selectedDashboard'
>;

export type Actions = {
  setFilters: (filters: DashboardFilter) => void;
  setWidgets: (widgets: StoredWidgetPlacement[]) => void;
  setMyItemsFilters: (filters: MyItemsFilter) => void;
  setMyItemsWidgets: (widgets: StoredWidgetPlacement[]) => void;
  setId: (id: string) => void;
  setDashboardPreferences: (
    dashboardPreferences: OverallDashboardState,
    myItemsWidgets?: StoredWidgetPlacement[]
  ) => void;
  setSelectedDashboard: (selectedDashboard: DashboardView) => void;
};

export const defaultMyItemsFilter: MyItemsFilter = {
  owner: true,
  contributor: false,
  groupOwner: false,
  groupContributor: false,
  inheritedOwner: false,
  inheritedContributor: false,
  inheritedGroupOwner: false,
  inheritedGroupContributor: false,
};

const useInternalDashboardStore = create<State & Actions>()((set) => {
  return {
    filters: defaultDashboardFilter,
    widgets: [],
    myItemsFilters: defaultMyItemsFilter,
    myItemsWidgets: [],
    selectedDashboard: 'my-items',
    setFilters: (filters: DashboardFilter) => set({ filters }),
    setWidgets: (widgets: StoredWidgetPlacement[]) =>
      set({ widgets: processWidgets(widgets) }),
    setMyItemsFilters: (myItemsFilters: MyItemsFilter) =>
      set({ myItemsFilters }),
    setMyItemsWidgets: (myItemsWidgets: StoredWidgetPlacement[]) =>
      set({ myItemsWidgets: processWidgets(myItemsWidgets) }),
    setId: (id: string) => set({ id }),
    setDashboardPreferences: (
      dashboardPreferences: OverallDashboardState,
      myItemsWidgets?: StoredWidgetPlacement[]
    ) => set({ ...dashboardPreferences, myItemsWidgets }),
    setSelectedDashboard: (selectedDashboard: DashboardView) =>
      set({ selectedDashboard }),
  };
});

export const useDashboardStore = (): State & Actions => {
  const emptyDefaultDashboard = useIsFeatureFlagEnabled(
    'empty_default_dashboard'
  );
  const [storedValue, setValue] = useOrgScopedLocalStorage<
    Omit<State, 'selectedDashboard'>
  >(
    {
      filters: defaultDashboardFilter,
      widgets: emptyDefaultDashboard ? [] : defaultOverallDashboardLayout,
      myItemsWidgets: defaultMyItemsDashboardLayout,
      myItemsFilters: defaultMyItemsFilter,
    },
    {
      localStorageKey: 'Dashboard-PreferencesV3',
    }
  );

  const {
    filters: storeFilters,
    setFilters: setStoreFilters,
    widgets: storeWidgets,
    setWidgets: setStoreWidgets,
    myItemsWidgets: storeMyItemsWidgets,
    setMyItemsWidgets: setStoreMyItemsWidgets,
    myItemsFilters: storeMyItemsFilters,
    setMyItemsFilters: setStoreMyItemsFilters,
    id: storeId,
    setId: setStoreId,
    setDashboardPreferences: setStoreDashboardPreferences,
    selectedDashboard: storeSelectedDashboard,
    setSelectedDashboard: setStoreSelectedDashboard,
  } = useInternalDashboardStore();

  const setFilters = (filters: DashboardFilter) => {
    setStoreFilters(filters);
    setValue({
      filters,
      widgets: storeWidgets,
      myItemsWidgets: storeMyItemsWidgets,
      id: storeId,
      myItemsFilters: storeMyItemsFilters,
    });
  };

  const setWidgets = (widgets: StoredWidgetPlacement[]) => {
    setStoreWidgets(widgets);
    setValue({
      widgets,
      filters: storeFilters,
      myItemsWidgets: storeMyItemsWidgets,
      id: storeId,
      myItemsFilters: storeMyItemsFilters,
    });
  };

  const setMyItemsWidgets = (myItemsWidgets: StoredWidgetPlacement[]) => {
    setStoreMyItemsWidgets(myItemsWidgets);
    setValue({
      myItemsWidgets,
      filters: storeFilters,
      widgets: storeWidgets,
      id: storeId,
      myItemsFilters: storeMyItemsFilters,
    });
  };

  const setId = (id: string) => {
    setStoreId(id);
    setValue({
      id,
      filters: storeFilters,
      widgets: storeWidgets,
      myItemsWidgets: storeMyItemsWidgets,
      myItemsFilters: storeMyItemsFilters,
    });
  };

  const setDashboardPreferences = (
    dashboardPreferences: OverallDashboardState,
    myItemsWidgets?: StoredWidgetPlacement[],
    myItemsFilters?: MyItemsFilter
  ) => {
    setStoreDashboardPreferences(
      dashboardPreferences,
      myItemsWidgets ?? storeMyItemsWidgets
    );

    if (myItemsFilters) {
      setStoreMyItemsFilters(myItemsFilters);
    }

    setValue({
      id: dashboardPreferences.id ?? storeId,
      filters: dashboardPreferences.filters,
      widgets: dashboardPreferences.widgets,
      myItemsWidgets: myItemsWidgets ?? storeMyItemsWidgets,
      myItemsFilters: myItemsFilters ?? storeMyItemsFilters,
    });
  };

  const setMyItemsFilters = (myItemsFilters: MyItemsFilter) => {
    setStoreMyItemsFilters(myItemsFilters);
    setValue({
      id: storeId,
      filters: storeFilters,
      widgets: storeWidgets,
      myItemsWidgets: storeMyItemsWidgets,
      myItemsFilters,
    });
  };

  // If empty store then set initial values
  useEffect(() => {
    setDashboardPreferences(
      {
        filters: storedValue.filters,
        widgets: processWidgets(storedValue.widgets),
      },
      storedValue.myItemsWidgets ?? defaultMyItemsDashboardLayout,
      storedValue.myItemsFilters ?? defaultMyItemsFilter
    );
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return {
    filters: storeFilters,
    widgets: processWidgets(storeWidgets),
    myItemsFilters: storeMyItemsFilters,
    myItemsWidgets: processWidgets(storeMyItemsWidgets),
    id: storeId,
    selectedDashboard: storeSelectedDashboard,
    setFilters,
    setWidgets,
    setId,
    setDashboardPreferences,
    setMyItemsFilters,
    setMyItemsWidgets,
    setSelectedDashboard: setStoreSelectedDashboard,
  };
};
