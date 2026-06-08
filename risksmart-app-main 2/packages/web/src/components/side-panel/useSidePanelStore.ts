import { type ReactNode } from 'react';
import { create } from 'zustand';

type SidePanelKey = 'chat' | 'suggest_controls';

export interface SidePanelState {
  isOpen: boolean;
  isWidePanel: boolean;
  //no-dd-sa
  closeOnLocationChange: boolean;
  close: () => void;
  locationChanged: () => void;
  content: ReactNode | undefined | null;
  key: SidePanelKey | undefined;
  open: (
    key: SidePanelKey,
    content: ReactNode,
    closeOnLocationChange: boolean,
    isWidePanelRequired: boolean
  ) => void;
}

export const useSidePanelStore = create<SidePanelState>((set) => ({
  isOpen: false,
  isWidePanel: false,
  closeOnLocationChange: true,
  content: undefined,
  key: undefined,
  close: () => {
    set(() => ({
      isOpen: false,
      content: undefined,
    }));
  },
  locationChanged: () => {
    set((state) => {
      let content = state.content;

      if (state.closeOnLocationChange) {
        content = undefined;
      }

      return {
        isOpen: state.isOpen && !state.closeOnLocationChange,
        content,
      };
    });
  },
  open: (
    key: SidePanelKey,
    content: ReactNode,
    shouldCloseOnLocationChange: boolean,
    isWidePanelRequired: boolean
  ) => {
    set(() => ({
      key,
      content,
      isOpen: true,
      isWidePanel: isWidePanelRequired,
      closeOnLocationChange: shouldCloseOnLocationChange,
    }));
  },
}));
