import type { ButtonDropdownProps } from '@risk-smart/themed-cloudscape-components/button-dropdown';
import DefaultButtonDropdown from '@risk-smart/themed-cloudscape-components/button-dropdown';
import type { FC } from 'react';

import styles from './style.module.scss';

interface Props extends ButtonDropdownProps {
  noPadding?: boolean;
}

const ButtonDropdown: FC<Props> = ({ noPadding, ...rest }) => {
  return (
    <span className={styles.buttonDropdown}>
      <span className={noPadding ? '' : styles.buttonDropdownWithPadding}>
        <DefaultButtonDropdown {...rest} />
      </span>
    </span>
  );
};

export default ButtonDropdown;
