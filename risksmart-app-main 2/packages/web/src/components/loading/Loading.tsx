import Spinner from '@risk-smart/themed-cloudscape-components/spinner';
import type { FC } from 'react';

import styles from './style.module.scss';

const Loading: FC = (props) => (
  <div data-testid={'loading'} className={styles.loadingContainer} {...props}>
    <Spinner size={'large'} />
  </div>
);

export default Loading;
