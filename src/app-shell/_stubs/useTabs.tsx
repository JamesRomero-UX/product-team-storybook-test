// Stub for src/hooks/useTabs — returns the tabs unchanged plus active id.
import { useState } from 'react';

const useTabs = (tabs: any[] = [], defaultId?: string) => {
  const [activeTabId, setActiveTabId] = useState<string | undefined>(
    defaultId ?? tabs[0]?.id,
  );
  return {
    tabs,
    activeTabId,
    setActiveTabId,
    handleTabsChange: ({ detail }: any) => setActiveTabId(detail.activeTabId),
  } as any;
};

export default useTabs;
export { useTabs };
