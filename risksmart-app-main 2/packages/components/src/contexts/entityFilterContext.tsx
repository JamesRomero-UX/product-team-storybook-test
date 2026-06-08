import { create } from 'zustand';

export interface EntityFilter {
  entityIds: string[];
  setEntityIds: (entityIds: string[]) => void;
}

export const useEntityFilter = create<EntityFilter>((set) => ({
  entityIds: [],
  setEntityIds: (entityIds) => set({ entityIds }),
}));
