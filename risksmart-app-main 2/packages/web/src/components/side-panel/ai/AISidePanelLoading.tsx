import type { FC } from 'react';

import styles from './AISidePanelLoading.module.scss';

export const AISidePanelLoading: FC = () => {
  return (
    <div
      className={styles.loadingContainer}
      role={'img'}
      aria-label={'Loading'}
    >
      <div className={styles.fuzzyBall}>
        <div className={styles.fuzzyBallCore}></div>
      </div>
    </div>
  );
};
