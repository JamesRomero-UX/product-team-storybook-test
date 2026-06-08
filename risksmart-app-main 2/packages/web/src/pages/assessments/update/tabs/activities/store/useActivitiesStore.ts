import { create } from 'zustand';

import type {
  ActivityItemType,
  DeleteTypeEnum,
  RCSAActivityItemType,
} from '../types';

type ActivitiesState = {
  selectedActivities: ActivityItemType[];
  setSelectedActivities: (selectedActivities: ActivityItemType[]) => void;
  selectedRCSAActivities: RCSAActivityItemType[];
  setSelectedRCSAActivities: (
    selectedActivities: RCSAActivityItemType[]
  ) => void;
  deleteType: DeleteTypeEnum | undefined;
  setDeleteType: (deleteType: DeleteTypeEnum) => void;
  isActivityDeleteModalVisible: boolean;
  setIsActivityDeleteModalVisible: (
    isActivityDeleteModalVisible: boolean
  ) => void;
};

export const useActivitiesStore = create<ActivitiesState>((set) => ({
  selectedActivities: [],
  setSelectedActivities: (selectedActivities: ActivityItemType[]) =>
    set({ selectedActivities }),
  selectedRCSAActivities: [],
  setSelectedRCSAActivities: (selectedRCSAActivities: RCSAActivityItemType[]) =>
    set({ selectedRCSAActivities }),
  deleteType: undefined,
  setDeleteType: (deleteType: DeleteTypeEnum) => set({ deleteType }),
  isActivityDeleteModalVisible: false,
  setIsActivityDeleteModalVisible: (isActivityDeleteModalVisible: boolean) =>
    set({ isActivityDeleteModalVisible }),
}));
