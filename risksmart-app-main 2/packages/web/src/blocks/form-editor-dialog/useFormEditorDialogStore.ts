import { create } from 'zustand';

interface FormEditorDialogState {
  openSections: string[];
  setOpenSections: (sections: string[]) => void;
  toggleSwitchSection: (value: string, checked: boolean) => void;
}

export const useFormEditorDialogStore = create<FormEditorDialogState>(
  (set) => ({
    openSections: [],
    setOpenSections: (sections) => set({ openSections: sections }),
    toggleSwitchSection: (value, checked) =>
      set((state) => ({
        openSections: checked
          ? [...state.openSections, value]
          : state.openSections.filter((v) => v !== value),
      })),
  })
);
