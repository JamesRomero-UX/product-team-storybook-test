import { create } from 'zustand/index';

export type ToolsContent =
  | 'help'
  | 'notifications'
  | 'page-content'
  | 'wizard'
  | `change-request:${string}`
  | undefined;

interface ToolsState {
  toolsContent: ToolsContent;
  pathname: string;
  setToolsContent: (toolsContent: ToolsContent) => void;
  locationChanged: (pathname: string) => void;
}

const useToolsStore = create<ToolsState>((set, get) => ({
  toolsContent: undefined,
  pathname: '',
  setToolsContent: (toolsContent) => set({ toolsContent }),
  locationChanged: (pathname) => {
    const { pathname: prevPathname, toolsContent } = get();

    // Only process if pathname actually changed
    if (pathname === prevPathname) {
      return;
    }

    // Close the right panel when user navigates to a new route, except when:
    // - the current content is notifications
    // - the current content is a change-request and we're on an actions page
    // - the current path includes risk and the content is for the RCSA wizard
    const shouldKeepOpen =
      (toolsContent?.includes('change-request') &&
        pathname.includes('actions/')) ||
      toolsContent === 'notifications' ||
      (toolsContent === 'wizard' && pathname.includes('risks/'));

    set({
      pathname,
      toolsContent: shouldKeepOpen ? toolsContent : undefined,
    });
  },
}));

export const useTools = () => {
  const { toolsContent, setToolsContent, locationChanged } = useToolsStore();

  return [toolsContent, setToolsContent, locationChanged] as const;
};
