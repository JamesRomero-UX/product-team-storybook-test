const state = {
  isOpen: false,
  open: () => {},
  close: () => {},
  key: null,
  isWidePanel: false,
  locationChanged: () => {},
  setKey: () => {},
};

export const useSidePanelStore = (selector?: (s: typeof state) => any) =>
  (selector ? selector(state) : state) as any;

export default useSidePanelStore;
