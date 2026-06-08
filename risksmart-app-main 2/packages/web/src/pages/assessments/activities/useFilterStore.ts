import type { PropertyFilterQuery } from '@cloudscape-design/collection-hooks';
import { create } from 'zustand';

type MyEntityState = {
  RCSAActivityFilter: PropertyFilterQuery;
  setRCSAActivityFilter: (filter: PropertyFilterQuery) => void;
};

export const useFilterStore = create<MyEntityState>((set) => ({
  RCSAActivityFilter: {
    tokens: [],
    operation: 'and',
  },
  setRCSAActivityFilter: (filter: PropertyFilterQuery) =>
    set({ RCSAActivityFilter: filter }),
}));
