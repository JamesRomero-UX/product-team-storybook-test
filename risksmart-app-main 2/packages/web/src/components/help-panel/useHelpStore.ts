import { create } from 'zustand';

export type Content = { title: string; content: string }[] | string;

export type FieldContent = {
  title: string;
  content: string;
};

export type HelpContent = FieldContent[];

type FormFieldHelpContent = {
  [fieldId: string]: FieldContent;
};

type HelpState = {
  formFieldHelpContent: FormFieldHelpContent;
  translationKey: string;
  setTranslationKey: (key: string) => void;
  contentId: null | string;
  setContentId: (id: null | string) => void;
  summaryHelpContent: HelpContent;
  setSummaryHelpContent: (content: HelpContent) => void;
  getHasHelpContent: () => boolean;
  addFieldHelp: (fieldId: string, helpContent: FieldContent) => void;
  removeFieldHelp: (fieldId: string) => void;
};

export const useHelpStore = create<HelpState>((set, get) => ({
  formFieldHelpContent: {},

  translationKey: '',
  setTranslationKey: (key) => set({ translationKey: key }),

  contentId: null,
  setContentId: (id) => set({ contentId: id }),

  summaryHelpContent: [],
  setSummaryHelpContent: (content) => set({ summaryHelpContent: content }),

  getHasHelpContent: () => {
    const state = get();

    return (
      (state.summaryHelpContent.length &&
        (state.summaryHelpContent[0].title !== '' ||
          state.summaryHelpContent[0].content !== '')) ||
      !!Object.keys(state.formFieldHelpContent).length
    );
  },

  // Actions
  addFieldHelp: (fieldId, helpContent) =>
    set((state) => ({
      formFieldHelpContent: {
        ...state.formFieldHelpContent,
        [fieldId]: helpContent,
      },
    })),

  removeFieldHelp: (fieldId) =>
    set((state) => {
      const { [fieldId]: _, ...rest } = state.formFieldHelpContent;

      return { formFieldHelpContent: rest };
    }),
}));
