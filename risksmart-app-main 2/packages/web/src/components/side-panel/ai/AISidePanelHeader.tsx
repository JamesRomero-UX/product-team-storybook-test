import { X } from '@untitled-ui/icons-react';
import clsx from 'clsx';
import type { FC, ReactNode } from 'react';

import { useSidePanelStore } from '@/components/side-panel/useSidePanelStore';

import styles from './AISidePanel.module.scss';

interface AISidePanelHeaderProps {
  onClose?: () => void;
  toolbarButtons?: ReactNode[];
}

export const AISidePanelHeader: FC<AISidePanelHeaderProps> = ({
  onClose,
  toolbarButtons,
}) => {
  function close() {
    if (onClose) {
      onClose();
    }
    closeSidePanel();
  }

  const { close: closeSidePanel } = useSidePanelStore();

  return (
    <div
      className={clsx(
        styles.sidePanelHeader,
        'flex flex-row items-center justify-between py-4 px-6'
      )}
    >
      <h3 className={'text-2xl font-[Sora,sans-serif]'}>{'AI Assistant'}</h3>
      <div className={styles.sidePanelHeaderButtons}>
        {toolbarButtons?.map((button, index) => {
          return <div key={index}>{button}</div>;
        })}
        <button onClick={close} title={'Close'}>
          <X />
        </button>
      </div>
    </div>
  );
};
