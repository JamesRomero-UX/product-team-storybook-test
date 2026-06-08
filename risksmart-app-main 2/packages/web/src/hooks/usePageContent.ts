import type { ReactNode } from 'react';
import { create } from 'zustand';

interface PageContentState {
  content: ReactNode;
  setContent: (content: ReactNode) => void;
  clearContent: () => void;
}

const usePageContentStore = create<PageContentState>((set) => ({
  content: null,
  setContent: (content) => set({ content }),
  clearContent: () => set({ content: null }),
}));

/**
 * Hook for managing page-specific content that should be displayed in the tools panel
 * when toolsContent is set to 'page-content'.
 *
 * This allows individual pages (like dashboards) to register their own content
 * for the tools panel without needing to pass it through the layout props.
 */
export const usePageContent = () => {
  const { content, setContent, clearContent } = usePageContentStore();

  return {
    content,
    setPageContent: setContent,
    clearPageContent: clearContent,
  } as const;
};
