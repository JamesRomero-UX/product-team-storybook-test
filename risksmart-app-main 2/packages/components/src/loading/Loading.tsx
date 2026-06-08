import Spinner from '@risk-smart/themed-cloudscape-components/spinner';
import type { FC } from 'react';

import styles from './style.module.scss';

const Loading: FC<{ testId?: string }> = ({ testId }) => (
  <div data-testid={testId || 'loading'} className={styles.loadingContainer}>
    <Spinner size={'large'} />
  </div>
);

export default Loading;
