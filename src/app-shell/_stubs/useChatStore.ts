// Zustand-shape stub. The production hook supports both selector and bare
// invocation — accept any selector arg and apply it against our default state.
const state = {
  isOpen: false,
  setIsOpen: (_v: boolean) => {},
  open: () => {},
  close: () => {},
  toggle: () => {},
  messages: [],
};

export const useChatStore = (selector?: (s: typeof state) => any) =>
  (selector ? selector(state) : state) as any;

export default useChatStore;
