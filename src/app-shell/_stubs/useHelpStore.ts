const state = {
  contentId: null,
  setContentId: (_id: string | null) => {},
  getHasHelpContent: () => false,
  hasHelpContent: false,
  isOpen: false,
  open: () => {},
  close: () => {},
};

export const useHelpStore = (selector?: (s: typeof state) => any) =>
  (selector ? selector(state) : state) as any;

export default useHelpStore;
