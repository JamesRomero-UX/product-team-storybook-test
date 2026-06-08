import { useCallback, useState } from 'react';

import type { FilterModal } from '@/components/customisable-ribbon/customisableRibbonModalSchema';

export const useRibbonAndExport = (
  useGetDefaultFilters: () => FilterModal[]
) => {
  // Call provided getter as a hook at the top level (no set method needed)
  const defaultRibbonFilters = useGetDefaultFilters();
  const [activeRibbonFilters, setActiveRibbonFilters] =
    useState<FilterModal[]>(defaultRibbonFilters);

  const handleFiltersChange = useCallback((filters: FilterModal[]) => {
    setActiveRibbonFilters(filters);
  }, []);

  const getActiveRibbonFilters = useCallback(() => {
    return activeRibbonFilters;
  }, [activeRibbonFilters]);

  return {
    ribbonProps: {
      defaultFilters: defaultRibbonFilters,
      onFiltersChange: handleFiltersChange,
    },
    ribbonExportProps: {
      getActiveRibbonFilters,
    },
    activeRibbonFilters,
  };
};
