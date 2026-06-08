import type { FC } from 'react';

import { useSidePanelStore } from '@/components/side-panel/useSidePanelStore';

export const SidePanel: FC = () => {
  const { content } = useSidePanelStore();

  if (content) {
    return content;
  }

  return null;
};
