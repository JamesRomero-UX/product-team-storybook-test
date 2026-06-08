import clsx from 'clsx';
import type { FC, ReactNode } from 'react';

import styles from './style.module.scss';

interface Props {
  header: ReactNode;
  content: ReactNode;
}

export const SidePanelContainer: FC<Props> = ({ header, content }) => {
  return (
    <div
      className={clsx(
        'grid grid-rows-[fit-content(2rem)_auto] h-full bg-white font-[Sora,sans-serif] text-sm',
        styles.sidePanelContainer
      )}
    >
      {header}
      {content}
    </div>
  );
};
