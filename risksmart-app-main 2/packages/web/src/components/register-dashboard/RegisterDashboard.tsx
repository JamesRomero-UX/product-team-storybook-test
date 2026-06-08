import Container from '@risk-smart/themed-cloudscape-components/container';
import type { FC, ReactNode } from 'react';

import styles from './style.module.scss';

type RegisterDashboardProps = { children: ReactNode };

const RegisterDashboard: FC<RegisterDashboardProps> = ({ children }) => (
  <Container variant={'default'}>
    <div className={styles.container}>{children}</div>
  </Container>
);

export default RegisterDashboard;
