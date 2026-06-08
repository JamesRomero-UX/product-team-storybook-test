import { create } from 'zustand';

interface NavMenuState {
  isNavigationOpen: boolean;
}

interface NavMenuActions {
  setNavigationOpen: (isNavigationOpen: boolean) => void;
}

const STORAGE_KEY = 'NavMenu-Preferences';

const getInitialState = (): boolean => {
  if (typeof window === 'undefined') {
    return true;
  }

  try {
    const item = window.localStorage.getItem(STORAGE_KEY);

    return item ? JSON.parse(item) : true;
  } catch {
    return true;
  }
};

export const useNavMenuStore = create<NavMenuState & NavMenuActions>((set) => ({
  // State
  isNavigationOpen: getInitialState(),

  // Actions
  setNavigationOpen: (isOpen: boolean) => {
    try {
      if (typeof window !== 'undefined') {
        window.localStorage.setItem(STORAGE_KEY, JSON.stringify(isOpen));
      }
    } catch {
      // Ignore storage errors
    }

    set({ isNavigationOpen: isOpen });
  },
}));
