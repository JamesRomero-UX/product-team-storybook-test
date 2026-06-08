import type { FC } from 'react';

import { AISidePanelHeader } from '@/components/side-panel/ai/AISidePanelHeader';
import { SidePanelContainer } from '@/components/side-panel/SidePanelContainer';

interface AISidePanelProps {
  onClose: () => void;
}

export const AISidePanel: FC<AISidePanelProps> = ({ onClose }) => {
  return (
    <SidePanelContainer
      header={
        <AISidePanelHeader
          onClose={onClose}
          toolbarButtons={[]}
        ></AISidePanelHeader>
      }
      content={<></>}
    ></SidePanelContainer>
  );
};
