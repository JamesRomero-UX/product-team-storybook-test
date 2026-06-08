import type { HeaderProps } from '@risk-smart/themed-cloudscape-components/header';
import Header from '@risk-smart/themed-cloudscape-components/header';
import type { FC } from 'react';

import styles from './TabHeader.module.scss';

const TabHeader: FC<HeaderProps> = ({
  children,
  variant = 'h2',
  headingTagOverride = 'h2',
  ...rest
}) => {
  return (
    <div className={styles.header} data-testid={'tab-header'}>
      <Header
        variant={variant}
        headingTagOverride={headingTagOverride}
        {...rest}
      >
        <span data-testid={'tab-title'}>{children}</span>
      </Header>
    </div>
  );
};

export default TabHeader;
